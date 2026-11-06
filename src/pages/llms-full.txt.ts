// All site content in one Markdown document.
import { MARKDOWN_PAGES } from '../lib/markdown'

export const GET = async () => {
  const docs = await Promise.all(MARKDOWN_PAGES.map((p) => p.build()))
  return new Response(docs.join('\n---\n\n'), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  })
}
