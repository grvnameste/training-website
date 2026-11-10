// app/api/strapi/questions/route.ts
import { NextResponse } from 'next/server'
import { STRAPI_URL, STRAPI_TOKEN } from '@/lib/strapi'

async function tryFetchUrl(url: string, headers: Record<string,string>) {
  try {
    const res = await fetch(url, { headers })
    const text = await res.text().catch(() => '')
    let json: any = null
    try { json = text ? JSON.parse(text) : null } catch {}
    return { ok: res.ok, status: res.status, statusText: res.statusText, bodyText: text, bodyJson: json }
  } catch (err: any) {
    return { ok: false, status: 0, statusText: String(err?.message || err), bodyText: '' }
  }
}

export async function GET() {
  // sanity: ensure STRAPI_URL is present
  const base = STRAPI_URL || process.env.STRAPI_URL || process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337'
  const token = STRAPI_TOKEN || process.env.STRAPI_TOKEN || process.env.NEXT_PUBLIC_STRAPI_TOKEN || ''

  const headers: Record<string,string> = { 'Content-Type': 'application/json' }
  if (token) headers['Authorization'] = `Bearer ${token}`

  // API query used by the client — keep same query you used previously
  const query = '?filters[isActive][$eq]=true&sort=order:asc&pagination[pageSize]=200&populate=*'

  // candidate slugs to try if 'questions' returns 404
  const candidateSlugs = ['questions', 'questionnaires', 'question', 'questionnaire']

  const tried: Array<{ url: string; result: any }> = []

  for (const slug of candidateSlugs) {
    const url = `${base}/api/${slug}${query}`
    const result = await tryFetchUrl(url, headers)
    tried.push({ url, result })
    if (result.ok) {
      // success — return the data (if Strapi wraps in { data: [...] } return that)
      const data = result.bodyJson?.data ?? result.bodyJson ?? null
      return NextResponse.json({ data, sourceUrl: url })
    }
    // if 404 keep trying; if 401/403 you can stop and return that as auth issue
    if ([401, 403].includes(result.status)) {
      return NextResponse.json({
        error: `Auth error when fetching Strapi (status ${result.status})`,
        details: { tried }
      }, { status: result.status })
    }
  }

  // nothing found — return full debug info and 404
  console.error('Strapi fetch failed for all candidate slugs:', tried)
  return NextResponse.json({
    error: 'Could not fetch questions from Strapi. Tried multiple endpoints.',
    tried
  }, { status: 404 })
}
