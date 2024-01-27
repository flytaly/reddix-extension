const REDDIT_URL = 'https://www.reddit.com'

export function getFullLink(permalink: string) {
  return REDDIT_URL + permalink
}
