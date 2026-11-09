# 0001 — Astro static site on Cloudflare Workers, with Markdown for agents

- **Status:** Accepted
- **Date:** 2026-11-06

## Context

ooctav.io is a personal site. The first version has no blog. It has two things: a resume and a set of links to portfolio projects. The domain is registered at Hostinger.

Requirements:

1. Simple and stable to maintain. No server to run, and as little client-side JavaScript as possible.
2. Content written in Markdown, so it can be edited as plain text and served as-is.
3. AI agents can read every page as Markdown, without having to parse HTML.
4. Deploying to production is a single command.

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
- When the zone is added, Cloudflare imports Hostinger's apex `A` record, which points at Hostinger's parking page. Delete it before running `wrangler deploy`. A Custom Domain can't attach to a hostname that already has a DNS record, so while the record exists the parking page keeps being served. Once attached, the Custom Domain manages its own record (a proxied `AAAA 100::`).
- The `www` redirect lives in the zone, not in this repo:
  - DNS: `www` is a proxied `CNAME` to `ooctav.io`, so its requests reach Cloudflare's edge.
  - A rule in the zone's `http_request_dynamic_redirect` phase, named "Redirect www to root": when `http.host eq "www.ooctav.io"`, return a 301 to `concat("https://ooctav.io", http.request.uri.path)` and keep the query string.
  - To recreate it from the CLI (pass the rule as `--body`, because the CLI's flag validation asks for an `--id` this endpoint doesn't need):

    ```sh
    cf rulesets entrypoint update http_request_dynamic_redirect --zone ooctav.io --body '{"rules":[{"description":"Redirect www to root","expression":"(http.host eq \"www.ooctav.io\")","action":"redirect","action_parameters":{"from_value":{"status_code":301,"preserve_query_string":true,"target_url":{"expression":"concat(\"https://ooctav.io\", http.request.uri.path)"}}}}]}'
    ```

    This command replaces every rule in that phase, so include any other redirect rules you've added there.

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

### Deployment: `npm run deploy`

- Deploy with `npm run deploy` (`npm run build && wrangler deploy`). It needs a machine signed in to Cloudflare (`wrangler login`).
- `wrangler deploy` uploads the local `dist/` to the `ooctav-io` Worker. It doesn't read git, so it deploys from any branch and includes uncommitted changes. Deploy from a clean, up-to-date `main`, so production matches git.
- There's no CI deploy: no GitHub Actions and no Workers Builds.
- `npm run build` also prints `dist/resume.pdf` from the built `/resume/` page with headless Chromium (`scripts/resume-pdf.mjs`), so the PDF is the page's print stylesheet with a real text layer. The build needs Chromium at `/usr/bin/chromium` or `CHROME_PATH`, and fails without it, rather than deploying a broken PDF link.

### Type-checking: TypeScript 7.1 beta with `@astrojs/ts-content-mapper`

- `npm run check` runs `astro sync && tsc --noEmit --runExternalCode`. The `@astrojs/ts-content-mapper` package, registered under `contentMappers` in `tsconfig.json`, lets `tsc` type-check `.astro` files directly.
- We don't use `astro check`. It refuses to run with TypeScript 7, and Astro plans to deprecate it.
- The mapper needs TypeScript 7.1 or later, which is still in beta (`7.1.0-beta`). Both the compiler and the mapper are pre-release. Move to TypeScript 7.1 stable once it ships.
- The `--runExternalCode` flag is required because the mapper runs code from `node_modules` during compilation.
- Type-checking doesn't affect the site itself, because `astro build` doesn't use `tsc`. If the beta causes problems, revert to TypeScript 6 and `@astrojs/check`.
- VS Code's built-in TypeScript can't load TypeScript 7. Use the TypeScript (Native Preview) extension in the editor.

## Consequences

- **Good:**
  - There's no server or runtime to keep patched, and hosting is free at this traffic level.
  - Agents get clean Markdown at predictable URLs.
  - Pages and their Markdown twins come from the same source, so they can't drift apart.
- **Bad:**
  - The nameserver move makes Cloudflare responsible for all DNS for the domain.
  - Nothing stops a deploy from a dirty tree or a feature branch, so production can drift from `main`.
- **Cost of adding new content types:** a blog, for example, means a new collection, a new `.md` endpoint for it, and an entry in `llms.txt` and `llms-full.txt`. No infrastructure changes.
- **Not chosen:**
  - **Serving Markdown from the same URL based on the `Accept: text/markdown` header.** This would need a Worker script on every request. Reconsider if agents begin to rely on it, or if the zone moves to a plan that includes Markdown for Agents.
