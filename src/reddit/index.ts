const baseUrl = 'https://www.reddit.com'

const getSavedUrl = (user: string) => {
  return `${baseUrl}/user/${user}/saved.json`
}

function formatError(redditError: { message: string; error: string }) {
  if (!redditError || !redditError.message) {
    return ''
  }
  let err = `Reddit Error: ${redditError.error} ${redditError.message}.`

  if (redditError.error !== '403') {
    err = `${err}\nMake sure you are logged in to Reddit and have a valid username.`
  }
  return err
}

export async function getPosts(username: string): Promise<[null, string] | ['ok', null]> {
  const url = getSavedUrl(username)
  try {
    const response = await fetch(url)
    const data = await response.json()
    if (response.status !== 200) {
      return [null, formatError(data) || `${response.status} ${response.statusText}`]
    }
    console.log('saved posts:', data)
  } catch (error) {
    return [null, (error as any as Error).message]
  }
  await new Promise((resolve) => setTimeout(resolve, 1000))
  return ['ok', null]
}
