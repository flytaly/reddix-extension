import { baseUrl } from './index'

const url = `${baseUrl}/api/unsave`

export async function unsave(itemName: string, modhash: string): Promise<null | string> {
  try {
    const resp = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'X-Modhash': modhash,
      },
      body: `id=${itemName}`,
    })
    if (resp.status === 200)
      return null

    console.error(resp)
    return `Could not unsave. Server returned status ${resp.status}`
  }
  catch (e) {
    return (e as any).message || 'Could not unsave'
  }
}
