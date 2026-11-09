// Resume data and formatting shared by the HTML page, the PDF and the Markdown twin.
import { getEntry, type CollectionEntry } from 'astro:content'
import { siGo, siNodedotjs, siOpenjdk, siPython, siTypescript, type SimpleIcon } from 'simple-icons'

export type Resume = CollectionEntry<'resume'>
export type Job = Resume['data']['experience'][number]
export type Role = Job['roles'][number]

export async function getResume(): Promise<Resume> {
  const entry = await getEntry('resume', 'resume')
  if (!entry) throw new Error('Missing src/content/pages/resume.md')
  return entry
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

// "YYYY-MM" as a month count; undefined means now (build time).
const toIndex = (ym?: string) => {
  if (!ym) {
    const d = new Date()
    return d.getFullYear() * 12 + d.getMonth()
  }
  const [y, m] = ym.split('-').map(Number)
  return y * 12 + m - 1
}

export const formatMonth = (ym?: string) => {
  if (!ym) return 'Present'
  const [y, m] = ym.split('-').map(Number)
  return `${MONTHS[m - 1]} ${y}`
}

// LinkedIn-style duration, counting both end months: "1 yr 10 mos".
export function duration(start: string, end?: string) {
  const months = toIndex(end) - toIndex(start) + 1
  const y = Math.floor(months / 12)
  const m = months % 12
  return [y && `${y} yr${y > 1 ? 's' : ''}`, m && `${m} mo${m > 1 ? 's' : ''}`].filter(Boolean).join(' ')
}

export const range = (start: string, end?: string) => `${formatMonth(start)} – ${formatMonth(end)}`

// A company's span across all of its roles.
export function jobSpan(job: Job) {
  const start = job.roles.map((r) => r.start).sort()[0]
  const ends = job.roles.map((r) => r.end)
  const end = ends.includes(undefined) ? undefined : (ends as string[]).sort().at(-1)
  return { start, end }
}

// "Contract · Remote · San Francisco, California, United States"
export const jobFacts = (job: Job) => [job.type, job.workplace, job.location].join(' · ')

const escapeHtml = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

// Flags shown on hover over spoken languages (decorative: hidden from screen readers and print).
const LANGUAGE_FLAGS: Record<string, string> = { Portuguese: '🇧🇷', English: '🇬🇧', Russian: '🇷🇺' }
const LANGUAGES = new RegExp(`\\b(${Object.keys(LANGUAGE_FLAGS).join('|')})\\b`, 'g')

export const withLanguageFlags = (html: string) =>
  html.replace(LANGUAGES, (lang) => `<span class="tip">${lang}<span class="tip-pop" aria-hidden="true">${LANGUAGE_FLAGS[lang]}</span></span>`)

// Logos shown on hover over skills (decorative). Simple Icons has no Java logo
// (Oracle had it removed), so Java uses OpenJDK's.
const SKILL_ICONS: Record<string, SimpleIcon> = {
  Go: siGo,
  TypeScript: siTypescript,
  'Node.js': siNodedotjs,
  Python: siPython,
  Java: siOpenjdk,
}
export const skillIcon = (skill: string): SimpleIcon | undefined => SKILL_ICONS[skill]

// Inline Markdown to HTML: links and **bold** only. Input comes from our own content file.
export const inlineMd = (s: string) =>
  escapeHtml(s)
    .replace(/\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g, '<a href="$2">$1</a>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
