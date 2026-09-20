import CloudDashboard from '@/components/cloud-dashboard'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { ensureDemoServers } from '@/lib/data/servers'
import { getTelemetry } from '@/lib/data/telemetry'

export const dynamic = 'force-dynamic'

export default async function Page() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) redirect('/sign-in')
  try {
    const [servers, telemetry] = await Promise.all([ensureDemoServers(), getTelemetry()])
    return <CloudDashboard initialData={servers} telemetry={telemetry} />
  } catch (error) {
    console.error('[v0] Dashboard data unavailable', error)
    return <CloudDashboard />
  }
}
