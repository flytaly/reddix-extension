import type { RedditError, RedditItemResponse } from './reddit-types'

const baseUrl = 'https://www.reddit.com'

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

export async function getPosts(username: string): Promise<[null, string] | ['ok', null]> {
  const url = getSavedUrl(username)
  try {
    const response = await fetch(url, { cache: 'reload' })
    const listing = (await response.json()) as RedditItemResponse | RedditError
    if (response.status !== 200 || !isListing(listing)) {
      return [null, formatError(listing as RedditError) || `${response.status} ${response.statusText}`]
    }
    console.log(listing)
  } catch (error) {
    return [null, (error as any as Error).message]
  }
  await new Promise((resolve) => setTimeout(resolve, 1000))
  return ['ok', null]
}
