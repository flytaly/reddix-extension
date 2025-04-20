import type { BgState } from './bg-state'
import type { RateLimits } from '~/reddit/rate-limits'
import { optionsStorage, reqInfoStorage, setupStorage, userName } from '~/logic/browser-storage'
import { savePosts } from '~/logic/db/mutations'
import { waitRateLimits } from '~/logic/wait-limits'
import { onMessage, sendMessage } from '~/messages'
import { fetchRedditItems, onRateLimits } from '~/reddit'
import { state } from './bg-state'
import devSetup from './dev-setup'

type Alarm = 'update'

devSetup()

function setStateAndNotify(updates: Partial<BgState>) {
  Object.assign(state, updates)
  sendMessage('state-update', state)
}

function getLastId(category: ItemCategory) {
  if (category === 'saved')
    return reqInfoStorage.value.lastSavedItemId
  else if (category === 'upvoted')
    return reqInfoStorage.value.lastUpvotedItemId
}

function setLastId(category: ItemCategory, id: string) {
  if (category === 'saved')
    reqInfoStorage.value.lastSavedItemId = id
  else if (category === 'upvoted')
    reqInfoStorage.value.lastUpvotedItemId = id
}

function setFetchDate(category: ItemCategory) {
  const ts = Date.now()
  reqInfoStorage.value.timestamp = ts
  if (category === 'saved')
    reqInfoStorage.value.lastSavedItemFetchTime = ts
  else if (category === 'upvoted')
    reqInfoStorage.value.lastUpvotedItemFetchTime = ts
}

async function fetchItems(username: string, category: ItemCategory, fetchAll = false) {
  let rateLimits: RateLimits | undefined
  let after: string = ''

  const stopAtId = fetchAll ? null : getLastId(category)

  const onRateLimitsWrap = (rl: RateLimits) => {
    rl = onRateLimits(rl)
    rateLimits = rl
    return rl
  }
  let end = false

  const itemsBuffer = [] as Array<RedditPostUnfiltered | RedditComment>
  while (!end) {
    end = true
    const [listing, errMsg] = await fetchRedditItems({ username, category, after }, onRateLimitsWrap)
    if (errMsg) {
      console.error(errMsg)
      setStateAndNotify({ fetchError: errMsg })
      break
    }
    if (!listing)
      break

    itemsBuffer.push(...listing.data.children)
    setStateAndNotify({ loaded: state.loaded + listing.data.children.length })

    if (!after)
      setLastId(category, listing.data.children[0].data.name)

    const nextAfter = listing.data.after
    end = !nextAfter || nextAfter === after || listing.data.children.length < 100
    after = nextAfter || ''

    if (stopAtId && !end)
      end = listing.data.children.findIndex(it => it.data.name === stopAtId) !== -1

    await waitRateLimits(rateLimits, console.log)
  }

  // reverse the order so the newer elements have a higher ID
  itemsBuffer.reverse()
  const savedNew = await savePosts(itemsBuffer, category)
  setStateAndNotify({ loaded: state.loaded, savedNew: state.savedNew + (savedNew || 0) })

  setFetchDate(category)
}

async function startFetching(username: string, category: ItemCategory, fetchAll = false) {
  if (state.isFetching)
    return

  setStateAndNotify({ isFetching: true, fetchError: '', loaded: 0, savedNew: 0 })
  await fetchItems(username, category, fetchAll)
  setStateAndNotify({ isFetching: false })
}

onMessage('fetch-items', async (msg) => {
  void startFetching(msg.data.username, msg.data.category, msg.data.options?.fetchAll)
  return state
})

onMessage('get-state', async () => {
  return state
})

onMessage('clear-fetch-error', () => {
  state.fetchError = ''
})

async function updateAndSchedule() {
  const interval = optionsStorage.value.updateInterval
  const lastUpdate = reqInfoStorage.value.timestamp || 0
  let nextUpdate = lastUpdate + interval

  if (lastUpdate && Date.now() < nextUpdate) {
    browser.alarms.create('update' as Alarm, { when: nextUpdate })
    console.log('DEBUG: too early, schedule next update', new Date(nextUpdate).toLocaleTimeString())
    return
  }

  if (userName.value && optionsStorage.value.autoUpdateSaved) {
    await startFetching(userName.value, 'saved', false)
    console.log('DEBUG: saved items updated', new Date().toLocaleString())
  }

  if (userName.value && optionsStorage.value.autoUpdateUpvoted) {
    await startFetching(userName.value, 'upvoted', false)
    console.log('DEBUG: upvoted posts updated', new Date().toLocaleTimeString())
  }

  nextUpdate = Date.now() + interval
  browser.alarms.create('update' as Alarm, { when: nextUpdate })
  console.log('DEBUG: schedule next update at', new Date(nextUpdate).toLocaleString())
}

setupStorage().then(() => {
  watch(
    optionsStorage,
    (opts) => {
      if (opts.autoUpdateSaved || opts.autoUpdateUpvoted) {
        updateAndSchedule()
      }
      else {
        console.log('DEBUG: clear update alarms')
        browser.alarms.clear('update' as Alarm)
      }
    },
    { immediate: true },
  )
})

browser.alarms.onAlarm.addListener((alarmInfo: { name: Alarm }) => {
  if (alarmInfo.name === 'update')
    void updateAndSchedule()
})
