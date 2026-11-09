## Agent skills

### Issue tracker

Issues live in GitHub Issues (OctavioBR/ooctav.io), via the `gh` CLI. See `docs/agents/issue-tracker.md`.

### Domain docs

Single-context: one `GLOSSARY.md` + `docs/adr/` at the repo root. See `docs/agents/domain.md`.

## Cloudflare

Use the `cf` CLI for Cloudflare operations (deploy, dev, resources). It should already be installed. If `cf` is not found, install it and sign in:

```sh
npm install -g cf
cf auth login
```

## Local dev, preview and performance checks

Do NOT run `npm run preview`, `wrangler` or `cf dev`. Use the Astro dev server to look at changes, and `astro preview` (static, no Workers runtime) to measure them.

Reuse the user's dev server when one is already running. It hot-reloads, so it reflects your edits. Only start your own if none is running:

```sh
URL=$(npx astro dev status 2>/dev/null | grep -o 'http://localhost:[0-9]*')
if [ -z "$URL" ]; then
  npm run dev -- --port 4322 --ignore-lock > "$TMPDIR/dev.log" 2>&1 &
  URL=http://localhost:4322 STARTED=1
  until curl -sf "$URL/" >/dev/null; do sleep 1; done
fi
echo "$URL"
```

Use `$URL` to look at changes. When done, stop the server only if you started it (`[ -n "$STARTED" ] && pkill -f "port 4322"`). Never stop the user's server, and never run `astro dev stop`.

### Lighthouse (against the production build)

Lighthouse is a devDependency (`npx lighthouse`). Chromium is at `/usr/bin/chromium`. Always measure the built site, never the dev server: dev output adds Vite's client, HMR, the Dev Toolbar and unbundled modules (about 1.9 MB against about 135 KB built), so its numbers are meaningless.

Lighthouse needs HTTP (`file://` breaks root-relative `/_astro/...` URLs), so serve `dist/` with a throwaway `astro preview` on its own port. It's independent of any dev server and needs no lock bypass:

```sh
npm run build
npx astro preview --port 4323 > "$TMPDIR/preview.log" 2>&1 &
until curl -sf http://localhost:4323/ >/dev/null; do sleep 1; done

CHROME_PATH=/usr/bin/chromium npx lighthouse http://localhost:4323/<page> \
  --only-categories=performance --chrome-flags="--headless=new" \
  --output=json --output-path="$TMPDIR/lh-after.json" --quiet

pkill -f "preview --port 4323"   # always stop it when done
```

`astro preview` doesn't apply `public/_headers`. That's fine for page performance, but don't use it to verify headers.

Pull the key numbers out of the report:

```sh
node -e 'const r=require(process.argv[1]),a=r.audits;for(const k of ["largest-contentful-paint","first-contentful-paint","cumulative-layout-shift","total-blocking-time","speed-index","total-byte-weight"])console.log(k,a[k].displayValue);console.log("score",r.categories.performance.score)' "$TMPDIR/lh-after.json"
```

Useful options:
- `--preset=desktop`. The default emulates a throttled mid-range phone, which is stricter. Report which preset you used.
- `--only-categories=performance,accessibility,best-practices,seo` for a fuller audit.
- `--output=html` for a human-readable report the user can open.
- `--only-audits=uses-optimized-images,uses-responsive-images,modern-image-formats,unsized-images,render-blocking-resources,unused-css-rules,font-display` to focus on what a component change usually affects.
- `--view` opens the HTML report in a browser. Only use it when the user asks.

Read each audit's `details.items` in the JSON for the concrete offending URLs and wasted bytes. This is where the actionable fixes are, not the score.

### Before/after check for a component change

1. Baseline: `git stash` (or check out the base commit), build, start the preview server, and run Lighthouse 3 times → `lh-before-{1,2,3}.json`. Copy the build aside: `cp -r dist "$TMPDIR/dist-before"`. Stop the preview server.
2. Restore your change (`git stash pop`), rebuild, start the preview again, and run Lighthouse 3 times → `lh-after-*.json`. Stop the preview server.
3. Compare the median of each metric, plus the built output:
   ```sh
   du -ab "$TMPDIR/dist-before" dist | sort -k2
   ```
   Check the affected page's HTML in `dist/` for the real `<img>`, `<link>` and `<script>` tags.
4. Report before and after numbers (with preset) to the user. Don't just say "faster".

### Astro performance notes

- The site is fully static (ADR-0001). Pages ship zero JS unless a component uses a `client:*` directive. Any new `client:*` island, or any `<script>`, adds JS. Justify it, and prefer `client:visible` or `client:idle` over `client:load`.
- Images: put them in `src/assets/` and render them with `<Image>` or `<Picture>` from `astro:assets`, not plain `<img>` from `public/`. This gives build-time WebP/AVIF, explicit `width`/`height` (no CLS) and `srcset` via `densities`/`widths`. Never request a density larger than the source (Astro won't upscale).
- `<Image>` defaults to `loading="lazy"`. Set `loading="eager"` on above-the-fold images such as the header avatar, or the LCP gets delayed.
- `public/` files are served as-is, unhashed and unoptimized. Keep only things that need fixed URLs there (favicons, `_headers`, robots).
- Fonts come from `@fontsource-variable`, so they're self-hosted. Import only the subsets and weights you use.
- The dev server shows the Dev Toolbar audit (performance and a11y hints, like the `<Image>` suggestion). Clear its warnings for changed components.
