import { NextRequest, NextResponse } from 'next/server'

// Fallback www -> apex 301 redirect. Preferred long-term fix is a Cloudflare
// Redirect Rule at the edge; this keeps the canonical host correct if that rule
// is ever absent. Apex/localhost requests pass straight through.
export function proxy(req: NextRequest) {
  const host = req.headers.get('host') ?? ''
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
  return NextResponse.next()
}

export const config = { matcher: '/((?!_next/|.*\\..*).*)' }
