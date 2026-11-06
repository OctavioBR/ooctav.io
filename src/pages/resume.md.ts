import { MARKDOWN_HEADERS, resumeMarkdown } from '../lib/markdown'

export const GET = async () => new Response(await resumeMarkdown(), { headers: MARKDOWN_HEADERS })
