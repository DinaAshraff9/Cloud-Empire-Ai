'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  Activity,
  AlertTriangle,
  ArrowUpRight,
  Bell,
  Bot,
  Check,
  ChevronDown,
  CircleGauge,
  Cloud,
  Cpu,
  Database,
  ExternalLink,
  FileText,
  HelpCircle,
  Layers3,
  Menu,
  MoreHorizontal,
  Network,
  Plus,
  RefreshCw,
  Search,
  Server,
  Settings,
  ShieldCheck,
  Sparkles,
  TerminalSquare,
  Users,
  X,
  Zap,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { OperationalView } from '@/components/operational-view'
import { InfrastructureGlobe } from '@/components/infrastructure-globe'
import ControlCenter from '@/components/control-center'

type Status = 'Healthy' | 'Degraded' | 'Deploying'

type ServerRow = {
  id: string
  name: string
  region: string
  type: string
  status: Status
  cpu: number
  memory: number
  updated: string
}

type DashboardServer = {
  id: string
  name: string
  region: string
  provider: string
  status: string
  cpuPercent: number
  memoryPercent: number
  updatedAt: string | Date
}

type TelemetryPoint = {
  serverId: string
  cpuPercent: number
  memoryPercent: number
  networkMbps: string
  requestsPerSecond: number
  anomalyScore: string
  recordedAt: string | Date
}

const fallbackServers: ServerRow[] = [
  { id: 'srv-api-production', name: 'api-production', region: 'us-east-1', type: 'Compute optimized', status: 'Healthy', cpu: 42, memory: 58, updated: '2 min ago' },
  { id: 'srv-worker-queue', name: 'worker-queue', region: 'eu-west-1', type: 'General purpose', status: 'Healthy', cpu: 27, memory: 41, updated: '4 min ago' },
  { id: 'srv-analytics-cluster', name: 'analytics-cluster', region: 'us-west-2', type: 'Memory optimized', status: 'Degraded', cpu: 81, memory: 76, updated: '8 min ago' },
]

const navGroups = [
  { label: 'Workspace', items: [{ label: 'Dashboard', icon: CircleGauge }, { label: 'Cloud Map', icon: Network }, { label: 'Servers', icon: Server }, { label: 'Deployments', icon: Zap }, { label: 'Dependency Map', icon: Network }] },
  { label: 'Infrastructure', items: [{ label: 'Databases', icon: Database }, { label: 'Storage', icon: Cloud }, { label: 'Kubernetes', icon: Layers3 }, { label: 'CDN & DNS', icon: Network }] },
  { label: 'Observability', items: [{ label: 'Monitoring', icon: Activity }, { label: 'Logs', icon: TerminalSquare }, { label: 'Incidents', icon: AlertTriangle }, { label: 'Activity', icon: Activity }, { label: 'Health Checks', icon: CircleGauge }, { label: 'Environment comparison', icon: Network }] },
  { label: 'Operations', items: [{ label: 'Backups', icon: Database }, { label: 'Notifications', icon: Bell }, { label: 'Webhooks', icon: Network }, { label: 'Usage', icon: Activity }, { label: 'Cost estimator', icon: CircleGauge }, { label: 'Audit log', icon: FileText }, { label: 'Maintenance', icon: Settings }, { label: 'Roles', icon: Users }, { label: 'Reports', icon: FileText }, { label: 'Templates', icon: Layers3 }, { label: 'Secrets', icon: ShieldCheck }, { label: 'Demo scenarios', icon: Settings }] },
]

function StatusBadge({ status }: { status: Status }) {
  const styles = { Healthy: 'status-healthy', Degraded: 'status-warning', Deploying: 'status-info' }
  return <span className={`status-badge ${styles[status]}`}><span className="status-dot" />{status}</span>
}

function MetricCard({ label, value, change, icon: Icon, tone = 'teal' }: { label: string; value: string; change: string; icon: typeof Activity; tone?: 'teal' | 'blue' | 'amber' | 'purple' }) {
  return <div className="metric-card">
    <div className={`metric-icon metric-${tone}`}><Icon aria-hidden="true" /></div>
    <div className="metric-copy"><span>{label}</span><strong>{value}</strong><small className={change.startsWith('+') ? 'positive' : 'muted'}>{change}</small></div>
  </div>
}

