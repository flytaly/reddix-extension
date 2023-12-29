import { RateLimits, getRateLimits } from './rate-limits'
import type { RedditError, RedditItemResponse } from './reddit-types'

export const baseUrl = 'https://www.reddit.com'

const getSavedUrl = (user: string) => {
  return `${baseUrl}/user/${user}/saved.json`
}

function formatError(redditError: RedditError) {
  if (!redditError || !redditError.message) {
    return ''
  }
  let err = `Reddit Error: ${redditError.error} ${redditError.message}.`

  if (redditError.error !== '403') {
    err = `${err}\nMake sure you are logged in to Reddit and have a valid username.`
  }
  return err
}

function isListing(data: RedditItemResponse | RedditError): data is RedditItemResponse {
  if (!data) {
    return false
  }
  return (data as RedditItemResponse).kind === 'Listing'
}

export async function getPosts(
  username: string,
  onRateLimits?: (rl: RateLimits) => void,
): Promise<[RedditItemResponse | null, null] | [null, string]> {
  const url = getSavedUrl(username)
  const urlWithParams = url + '?limit=100'
  let listing: RedditItemResponse

  try {
    const response = await fetch(urlWithParams, { cache: 'reload' })
    onRateLimits?.(getRateLimits(response))

    const jsonResponse = (await response.json()) as RedditItemResponse | RedditError
    if (response.status !== 200 || !isListing(jsonResponse)) {
      return [null, formatError(jsonResponse as RedditError) || `${response.status} ${response.statusText}`]
    }
    listing = jsonResponse
  } catch (error) {
    return [null, (error as any as Error).message]
  }

  await new Promise((resolve) => setTimeout(resolve, 1000))

  return [listing, null]
}
