import { desc, eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { cloudTelemetry } from '@/lib/db/schema'

const DEMO_USER_ID = 'demo-workspace-owner'

export async function getTelemetry(userId = DEMO_USER_ID) {
  return db
    .select()
    .from(cloudTelemetry)
    .where(eq(cloudTelemetry.userId, userId))
    .orderBy(desc(cloudTelemetry.recordedAt))
    .limit(144)
}
