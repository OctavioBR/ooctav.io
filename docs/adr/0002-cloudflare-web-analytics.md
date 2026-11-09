# 0002 — Cloudflare Web Analytics for visitor stats

- **Status:** Accepted
- **Date:** 2026-11-09

## Context

We want to know how many people visit the site, which pages they read, and where they come from. The constraints are: free, privacy-friendly with no cookie banner (LGPD/GDPR), and as little client JS as possible (ADR-0001).

Cloudflare's zone traffic analytics already count requests at the edge with no JS. They count requests, not visitors. Bots and asset fetches inflate them, and they don't show referrers or per-page views.

## Decision

Use **Cloudflare Web Analytics** (RUM). Load its beacon from `src/layouts/Base.astro` in production builds only (`import.meta.env.PROD`).

### Setup

- The account has one Web Analytics site linked to the `ooctav.io` zone. Its site tag is `cb82a15aec7d44e3945e40389d499e7e`, and its token is in the snippet. The token is public by design.
- We add the snippet by hand. The site's `auto_install` setting is `true`, but Cloudflare doesn't inject the beacon into responses from our Worker's static assets. On 2026-11-09 the live HTML had no beacon. The API won't let a zone-linked site turn `auto_install` off (`autoInstallRequired`), so the setting stays on and has no effect.
- To inspect it from the CLI:

  ```sh
  cf rum site-info list                    # site tag, token, snippet
  cf zones rum get --zone ooctav.io        # RUM on/off for the zone
  ```

- If you recreate the site, update the token in `Base.astro`.
- If you add a CSP header to `public/_headers`, allow `script-src https://static.cloudflareinsights.com` and `connect-src https://cloudflareinsights.com`.

### Benefits

- It's free, with no limit on events, and needs no new vendor or account.
- It sets no cookies and doesn't fingerprint visitors, so the site needs no consent banner.
- It reports page views, visits, top pages, referrers, countries and devices.
- It also measures Core Web Vitals (LCP, INP, CLS) from real visitors, which complements the lab Lighthouse numbers.

### Cost (measured)

We ran Lighthouse on `/` with the default mobile preset, against a production build served by `astro preview`, 3 runs each. Medians:

| Metric | Without beacon | With beacon |
|---|---|---|
| Performance score | 100 | 100 |
| FCP / LCP | 752 ms | 751 ms |
| Total blocking time | 0 ms | 0 ms (one run at 8 ms) |
| CLS | 0 | 0 |
| Total transfer | 138.6 KB | 149.1 KB (+10.5 KB, +7.6%) |
| Requests | 5 | 8 (+1 script, +2 beacon POSTs) |

- `beacon.min.js` is 10.5 KB compressed and 31.9 KB parsed. Cloudflare caches it for one day (`max-age=86400`), from a third-party origin.
- The script is `defer`, so it doesn't block rendering and doesn't change FCP or LCP.
- This is the site's first script. That's a deliberate exception to "no client JS" in ADR-0001.

## Consequences

- **Good:** we get visitor numbers and field Web Vitals at almost no performance cost.
- **Bad:**
  - The site now ships about 10 KB of third-party JS on every page, and depends on `static.cloudflareinsights.com`.
  - Ad blockers block the beacon, so visitor counts are underestimated.
  - It doesn't support custom events, such as link clicks.
