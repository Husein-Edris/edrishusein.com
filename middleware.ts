import { NextRequest, NextResponse } from 'next/server'

// Fallback www -> apex 301 redirect. Preferred long-term fix is a Cloudflare
// Redirect Rule at the edge; this keeps the canonical host correct if that rule
// is ever absent. Apex/localhost requests pass straight through.
export function middleware(req: NextRequest) {
  const host = req.headers.get('host') ?? ''
  if (host.startsWith('www.')) {
    const url = req.nextUrl.clone()
    url.host = host.replace(/^www\./, '')
    url.protocol = 'https'
    return NextResponse.redirect(url, 301)
  }
  return NextResponse.next()
}

export const config = { matcher: '/((?!_next/|.*\\..*).*)' }
