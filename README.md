# ooctav.io

My personal site.

## Develop

```sh
nvm use            # Node 26, from .nvmrc
npm install
npm run dev        # Astro dev server
npm run preview    # build, then serve dist/ through wrangler, the same way production does
```

## Edit content

| What | Where |
| --- | --- |
| Name, description, nav, social links | `src/site.ts` |
| Home intro | `src/content/pages/home.md` |
| Resume | `src/content/pages/resume.md` |
| Portfolio projects (one file each) | `src/content/projects/*.md` |

HTML pages and their Markdown twins (`/index.md`, `/resume.md`, `/projects.md`, `/llms.txt`, `/llms-full.txt`) are built from the same files.

## Deploy

See [ADR-0001](docs/adr/0001-astro-static-site-on-cloudflare-workers.md#deployment-npm-run-deploy).
