import { RateLimits } from '~/reddit/rate-limits'

export async function waitRateLimits(rateLimits?: RateLimits, sendMessage?: (message: string) => void) {
  if (!rateLimits) return
  const remaining = rateLimits.remaining
  const reset = rateLimits.reset && new Date(rateLimits?.reset)
  if (!remaining || !reset || remaining > 1) {
    return
  }
  await new Promise<void>((resolve) => {
    const timeout = reset.getTime() - Date.now()
    sendMessage?.(`Rate limits. Wait until ${reset.toLocaleTimeString()} (${timeout / 1000} seconds).`)
    setTimeout(() => {
      resolve()
    }, timeout)
  })
}
