// HIBP k-anonymity lookup: only the first 5 SHA-1 hex characters leave the
// server, so the plaintext password is never sent. Fails open on network
// errors so signup is not blocked by an upstream outage.

const HIBP_RANGE_URL = 'https://api.pwnedpasswords.com/range/'
const TIMEOUT_MS = 3000

async function sha1Hex(value: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-1', new TextEncoder().encode(value))
  return Array.from(new Uint8Array(digest), (byte) =>
    byte.toString(16).padStart(2, '0')
  )
    .join('')
    .toUpperCase()
}

export async function isBreachedPassword(password: string): Promise<boolean> {
  try {
    const hash = await sha1Hex(password)
    const response = await fetch(`${HIBP_RANGE_URL}${hash.slice(0, 5)}`, {
      headers: { 'Add-Padding': 'true' },
      signal: AbortSignal.timeout(TIMEOUT_MS),
      cache: 'no-store',
    })
    if (!response.ok) return false

    const suffix = hash.slice(5)
    const body = await response.text()
    return body.split('\n').some((line) => {
      const [candidate, count] = line.trim().split(':')
      return candidate === suffix && Number(count) > 0
    })
  } catch {
    return false
  }
}
