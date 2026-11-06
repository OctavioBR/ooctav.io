import { MARKDOWN_HEADERS, projectsMarkdown } from '../lib/markdown'

export const GET = async () => new Response(await projectsMarkdown(), { headers: MARKDOWN_HEADERS })
