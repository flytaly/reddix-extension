import type { RateLimits } from './rate-limits'
import { reqInfoStorage } from '~/logic/browser-storage'
import { getRateLimits } from './rate-limits'
import { RedditObjectKind } from './reddit-types'

export const baseUrl = 'https://www.reddit.com'

export function isPostData(data: RedditItem): data is RedditPostData {
  return data.name.startsWith(RedditObjectKind.link)
}

export function isCommentData(data: RedditItem): data is RedditCommentData {
  return data.name.startsWith(RedditObjectKind.comment)
}

function getSavedUrl(user: string) {
  return `${baseUrl}/user/${user}/saved.json`
}

function getUpvotedUrl(user: string) {
  return `${baseUrl}/user/${user}/upvoted.json`
}

function getInfoUrl(ids: string[]) {
  return `${baseUrl}/api/info.json?id=${ids.join(',')}`
}

function formatError(redditError: RedditError) {
  if (!redditError || !redditError.message)
    return ''

  let err = `Reddit Error: ${redditError.error} ${redditError.message}.`

  if (redditError.error !== '403')
    err = `${err}\nMake sure you are logged in to Reddit and have a valid username.`

  return err
}

function isListing(data: RedditItemResponse | RedditError): data is RedditItemResponse {
  if (!data)
    return false

  return (data as RedditItemResponse).kind === 'Listing'
}

export type ResponseOrError<T = RedditItemResponse> = [T | null, null] | [null, string]

export interface ItemFetchDetails {
  username: string
  after?: string
  category: ItemCategory
}

export async function fetchRedditItems(
  { username, after, category }: ItemFetchDetails,
  onRateLimitsCb = onRateLimits,
): Promise<ResponseOrError> {
  const url = category === 'upvoted' ? getUpvotedUrl(username) : getSavedUrl(username)

  const urlWithParams = `${url}?limit=100${after ? `&after=${after}` : ''}`

  let listing: RedditItemResponse

  try {
    const response = await fetch(urlWithParams, { cache: 'reload' })
    onRateLimitsCb?.(getRateLimits(response))

    const jsonResponse = (await response.json()) as RedditItemResponse | RedditError
    if (response.status !== 200 || !isListing(jsonResponse))
      return [null, formatError(jsonResponse as RedditError) || `${response.status} ${response.statusText}`]

    listing = jsonResponse
  }
  catch (error) {
    return [null, (error as any as Error).message]
  }

  return [listing, null]
}

export function onRateLimits(rl: RateLimits) {
  if (rl.reset)
    rl.reset = new Date(Date.now() + rl.reset * 1000).getTime()

  reqInfoStorage.value.rateLimits = rl
  return rl
}

export async function getItemsInfo(redditIds: string[], onRateLimitsCb = onRateLimits): Promise<ResponseOrError> {
  if (!redditIds?.length)
    return [null, '']

  const url = getInfoUrl(redditIds)
  let listing: RedditItemResponse
  try {
    const response = await fetch(url)
    onRateLimitsCb?.(getRateLimits(response))

    const jsonResponse = (await response.json()) as RedditItemResponse | RedditError
    if (response.status !== 200 || !isListing(jsonResponse))
      return [null, formatError(jsonResponse as RedditError) || `${response.status} ${response.statusText}`]

    listing = jsonResponse
  }
  catch (error) {
    return [null, (error as any as Error).message]
  }
  return [listing, null]
}
