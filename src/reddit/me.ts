import { baseUrl } from './index'
import { RedditObjectKind } from './reddit-types'

type MeResponse = {
  kind: RedditObjectKind.account
  data?: {
    name?: string
    modhash: string
    snoovatar_img?: string
  }
}

const url = `${baseUrl}/api/me.json`

export async function getUserInfo(): Promise<[MeResponse, null] | [null, string]> {
  let me: MeResponse

  try {
    const response = await fetch(url, { cache: 'reload' })

    me = (await response.json()) as MeResponse
    if (response.status !== 200 || me.kind !== RedditObjectKind.account || !me.data?.name || !me.data?.modhash) {
      console.error(me)
      return [null, 'Failed to get user information. Make sure you are logged in to Reddit.']
    }
  } catch (error) {
    return [null, (error as any as Error).message]
  }
  return [me, null]
}
