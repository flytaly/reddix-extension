const enum RateLimitHeaders {
  'remaining' = 'x-ratelimit-remaining',
  'reset' = 'x-ratelimit-reset',
  'used' = 'x-ratelimit-used',
}

export type RateLimits = {
  remaining?: number | null
  reset?: number | null
  used?: number | null
}

export function getRateLimits(response: Response): RateLimits {
  const rateLimits = {
    used: response.headers.get(RateLimitHeaders.used),
    reset: response.headers.get(RateLimitHeaders.reset),
    remaining: response.headers.get(RateLimitHeaders.remaining),
  }

  return {
    used: rateLimits.used ? parseInt(rateLimits.used) : null,
    reset: rateLimits.reset ? parseInt(rateLimits.reset) : null,
    remaining: rateLimits.remaining ? parseInt(rateLimits.remaining) : null,
  }
}
