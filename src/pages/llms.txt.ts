// Curated index for agents, per https://llmstxt.org
import { abs, MARKDOWN_PAGES } from '../lib/markdown'
import { LINKS, SITE } from '../site'

export const GET = () => {
  const body = [
    `# ${SITE.name}`,
    `> ${SITE.description}`,
    `Every page on ${SITE.url} has a Markdown version (for example /resume/ → /resume.md). Everything in one file: ${abs('/llms-full.txt')}`,
    '## Pages',
    MARKDOWN_PAGES.map((p) => `- [${p.title}](${abs(p.path)}): ${p.summary}`).join('\n'),
    '## Elsewhere',
    LINKS.map((l) => `- [${l.label}](${l.href})`).join('\n'),
  ].join('\n\n')
  return new Response(body + '\n', { headers: { 'Content-Type': 'text/plain; charset=utf-8' } })
}
