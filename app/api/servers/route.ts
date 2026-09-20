import { NextResponse } from 'next/server'
import { ensureDemoServers } from '@/lib/data/servers'

export async function GET() {
  try {
    const servers = await ensureDemoServers()
    return NextResponse.json({ servers })
  } catch (error) {
    console.error('[v0] Failed to load servers', error)
    return NextResponse.json({ error: 'Unable to load servers' }, { status: 500 })
  }
}
