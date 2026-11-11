// Hobby archive data. Each folder in src/assets/photos/Boardgames is a game;
// its photos become that game's card. EXIF is read at build time.
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import type { ImageMetadata } from 'astro'
import exifr from 'exifr'
import blurbs from './boardgame-blurbs.json'

// HEIC/MOV are skipped: sharp can't decode them. HEICs have JPEG twins.
const files = import.meta.glob<{ default: ImageMetadata }>(
  '../assets/photos/Boardgames/*/*.{jpg,jpeg,JPG,JPEG,png,PNG}',
  { eager: true },
)

// A clip is an .mp4 next to a same-named cover image (IMG_1.mp4 + IMG_1.jpg).
// Vite copies it to /_astro/ with a hashed name. An optional IMG_1.json sidecar
// carries the date/GPS that the H.264 conversion drops from the iPhone original.
const videos = import.meta.glob<string>('../assets/photos/Boardgames/*/*.mp4', {
  eager: true, query: '?url', import: 'default',
})
const sidecars = import.meta.glob<{ date?: string; latitude?: number; longitude?: number }>(
  '../assets/photos/Boardgames/*/*.json', { eager: true, import: 'default' },
)
const stem = (key: string) => key.replace(/\.[^.]+$/, '')

/** Short, funny one-liners. Keyed by folder name. */
const BLURBS: Record<string, string> = blurbs

export interface Photo {
  /** For a clip, this is its cover frame. */
  image: ImageMetadata
  /** URL of the .mp4 when this entry is a clip. */
  video?: string
  file: string
  /** Display date, such as "3 Oct 2026, 01:34" (local time of the camera). */
  date?: string
  /** ISO date for <time datetime>. */
  iso?: string
  camera?: string
  settings?: string
  location?: string
}

export interface Game {
  name: string
  blurb: string
  photos: Photo[]
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

/** Coarse place lookup. Only the HEIC originals carry GPS, all in Florianópolis. */
function place(lat?: number, lon?: number) {
  if (lat == null || lon == null) return undefined
  if (Math.abs(lat + 27.6) < 0.3 && Math.abs(lon + 48.5) < 0.3) return 'Florianópolis, Brazil'
  return `${lat.toFixed(2)}, ${lon.toFixed(2)}`
}

/** Parse an EXIF-style "YYYY:MM:DD HH:MM:SS" local timestamp. */
function setDate(photo: Photo, raw?: string) {
  const m = /^(\d{4}):(\d{2}):(\d{2}) (\d{2}):(\d{2})/.exec(raw ?? '')
  if (!m) return
  const [, y, mo, d, h, mi] = m
  photo.date = `${+d} ${MONTHS[+mo - 1]} ${y}, ${h}:${mi}`
  photo.iso = `${y}-${mo}-${d}T${h}:${mi}`
}

async function readPhoto(key: string, image: ImageMetadata): Promise<Photo> {
  const file = key.split('/').pop()!
  const photo: Photo = { image, file }
  const video = videos[`${stem(key)}.mp4`]
  if (video) {
    photo.video = video
    photo.file = `${stem(file)}.mp4`
    const meta = sidecars[`${stem(key)}.json`] ?? {}
    setDate(photo, meta.date)
    photo.location = place(meta.latitude, meta.longitude)
    return photo
  }
  let exif: Record<string, any> | undefined
  let buf: Buffer
  try {
    buf = readFileSync(join(process.cwd(), 'src', key.replace(/^\.\.\//, '')))
    // reviveValues:false keeps "YYYY:MM:DD HH:MM:SS" as the camera wrote it (no TZ shift).
    exif = await exifr.parse(buf, { gps: true, reviveValues: false })
  } catch {
    return photo
  }
  if (!exif) return photo
  setDate(photo, exif.DateTimeOriginal ?? exif.CreateDate)
  if (exif.Model) photo.camera = String(exif.Model)
  const s = [
    exif.FNumber && `ƒ/${(+exif.FNumber).toFixed(1)}`,
    exif.ExposureTime && `1/${Math.round(1 / exif.ExposureTime)}s`,
    exif.ISO && `ISO ${exif.ISO}`,
  ].filter(Boolean)
  if (s.length) photo.settings = s.join(' · ')
  const gps = await exifr.gps(buf).catch(() => undefined)
  photo.location = place(gps?.latitude, gps?.longitude)
  return photo
}

export async function boardgames(): Promise<Game[]> {
  const byGame = new Map<string, Photo[]>()
  for (const [key, mod] of Object.entries(files)) {
    const name = key.split('/').at(-2)!
    const list = byGame.get(name) ?? []
    list.push(await readPhoto(key, mod.default))
    byGame.set(name, list)
  }
  return [...byGame]
    .map(([name, photos]) => ({
      name,
      blurb: BLURBS[name] ?? 'A game we played. Someone won. Someone demanded a rematch.',
      // Newest first; undated photos last.
      photos: photos.sort((a, b) => (b.iso ?? '').localeCompare(a.iso ?? '')),
    }))
    // Most recently played first.
    .sort((a, b) => (b.photos[0].iso ?? '').localeCompare(a.photos[0].iso ?? ''))
}