export default function CloudDashboard({ initialData = [], telemetry = [] }: { initialData?: DashboardServer[]; telemetry?: TelemetryPoint[] }) {
  const latestTelemetry = telemetry[0]
  const chartServerId = latestTelemetry?.serverId
  const chartTelemetry = chartServerId ? telemetry.filter((point) => point.serverId === chartServerId).slice().reverse() : telemetry
  const averageCpu = telemetry.length ? Math.round(telemetry.reduce((sum, point) => sum + point.cpuPercent, 0) / telemetry.length) : 42
  const averageMemory = telemetry.length ? Math.round(telemetry.reduce((sum, point) => sum + point.memoryPercent, 0) / telemetry.length) : 58
  const anomalyCount = telemetry.filter((point) => Number(point.anomalyScore) >= 0.6).length
  const latestByServer = useMemo(() => new Map(telemetry.reduce<TelemetryPoint[]>((latest, point) => {
    if (!latest.some((item) => item.serverId === point.serverId)) latest.push(point)
    return latest
  }, []).map((point) => [point.serverId, point])), [telemetry])
  const databaseServers = initialData.map((server) => {
    const point = latestByServer.get(server.id)
    return {
      id: server.id,
      name: server.name,
      region: server.region,
      type: server.provider,
      status: server.status === 'degraded' ? 'Degraded' as const : server.status === 'deploying' ? 'Deploying' as const : 'Healthy' as const,
      cpu: point?.cpuPercent ?? server.cpuPercent,
      memory: point?.memoryPercent ?? server.memoryPercent,
      updated: formatStableDate(point?.recordedAt ?? server.updatedAt),
    }
  })
  const [servers, setServers] = useState<ServerRow[]>(databaseServers.length ? databaseServers : fallbackServers)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('Overview')
  const [search, setSearch] = useState('')
  const [regionFilter, setRegionFilter] = useState('all')
  const [selectedServerId, setSelectedServerId] = useState(databaseServers[0]?.id ?? fallbackServers[0].id)
  const [showAssistant, setShowAssistant] = useState(false)
  const [assistantText, setAssistantText] = useState('')
  const [assistantMessage, setAssistantMessage] = useState('I can help you inspect infrastructure, explain alerts, or prepare a deployment plan.')
  const [deploying, setDeploying] = useState(false)
  const [lastRefresh, setLastRefresh] = useState('just now')
  const [commandOpen, setCommandOpen] = useState(false)
  useEffect(() => { const onKey = (event: KeyboardEvent) => { if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') { event.preventDefault(); setCommandOpen((open) => !open) } if (event.key === 'Escape') setCommandOpen(false) }; window.addEventListener('keydown', onKey); return () => window.removeEventListener('keydown', onKey) }, [])

  const regions = useMemo(() => Array.from(new Set(servers.map((server) => server.region))).sort(), [servers])
  const filteredServers = useMemo(() => servers.filter((server) => {
    const matchesSearch = `${server.name} ${server.region} ${server.type}`.toLowerCase().includes(search.toLowerCase())
    const matchesRegion = regionFilter === 'all' || server.region === regionFilter
    return matchesSearch && matchesRegion
  }), [servers, search, regionFilter])
  const selectedServer = servers.find((server) => server.id === selectedServerId) ?? servers[0]

  function refreshData() {
    setLastRefresh('just now')
    setServers((current) => current.map((server) => ({ ...server, updated: 'just now' })))
  }

  function deploy() {
    setDeploying(true)
    setServers((current) => current.map((server, index) => index === 0 ? { ...server, status: 'Deploying' } : server))
    window.setTimeout(() => {
      setServers((current) => current.map((server, index) => index === 0 ? { ...server, status: 'Healthy', updated: 'just now' } : server))
      setDeploying(false)
    }, 1800)
  }

  function askAssistant() {
    const prompt = assistantText.trim()
    if (!prompt) return
    setAssistantMessage(`Empire AI local analysis: ${anomalyCount > 0 ? `I found ${anomalyCount} telemetry anomaly${anomalyCount === 1 ? '' : 'ies'} and ${servers.filter((server) => server.status !== 'Healthy').length} server(s) needing attention. ` : 'No active telemetry anomalies were detected. '}For “${prompt}”, review Deployments and Logs first. I can suggest a safe plan, but this local assistant never changes infrastructure automatically.`)
    setAssistantText('')
  }

  return <div className="app-shell">
    {sidebarOpen && <button className="sidebar-backdrop" aria-label="Close navigation" onClick={() => setSidebarOpen(false)} />}
    <aside className={`sidebar ${sidebarOpen ? 'sidebar-open' : ''}`}>
      <div className="brand"><div className="brand-mark"><Cloud size={20} /></div><div><strong>cloud empire</strong><span>AI infrastructure</span></div><button className="mobile-close" onClick={() => setSidebarOpen(false)} aria-label="Close navigation"><X size={18} /></button></div>
      <div className="workspace-switcher"><div className="workspace-avatar">CE</div><div><strong>Cloud Empire AI</strong><span>Production workspace</span></div><ChevronDown size={15} /></div>
      <nav className="nav-groups" aria-label="Main navigation">{navGroups.map((group) => <div className="nav-group" key={group.label}><p>{group.label}</p>{group.items.map((item) => <button key={item.label} className={`nav-item ${activeTab === item.label ? 'nav-active' : ''}`} onClick={() => { setActiveTab(item.label); setSidebarOpen(false); if (item.label === 'Cloud Map') window.setTimeout(() => document.querySelector('.globe-panel')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 0) }}><item.icon size={17} />{item.label}{item.label === 'Incidents' && <span className="nav-count">2</span>}</button>)}</div>)}</nav>
      <div className="sidebar-bottom"><button className={`nav-item ${activeTab === 'Settings' ? 'nav-active' : ''}`} onClick={() => { setActiveTab('Settings'); setSidebarOpen(false) }}><Settings size={17} />Settings</button><div className="user-card"><div className="user-avatar">DA</div><div><strong>Dina Ashraf</strong><span>Owner</span></div><MoreHorizontal size={16} /></div></div>
    </aside>
    <main className="main-content">
      <header className="topbar"><div className="topbar-left"><button className="mobile-menu" onClick={() => setSidebarOpen(true)} aria-label="Open navigation"><Menu size={20} /></button><div className="breadcrumbs"><span>Cloud Empire AI</span><span>/</span><strong>{activeTab}</strong></div></div><div className="topbar-actions"><button className="icon-button" aria-label="Search"><Search size={18} /></button><button className="icon-button notification-button" aria-label="Notifications"><Bell size={18} /><i /></button><div className="topbar-avatar">DA</div></div></header>
      <div className={`page-content page-${activeTab.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}>
        {activeTab !== 'Overview' && <ControlCenter activeTab={activeTab} serverCount={servers.length} />}
        {activeTab !== 'Overview' && activeTab !== 'Servers' && activeTab !== 'Cloud Map' && ['Deployments', 'Logs', 'Monitoring', 'Databases', 'Storage', 'CDN & DNS', 'Settings', 'Usage', 'Backups', 'Notifications', 'Webhooks', 'Dependency Map', 'Cost estimator', 'Audit log', 'Maintenance', 'Incidents', 'Roles', 'Reports', 'Templates', 'Activity', 'Health Checks', 'Environment comparison', 'Secrets', 'Demo scenarios'].includes(activeTab) && <OperationalView activeTab={activeTab as Parameters<typeof OperationalView>[0]['activeTab']} />}
        <section className="hero-row"><div><div className="eyebrow"><span className="live-pulse" />Systems operational <span className="dataset-source">Google Borg Cluster Trace · imported telemetry</span></div><h1>Global infrastructure</h1><p>Real-time network monitoring across every active region.</p></div><div className="hero-actions"><Button variant="outline" onClick={refreshData}><RefreshCw data-icon="inline-start" />Refresh</Button><Button onClick={() => { setActiveTab('Deployments'); window.scrollTo({ top: 0, behavior: 'smooth' }) }}><Plus data-icon="inline-start" />New deployment</Button></div></section>
        <section className="metric-grid" aria-label="Infrastructure summary"><MetricCard label="Total Servers" value="124" change="+12 this month" icon={Server} tone="blue" /><MetricCard label="Active Regions" value="32" change="+2 new regions" icon={Network} tone="teal" /><MetricCard label="Avg CPU Load" value={`${averageCpu}%`} change={latestTelemetry ? `${latestTelemetry.requestsPerSecond.toLocaleString()} req/s` : 'Awaiting telemetry'} icon={Cpu} tone="purple" /><MetricCard label="Anomalies Detected" value={`${anomalyCount}`} change="From imported trace" icon={Sparkles} tone="amber" /></section>
        <InfrastructureGlobe servers={databaseServers.map((server) => ({ id: server.id, name: server.name, region: server.region, status: server.status, cpu: server.cpu }))} />
        <section className="content-grid"><div className="panel chart-panel"><div className="panel-header"><div><h2>Resource utilization</h2><p>{telemetry.length ? `Imported telemetry · ${telemetry.length} latest samples` : 'Average across production services'}</p></div><div className="segmented"><button className="segment-active">24h</button><button>7d</button><button>30d</button></div></div><div className="chart-legend"><span><i className="legend-teal" />CPU usage</span><span><i className="legend-blue" />Memory usage</span>{anomalyCount > 0 && <span className="chart-alert"><i className="legend-amber" />{anomalyCount} anomalies</span>}</div><div className="chart"><div className="chart-y"><span>100%</span><span>75%</span><span>50%</span><span>25%</span><span>0%</span></div><div className="chart-area"><div className="chart-grid-lines" /><svg viewBox="0 0 660 180" preserveAspectRatio="none" role="img" aria-label="CPU and memory utilization over the last 24 hours"><path d={buildTelemetryPath(chartTelemetry.map((point) => point.cpuPercent), 660, 180)} className="line-teal" /><path d={buildTelemetryPath(chartTelemetry.map((point) => point.memoryPercent), 660, 180)} className="line-blue" /></svg><div className="chart-x"><span>00:00</span><span>06:00</span><span>12:00</span><span>18:00</span><span>Now</span></div></div></div></div><div className="panel activity-panel"><div className="panel-header"><div><h2>Recent activity</h2><p>Latest workspace events</p></div><button className="more-button" aria-label="More activity options"><MoreHorizontal size={18} /></button></div><div className="activity-list"><div className="activity-item"><div className="activity-icon activity-success"><Check size={15} /></div><div><strong>Deployment completed</strong><span>api-production · 12 min ago</span></div></div><div className="activity-item"><div className="activity-icon activity-blue"><GitBranchIcon /></div><div><strong>Configuration updated</strong><span>worker-queue · 34 min ago</span></div></div><div className="activity-item"><div className="activity-icon activity-warning"><AlertTriangle size={15} /></div><div><strong>High memory usage</strong><span>analytics-cluster · 1 hr ago</span></div></div><div className="activity-item"><div className="activity-icon activity-purple"><Users size={15} /></div><div><strong>New team member joined</strong><span>Sarah Johnson · 2 hrs ago</span></div></div></div><button className="view-all">View all activity <ArrowUpRight size={15} /></button></div></section>
        <section className="panel servers-panel"><div className="panel-header"><div><h2>Production servers</h2><p>Manage and monitor your compute resources</p></div><div className="server-tools"><div className="search-field"><Search size={15} /><input aria-label="Search servers" placeholder="Search servers" value={search} onChange={(event) => setSearch(event.target.value)} /></div><select className="region-filter" aria-label="Filter by region" value={regionFilter} onChange={(event) => setRegionFilter(event.target.value)}><option value="all">All regions</option>{regions.map((region) => <option key={region} value={region}>{region}</option>)}</select><Button variant="outline" size="sm"><ExternalLink data-icon="inline-start" />Export</Button></div></div><div className="table-wrap"><table><thead><tr><th>Server</th><th>Status</th><th>Region</th><th>CPU</th><th>Memory</th><th>Last updated</th><th><span className="sr-only">Actions</span></th></tr></thead><tbody>{filteredServers.map((server) => <tr key={server.name} className={selectedServer?.id === server.id ? 'server-row-selected' : ''} onClick={() => setSelectedServerId(server.id)}><td><div className="server-name"><div className="server-icon"><Server size={16} /></div><div><strong>{server.name}</strong><span>{server.type}</span></div></div></td><td><StatusBadge status={server.status} /></td><td><span className="region"><span className="region-dot" />{server.region}</span></td><td><div className="progress-cell"><div className="progress"><span style={{ width: `${server.cpu}%` }} /></div><small>{server.cpu}%</small></div></td><td><div className="progress-cell"><div className="progress progress-blue"><span style={{ width: `${server.memory}%` }} /></div><small>{server.memory}%</small></div></td><td><span className="table-muted">{server.updated}</span></td><td><button className="more-button" aria-label={`Actions for ${server.name}`}><MoreHorizontal size={18} /></button></td></tr>)}</tbody></table></div>{selectedServer && <div className="server-inspector"><div className="inspector-heading"><div><span className="eyebrow"><span className="live-pulse" />Selected resource</span><h3>{selectedServer.name}</h3><p>{selectedServer.region} · {selectedServer.type}</p></div><StatusBadge status={selectedServer.status} /></div><div className="inspector-metrics"><div><span>CPU usage</span><strong>{selectedServer.cpu}%</strong></div><div><span>Memory</span><strong>{selectedServer.memory}%</strong></div><div><span>Last check</span><strong>{selectedServer.updated}</strong></div></div><div className="inspector-actions"><Button size="sm" onClick={deploy}><Zap data-icon="inline-start" />Open deployment</Button><Button variant="outline" size="sm" onClick={() => setShowAssistant(true)}><Sparkles data-icon="inline-start" />Ask Empire AI</Button></div></div>}{filteredServers.length === 0 && <div className="empty-state">No servers match “{search}”.</div>}<div className="table-footer"><span>Showing {filteredServers.length} of {servers.length} servers</span><span>Last synced {lastRefresh}</span></div></section>
      </div>
    </main>
    <button className="assistant-fab" onClick={() => setShowAssistant(true)} aria-label="Open AI assistant"><Bot size={21} /><span>Ask Empire AI</span></button>
    {commandOpen && <div className="command-backdrop" onClick={() => setCommandOpen(false)}><div className="command-palette" role="dialog" aria-label="Command palette" onClick={(event) => event.stopPropagation()}><div className="command-search"><Search size={16} /><input autoFocus placeholder="Search commands..." /></div>{['Deployments', 'Incidents', 'Dependency Map', 'Logs', 'Cost estimator', 'Reports'].map((command) => <button key={command} onClick={() => { setActiveTab(command); setCommandOpen(false) }}><Zap size={14} />{command}<kbd>↵</kbd></button>)}</div></div>}
    {showAssistant && <div className="assistant-drawer"><div className="assistant-header"><div className="assistant-title"><div className="assistant-icon"><Sparkles size={17} /></div><div><strong>Empire AI</strong><span>Infrastructure copilot</span></div></div><button className="icon-button" onClick={() => setShowAssistant(false)} aria-label="Close assistant"><X size={18} /></button></div><div className="assistant-body"><div className="assistant-message"><div className="assistant-icon small"><Sparkles size={14} /></div><p>{assistantMessage}</p></div><div className="assistant-suggestions"><button onClick={() => setAssistantText('What needs attention today?')}>What needs attention today?</button><button onClick={() => setAssistantText('Explain current resource costs')}>Explain current resource costs</button></div></div><div className="assistant-composer"><textarea value={assistantText} onChange={(event) => setAssistantText(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing && event.keyCode !== 229) { event.preventDefault(); askAssistant() } }} placeholder="Ask about your infrastructure…" aria-label="Ask Empire AI" /><button onClick={askAssistant} aria-label="Send message"><ArrowUpRight size={18} /></button></div></div>}
  </div>
}

function formatStableDate(value: string | Date) {
  const date = new Date(value)
  return new Intl.DateTimeFormat('en-US', {
    timeZone: 'UTC',
    month: 'numeric',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit',
  }).format(date)
}

function buildTelemetryPath(values: number[], width: number, height: number) {
  if (!values.length) return `M0 ${height * 0.55} L${width} ${height * 0.55}`
  const step = values.length === 1 ? width : width / (values.length - 1)
  return values.map((value, index) => {
    const x = index * step
    const y = height - 12 - (Math.max(0, Math.min(100, value)) / 100) * (height - 24)
    return `${index === 0 ? 'M' : 'L'}${x.toFixed(1)} ${y.toFixed(1)}`
  }).join(' ')
}

function GitBranchIcon() { return <Network size={15} /> }
