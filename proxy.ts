import { NextRequest, NextResponse } from 'next/server'

// Language routing for app/[lang]. English keeps its unprefixed public URLs and
// is rewritten internally to /en/...; German lives at /de/... and passes
// through; a public /en/... URL 308s to the unprefixed one so each English page
// has exactly one URL.
const GERMAN = /^\/de(?:\/|$)/
const ENGLISH = /^\/en(?:\/|$)/
// Marks the internal /en/... request made by the rewrite below. The standalone
// server runs the proxy again on that request; without the mark it would 308
// it back to the public URL and loop.
const REWRITTEN = 'x-lang-rewrite'

export function proxy(req: NextRequest) {
  const host = req.headers.get('host') ?? ''

  // Fallback www -> apex 301 redirect. Preferred long-term fix is a Cloudflare
  // Redirect Rule at the edge; this keeps the canonical host correct if that rule
  // is ever absent. Apex/localhost requests pass straight through.
  if (host.startsWith('www.')) {
    const url = req.nextUrl.clone()
    url.protocol = 'https'
    url.host = host.replace(/^www\./, '')
    // The standalone server listens on :3000; nextUrl carries that port and the
    // WHATWG host setter keeps it when the new host has none. Clear it so the
    // redirect target is the public apex (https://edrishusein.com), not :3000.
    url.port = ''
    return NextResponse.redirect(url, 301)
  }

  const { pathname } = req.nextUrl

  if (GERMAN.test(pathname)) return NextResponse.next()

  if (ENGLISH.test(pathname)) {
    if (req.headers.get(REWRITTEN) === '1') return NextResponse.next()
    // Built from the Host header: nextUrl carries the server's own host and
    // port (localhost:3000 behind the reverse proxy), see the www branch above.
    const proto = req.headers.get('x-forwarded-proto')?.split(',')[0].trim() || req.nextUrl.protocol.replace(':', '')
    const target = new URL((pathname.replace(/^\/en/, '') || '/') + req.nextUrl.search, `${proto}://${host || req.nextUrl.host}`)
    return NextResponse.redirect(target, 308)
  }

  const url = req.nextUrl.clone()
  url.pathname = pathname === '/' ? '/en' : `/en${pathname}`
  const headers = new Headers(req.headers)
  headers.set(REWRITTEN, '1')
  return NextResponse.rewrite(url, { request: { headers } })
}

// Everything except Next internals, files with an extension (robots.txt,
// sitemap.xml, icons, public assets), the Sentry tunnel and API routes.
export const config = { matcher: '/((?!_next/|monitoring|api/|.*\\..*).*)' }
