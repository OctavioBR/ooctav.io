// Prints the built /resume/ page to dist/resume.pdf with headless Chromium,
// so the PDF is the page's own print stylesheet with a real text layer (ATS
// parsers read it). Runs after `astro build`; see the "build" npm script.
//
// Chromium: set CHROME_PATH, or it defaults to /usr/bin/chromium.
import { spawn } from 'node:child_process'
import { existsSync, readFileSync, statSync } from 'node:fs'
import { createServer } from 'node:http'
import { extname, join, normalize, resolve } from 'node:path'

const DIST = resolve('dist')
const OUT = join(DIST, 'resume.pdf')
const CHROME = process.env.CHROME_PATH || '/usr/bin/chromium'

if (!existsSync(join(DIST, 'resume', 'index.html'))) {
  console.error('resume-pdf: dist/resume/index.html not found. Run `astro build` first.')
  process.exit(1)
}
if (!existsSync(CHROME)) {
  console.error(`resume-pdf: Chromium not found at ${CHROME}. Set CHROME_PATH.`)
  process.exit(1)
}

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.woff2': 'font/woff2',
  '.avif': 'image/avif',
  '.webp': 'image/webp',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
}

// Minimal static server for dist/. The page needs HTTP: root-relative
// /_astro/ URLs don't resolve over file://.
const server = createServer((req, res) => {
  let path = normalize(decodeURIComponent(new URL(req.url, 'http://x').pathname))
  let file = join(DIST, path)
  if (!file.startsWith(DIST)) return res.writeHead(403).end()
  if (existsSync(file) && statSync(file).isDirectory()) file = join(file, 'index.html')
  if (!existsSync(file)) return res.writeHead(404).end()
  res.writeHead(200, { 'Content-Type': TYPES[extname(file)] ?? 'application/octet-stream' })
  res.end(readFileSync(file))
})

await new Promise((ok) => server.listen(0, '127.0.0.1', ok))
const url = `http://127.0.0.1:${server.address().port}/resume/`

// Async spawn: a blocking call would starve the server above.
const code = await new Promise((ok) => {
  const p = spawn(
    CHROME,
    [
      '--headless=new',
      '--disable-gpu',
      '--no-pdf-header-footer',
      '--virtual-time-budget=10000',
      `--print-to-pdf=${OUT}`,
      url,
    ],
    { stdio: ['ignore', 'ignore', 'pipe'] },
  )
  let err = ''
  p.stderr.on('data', (d) => (err += d))
  p.on('close', (c) => {
    if (c !== 0) console.error(err)
    ok(c)
  })
})
server.close()

if (code !== 0 || !existsSync(OUT)) {
  console.error('resume-pdf: Chromium failed to print the PDF.')
  process.exit(1)
}
console.log(`resume-pdf: wrote ${OUT} (${Math.round(statSync(OUT).size / 1024)} KB)`)
