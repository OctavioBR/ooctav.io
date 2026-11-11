// Build-time Open Graph card (1200×630 PNG) at /og.png, shared by every page.
// Base.astro points og:image at it. Satori lays out the card and outputs SVG,
// and sharp rasterizes it. Nothing ships to the browser.
import type { APIRoute } from 'astro'
import { getEntry } from 'astro:content'
import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import satori from 'satori'
import sharp from 'sharp'
import { SITE } from '../site'

const OG_WIDTH = 1200
const OG_HEIGHT = 630

const font = (weight: number) =>
  readFile(resolve(`node_modules/@fontsource/geist-mono/files/geist-mono-latin-${weight}-normal.woff`))

type El = { type: string; props: Record<string, unknown> }
const h = (type: string, style: Record<string, unknown>, children?: unknown, extra = {}): El => ({
  type,
  props: { style, children, ...extra },
})

export const GET: APIRoute = async () => {
  const home = await getEntry('pages', 'home')
  const title = home?.data.title ?? SITE.name
  const description = home?.data.description ?? SITE.description
  const avatar = await readFile(resolve('src/assets/avatar.png'))
  const ink = '#000000'
  const muted = '#646464'

  const card = h(
    'div',
    {
      width: OG_WIDTH, height: OG_HEIGHT, boxSizing: 'border-box', display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
      padding: '72px 80px', background: '#fcfcfa', color: ink, fontFamily: 'Geist Mono',
      borderBottom: '16px solid #0000ee',
    },
    [
      h('div', { display: 'flex', alignItems: 'center', gap: '28px' }, [
        h('img', { width: 112, height: 112, borderRadius: 56 }, undefined, {
          src: `data:image/png;base64,${avatar.toString('base64')}`, width: 112, height: 112,
        }),
        h('div', { fontSize: 36, color: muted }, 'ooctav.io'),
      ]),
      h('div', { display: 'flex', flexDirection: 'column', gap: '20px' }, [
        h('div', { fontSize: 72, fontWeight: 700, lineHeight: 1.1, width: 1040, display: 'flex' }, title),
        h('div', { fontSize: 30, color: muted, lineHeight: 1.4, width: 1040, display: 'flex' }, description),
      ]),
    ],
  )

  const svg = await satori(card as never, {
    width: OG_WIDTH,
    height: OG_HEIGHT,
    fonts: [
      { name: 'Geist Mono', data: await font(400), weight: 400, style: 'normal' },
      { name: 'Geist Mono', data: await font(700), weight: 700, style: 'normal' },
    ],
  })
  const png = await sharp(Buffer.from(svg)).png({ palette: true, quality: 90 }).toBuffer()
  return new Response(new Uint8Array(png), { headers: { 'Content-Type': 'image/png' } })
}
