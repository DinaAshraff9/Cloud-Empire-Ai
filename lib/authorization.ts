import { auth } from '@/lib/auth'
import { headers } from 'next/headers'

export type WorkspaceRole = 'owner' | 'admin' | 'developer' | 'viewer'
const roleRank: Record<WorkspaceRole, number> = { viewer: 10, developer: 20, admin: 30, owner: 40 }

export async function requireRole(required: WorkspaceRole) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) throw new Error('Unauthorized')
  const role = ((session.user as { role?: string }).role ?? 'viewer') as WorkspaceRole
  if (!(role in roleRank) || roleRank[role] < roleRank[required]) throw new Error('Forbidden')
  return { session, role }
}
