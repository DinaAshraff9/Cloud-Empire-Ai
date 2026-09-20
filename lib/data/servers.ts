import { desc, eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { cloudServers } from '@/lib/db/schema'

const DEMO_USER_ID = 'demo-workspace-owner'

export async function getServers(userId = DEMO_USER_ID) {
  return db.select().from(cloudServers).where(eq(cloudServers.userId, userId)).orderBy(desc(cloudServers.updatedAt))
}

export async function ensureDemoServers() {
  const existing = await getServers()
  if (existing.length > 0) return existing

  const seed = [
    { id: 'srv-api-production', userId: DEMO_USER_ID, name: 'api-production', region: 'us-east-1', provider: 'Compute optimized', status: 'running', cpuPercent: 42, memoryPercent: 58, diskPercent: 36, ipAddress: '34.201.18.42' },
    { id: 'srv-worker-queue', userId: DEMO_USER_ID, name: 'worker-queue', region: 'eu-west-1', provider: 'General purpose', status: 'running', cpuPercent: 27, memoryPercent: 41, diskPercent: 28, ipAddress: '18.170.44.91' },
    { id: 'srv-analytics-cluster', userId: DEMO_USER_ID, name: 'analytics-cluster', region: 'us-west-2', provider: 'Memory optimized', status: 'degraded', cpuPercent: 81, memoryPercent: 76, diskPercent: 64, ipAddress: '52.12.88.14' },
  ]
  await db.insert(cloudServers).values(seed)
  return getServers()
}
