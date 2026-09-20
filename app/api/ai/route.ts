import { gateway } from 'ai'
import { streamText } from 'ai'
import { headers } from 'next/headers'
import { auth } from '@/lib/auth'

export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) return new Response('Unauthorized', { status: 401 })

  const body = (await request.json()) as { messages?: Array<{ role: 'user' | 'assistant' | 'system'; content: string }> }
  const messages = body.messages?.slice(-12) ?? []
  if (!messages.length) return Response.json({ error: 'A message is required.' }, { status: 400 })

  const result = streamText({
    model: gateway('anthropic/claude-haiku-4.5'),
    system: 'You are Empire AI, a concise cloud infrastructure copilot. Explain operational risks clearly, never claim an action was completed unless a verified tool result exists, and ask for confirmation before destructive actions. The current product has servers, deployments, monitoring, logs, databases, storage, DNS, and CDN modules.',
    messages,
    temperature: 0.2,
  })

  return result.toTextStreamResponse()
}
