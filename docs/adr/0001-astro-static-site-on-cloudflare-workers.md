# 0001 — Astro static site on Cloudflare Workers, with Markdown for agents

- **Status:** Accepted
- **Date:** 2026-11-06

## Context

ooctav.io is a personal site. The first version has no blog. It has two things: a resume and a set of links to portfolio projects. The domain is registered at Hostinger.

Requirements:

1. Simple and stable to maintain. No server to run, and as little client-side JavaScript as possible.
2. Content written in Markdown, so it can be edited as plain text and served as-is.
3. AI agents can read every page as Markdown, without having to parse HTML.
4. A push to the `live` branch deploys to production automatically.

The stack follows the approach in Flavio Copes' [Why I use Astro](https://flaviocopes.com/why-i-use-astro/) and [Serving Markdown to AI agents](https://flaviocopes.com/serving-markdown-to-ai-agents/).

## Decision

### Framework: Astro, fully static

- Astro with the default `output: 'static'`. Every page is prerendered at build time, and the site ships no client JS unless a component opts in.
- The resume and portfolio entries are **content collections** stored as Markdown in `src/content/`. Pages render from those collections. Each piece of content lives in exactly one place.
- No `@astrojs/cloudflare` adapter is needed while the site stays fully static. Add it only if a page needs on-demand rendering (`prerender = false`).

### Hosting: Cloudflare Workers with static assets

- The site deploys as a Worker that serves only static assets: `wrangler.jsonc` sets `assets.directory = "./dist"` and has no `main` script. Requests for static assets are free and unmetered, so serving the site costs no Worker invocations.
- We use Workers and not Cloudflare Pages because Cloudflare now points new projects to Workers static assets. Workers also leave room to add a script later.
- `assets.not_found_handling = "404-page"` serves Astro's `404.html`.

### Domain and DNS

- Hostinger stays the **registrar**. The domain's **nameservers** change to Cloudflare, which makes Cloudflare the authoritative DNS. A Worker can only use a Custom Domain on a zone managed by Cloudflare.
- `ooctav.io` is attached to the Worker as a Custom Domain. `www.ooctav.io` redirects to the apex with a Cloudflare redirect rule.
- Before switching nameservers, copy any existing Hostinger DNS records you still need, such as email MX and TXT records, into the Cloudflare zone.

### Markdown for agents

We publish the Markdown source as static files at build time. We do not convert HTML at request time, because that would run on every request, including images and CSS. Cloudflare's built-in "Markdown for Agents" feature requires a Pro plan, so we don't rely on it.

- **`.md` twin for every page.** Astro endpoints such as `src/pages/index.md.ts` and `src/pages/resume.md.ts` read the same content collections and return the Markdown body, using `getStaticPaths()` where a route has several entries. Each response:
  - has the header `Content-Type: text/markdown; charset=utf-8`
  - starts with the page title, a short description, and the canonical URL
  - turns relative links into absolute `https://ooctav.io/...` URLs
- **Discovery:** the `<head>` of every HTML page includes `<link rel="alternate" type="text/markdown" href="/<page>.md">`.
- **`/llms.txt`:** a short index of the site that follows the [llmstxt.org](https://llmstxt.org) convention and links to each `.md` page.
- **`/llms-full.txt`:** all content concatenated into one Markdown file. The site is small, so one fetch gives an agent everything.
- **`robots.txt`:** explicitly allows AI crawlers such as GPTBot, ClaudeBot, and PerplexityBot, in addition to `User-agent: *`.
- **Cloudflare AI Crawl Control:** set the zone so it doesn't block the Search, Training, or Agent crawler categories. A block at the edge takes effect before `robots.txt` is ever read.

### Deployment: Workers Builds on the `live` branch

- Cloudflare **Workers Builds**, Cloudflare's Git integration, is connected to the GitHub repo `OctavioBR/ooctav.io`.
  - Production branch: `live`
  - Build command: `npm run build`
  - Deploy command: `npx wrangler deploy`
- A push to `live` builds the site and deploys it to production. Pushes to other branches, including `main`, deploy only as preview versions with their own URLs and never change production.
- We don't use GitHub Actions. Workers Builds needs no Cloudflare API token stored in GitHub secrets, and the build logs live next to the deployment.

## Consequences

- **Good:**
  - There's no server or runtime to keep patched, and hosting is free at this traffic level.
  - Agents get clean Markdown at predictable URLs.
  - Pages and their Markdown twins come from the same source, so they can't drift apart.
- **Bad:**
  - The nameserver move makes Cloudflare responsible for all DNS for the domain.
  - The only way to deploy to production is to merge or push to `live`, which is the intended behavior.
- **Cost of adding new content types:** a blog, for example, means a new collection, a new `.md` endpoint for it, and an entry in `llms.txt` and `llms-full.txt`. No infrastructure changes.
- **Not chosen:**
  - **Serving Markdown from the same URL based on the `Accept: text/markdown` header.** This would need a Worker script on every request. Reconsider if agents begin to rely on it, or if the zone moves to a plan that includes Markdown for Agents.
