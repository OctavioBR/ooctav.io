// Builds the Markdown twins of each page (ADR-0001, "Markdown for agents").
// The .md endpoints and llms-full.txt both use these, so HTML and Markdown
// come from the same content collections and can't drift apart.
import { getCollection, getEntry } from 'astro:content'
import { LINKS, SITE } from '../site'

export const MARKDOWN_HEADERS = { 'Content-Type': 'text/markdown; charset=utf-8' }

// Absolute URL for a site path.
export const abs = (path: string) => new URL(path, SITE.url).href

// Rewrites root-relative Markdown links and images, like "(/resume/)", to absolute URLs.
const absolutize = (md: string) => md.replace(/\]\((\/[^)\s]*)/g, (_, p) => `](${abs(p)}`)

// Drops HTML comments, such as editing TODOs, from the agent-facing output.
const stripComments = (md: string) => md.replace(/<!--[\s\S]*?-->/g, '').replace(/\n{3,}/g, '\n\n')

const doc = (title: string, description: string, path: string, body: string) =>
  [
    `# ${title}`,
    `> ${description}`,
    `Canonical: ${abs(path)}`,
    absolutize(stripComments(body)).trim(),
  ].join('\n\n') + '\n'

export async function sortedProjects() {
  const projects = await getCollection('projects')
  return projects.sort((a, b) => a.data.order - b.data.order || b.data.year - a.data.year)
}

async function page(id: 'home' | 'resume') {
  const entry = await getEntry('pages', id)
  if (!entry) throw new Error(`Missing src/content/pages/${id}.md`)
  return entry
}

const linksMd = () => LINKS.map((l) => `- [${l.label}](${l.href})`).join('\n')

const projectsMd = async () =>
  (await sortedProjects())
    .map((p) => `- [${p.data.title}](${p.data.url}) (${p.data.year}): ${p.data.description}`)
    .join('\n')

export async function homeMarkdown() {
  const home = await page('home')
  const body = [
    home.body ?? '',
    '## Projects',
    await projectsMd(),
    '## Links',
    linksMd(),
  ].join('\n\n')
  return doc(home.data.title, home.data.description, '/', body)
}

export async function resumeMarkdown() {
  const resume = await page('resume')
  return doc(`${resume.data.title} — ${SITE.name}`, resume.data.description, '/resume/', resume.body ?? '')
}

export async function projectsMarkdown() {
  const projects = await sortedProjects()
  const body = projects
    .map((p) =>
      [`## [${p.data.title}](${p.data.url})`, `${p.data.year}. ${p.data.description}`, p.body?.trim()]
        .filter(Boolean)
        .join('\n\n'),
    )
    .join('\n\n')
  return doc(`Projects — ${SITE.name}`, `Selected projects by ${SITE.name}.`, '/projects/', body)
}

// Every page, in the order llms.txt and llms-full.txt list them.
export const MARKDOWN_PAGES = [
  { path: '/index.md', title: 'Home', summary: 'Who I am, my projects and how to reach me', build: homeMarkdown },
  { path: '/resume.md', title: 'Resume', summary: 'Experience, skills and education', build: resumeMarkdown },
  { path: '/projects.md', title: 'Projects', summary: 'Portfolio projects with links', build: projectsMarkdown },
]
