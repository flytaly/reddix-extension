import { reactive } from 'vue'
import { onMessage, sendMessage } from 'webext-bridge/options'

export const store = reactive({
  isFetching: false,
  fetchError: '',
})

export async function initiate() {
  sendMessage('get-state', null) //
    .then((state) => {
      Object.assign(store, state)
    })

  onMessage('state-update', ({ data }) => {
    Object.assign(store, data)
  })
}

void initiate()
