// lib/strapi.ts (server-side helper)
export const STRAPI_URL = process.env.STRAPI_URL || 'http://localhost:1337'
export const STRAPI_TOKEN = process.env.STRAPI_TOKEN || ''

/**
 * Fetches all active Question entries from Strapi.
 * Returns array of Strapi items (data.*) to be mapped by caller.
 *
 * This helper is server-oriented. Use it from server components or API routes.
 */
export async function fetchQuestionsFromStrapi(): Promise<any[]> {
  const url = `${STRAPI_URL}/api/questions?filters[isActive][$eq]=true&sort=order:asc&pagination[pageSize]=200&populate=*`
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (STRAPI_TOKEN) headers['Authorization'] = `Bearer ${STRAPI_TOKEN}`

  const res = await fetch(url, { headers })
  // If Strapi responds with non-2xx, return an error that includes body for debugging
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    // throw an Error so caller (API route) can respond appropriately
    throw new Error(`Strapi responded ${res.status}: ${text || res.statusText}`)
  }
  const json = await res.json()
  return json.data || []
}
