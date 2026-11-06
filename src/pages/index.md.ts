import { homeMarkdown, MARKDOWN_HEADERS } from '../lib/markdown'

export const GET = async () => new Response(await homeMarkdown(), { headers: MARKDOWN_HEADERS })
