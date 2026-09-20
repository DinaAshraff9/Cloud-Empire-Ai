import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { cloudActivity, cloudDeployments, cloudServers } from '@/lib/db/schema'

export async function POST(request: Request) {
  try {
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const userId = session.user.id
    const body = await request.json() as { action?: string; serverId?: string }
    if (!body.serverId || !['deploy', 'restart'].includes(body.action ?? '')) {
      return NextResponse.json({ error: 'Invalid server action' }, { status: 400 })
    }
    const [server] = await db.select().from(cloudServers).where(eq(cloudServers.id, body.serverId)).limit(1)
    if (!server || server.userId !== userId) return NextResponse.json({ error: 'Server not found' }, { status: 404 })

    const now = new Date()
    await db.update(cloudServers).set({ status: body.action === 'deploy' ? 'deploying' : 'restarting', updatedAt: now }).where(eq(cloudServers.id, body.serverId))
    await db.insert(cloudActivity).values({ id: crypto.randomUUID(), userId, action: body.action === 'deploy' ? 'Deployment started' : 'Server restart requested', resource: server.name, status: 'success', metadata: { serverId: server.id } })
    if (body.action === 'deploy') {
      await db.insert(cloudDeployments).values({ id: crypto.randomUUID(), userId, serverId: server.id, name: `${server.name} deployment`, environment: 'production', status: 'running', commitSha: 'workspace' })
    }
    return NextResponse.json({ ok: true, status: body.action === 'deploy' ? 'deploying' : 'restarting' })
  } catch (error) {
    console.error('[v0] Server action failed', error)
    return NextResponse.json({ error: 'Unable to update server' }, { status: 500 })
  }
}
