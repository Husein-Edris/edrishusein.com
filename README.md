# edrishusein.com

My portfolio site. I built it on Next.js and run the content from a headless WordPress install, so I can edit projects, posts, and the homepage from wp-admin without touching the code or redeploying.

## Stack

- Next.js 16 (App Router), React 19, TypeScript, SCSS
- WordPress as a headless CMS, read over its REST API with Advanced Custom Fields
- A static copy of the content baked into the repo for when the CMS is unreachable

## How the data works

Each page asks WordPress for its content over REST. If WordPress is slow or down, the page serves a static copy from `src/data/` instead of throwing, so visitors never hit a broken site. Cached reads use ISR with a 60-second window, which keeps responses fast and still picks up edits within a minute.

Older versions ran on GraphQL. I tore that layer out in 2026 and moved everything to REST.

## Finding your way around

- `src/lib/rest-client.ts` — the `cmsRest` wrapper every page uses to read WordPress
- `src/lib/data-fetcher.ts` — the fetch-then-fall-back logic
- `src/lib/transform/` — reshapes raw WordPress responses into what the components expect
- `src/lib/section-registry.ts` — assembles the homepage from ACF sections
- `src/components/InfoCards/` — one card component with skins for projects, blog, bookshelf, and tech
- `src/styles/variables.scss` — colors, spacing, and type

## Running it locally

```bash
npm install
npm run dev
```

Set `NEXT_PUBLIC_WORDPRESS_API_URL` in `.env.local` to point at a WordPress install. Skip that and the site renders straight from the static fallback data.

## Deploying

`deploy.sh` builds the standalone Next output and restarts it as a plain node process (PID file, port 3000) behind Apache on Plesk. It builds whatever sits in the working tree, so commit your changes first.

---

Built and maintained by Edris Husein. Questions about the build are welcome at kontakt@edrishusein.com.
