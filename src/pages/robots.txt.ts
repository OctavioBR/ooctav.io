// AI crawlers are named explicitly so nobody has to wonder whether "*" covers them.

const AI_BOTS = ['GPTBot', 'OAI-SearchBot', 'ChatGPT-User', 'ClaudeBot', 'Claude-User', 'Claude-SearchBot', 'PerplexityBot', 'Google-Extended']

export const GET = () => {
  const groups = ['*', ...AI_BOTS].map((ua) => `User-agent: ${ua}\nAllow: /`)
  const body = groups.join('\n\n')
  return new Response(body + '\n', { headers: { 'Content-Type': 'text/plain; charset=utf-8' } })
}
