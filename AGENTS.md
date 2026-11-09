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
