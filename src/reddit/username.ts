import { baseUrl } from './index'
import { RedditObjectKind } from './reddit-types'

type MeResponse = {
  kind: RedditObjectKind.account
  data?: {
    name?: string
    snoovatar_img?: string
  }
}

export async function getUsername(): Promise<[string, null] | [null, string]> {
  const url = `${baseUrl}/api/me.json`
  let name: string

  try {
    const response = await fetch(url, { cache: 'reload' })

    const jsonResponse = (await response.json()) as MeResponse
    if (response.status !== 200 || jsonResponse.kind !== RedditObjectKind.account || !jsonResponse.data?.name) {
      console.error(jsonResponse)
      return [
        null,
        'Failed to get username. Make sure you are logged in to Reddit and repeat, or type your username manually.',
      ]
    }
    name = jsonResponse.data?.name
  } catch (error) {
    return [null, (error as any as Error).message]
  }

  await new Promise((resolve) => setTimeout(resolve, 1000))

  return [name, null]
}
