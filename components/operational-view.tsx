'use client'

import { useState } from 'react'
import { Activity, AlertTriangle, ArrowUpRight, CheckCircle2, Clock3, FileText, GitBranch, Search, Server, TerminalSquare, Zap, X } from 'lucide-react'

const datasets = {
  Databases: {
    title: 'Databases', description: 'Manage database health, capacity, and backups.', icon: Server,
    rows: [['primary-postgres', 'Healthy', 'PostgreSQL · 42 GB used', '2 min ago'], ['analytics-readonly', 'Healthy', 'Read replica · 18 GB used', '5 min ago'], ['cache-store', 'Attention', 'Redis · 82% memory', '9 min ago']],
  },
  Storage: {
    title: 'Storage', description: 'Review buckets, objects, and storage consumption.', icon: Server,
    rows: [['production-assets', 'Healthy', '2.4 TB · 84,201 objects', '4 min ago'], ['user-uploads', 'Healthy', '684 GB · 19,440 objects', '11 min ago'], ['backup-archive', 'Attention', '91% capacity used', '22 min ago']],
  },
  'CDN & DNS': {
    title: 'CDN & DNS', description: 'Control domains, edge delivery, and traffic routing.', icon: Server,
    rows: [['cloudempire.ai', 'Healthy', 'SSL valid · 42 edge locations', '1 min ago'], ['api.cloudempire.ai', 'Healthy', '99.99% edge availability', '3 min ago'], ['assets.cloudempire.ai', 'Attention', 'DNS propagation pending', '14 min ago']],
  },
  Settings: {
    title: 'Settings', description: 'Configure workspace defaults and security controls.', icon: Server,
    rows: [['Workspace security', 'Enabled', 'Two-factor authentication required', 'Configured'], ['Default region', 'us-east-1', 'New resources use this region', 'Configured'], ['Audit retention', '90 days', 'Activity history retention policy', 'Configured']],
  },
  Billing: {
    title: 'Billing', description: 'Review usage, budget controls, and payment status.', icon: Server,
    rows: [['Current plan', 'Sandbox', 'No live charges are enabled', 'Active'], ['Monthly usage', '$0.00', 'Prototype mode usage', 'This month'], ['Budget guardrail', 'Enabled', 'Blocks unapproved paid resources', 'Protected']],
  },
  Backups: {
    title: 'Backups', description: 'Track recovery points and restore readiness.', icon: Server,
    rows: [['Production snapshot', 'Ready', 'Latest recovery point · 12 min ago', 'Encrypted'], ['Backup schedule', 'Daily', 'Runs at 02:00 UTC in demo mode', 'Configured'], ['Restore drill', 'Pending', 'Run a simulated recovery check', 'Review']],
  },
  Notifications: {
    title: 'Notifications', description: 'Control alert routing without sending external messages.', icon: Server,
    rows: [['In-app alerts', 'Enabled', 'Critical infrastructure events', 'Active'], ['Email delivery', 'Preview only', 'Connect Resend to send externally', 'Not connected'], ['Slack delivery', 'Preview only', 'Connect Slack to send externally', 'Not connected']],
  },
  Webhooks: {
    title: 'Webhooks', description: 'Inspect event destinations and delivery history.', icon: Server,
    rows: [['Deployment events', 'Ready', 'Preview endpoint configured', 'Verified'], ['Alert events', 'Paused', 'External delivery requires integration', 'Safe mode'], ['Delivery history', '12 events', 'All events retained locally', 'Available']],
  },
  Deployments: {
    title: 'Deployments',
    description: 'Track releases across your production environments.',
    icon: Zap,
    rows: [
      ['web-production', 'Live', 'main · a81f29c', '2 min ago'],
      ['worker-queue', 'Live', 'release/queue · 72be101', '18 min ago'],
      ['analytics-cluster', 'Failed', 'main · 41c9a7d', '1 hour ago'],
    ],
  },
  Logs: {
    title: 'Logs',
    description: 'Search application and infrastructure events in one place.',
    icon: TerminalSquare,
    rows: [
      ['api-production', '200', 'GET /v1/projects', '12:42:09'],
      ['worker-queue', 'INFO', 'Job processed successfully', '12:41:54'],
      ['analytics-cluster', 'WARN', 'Memory pressure above 75%', '12:39:18'],
    ],
  },
  Monitoring: {
    title: 'Monitoring',
    description: 'Keep a live eye on uptime, latency, and resource health.',
    icon: Activity,
    rows: [
      ['API latency', '42 ms', 'Within target', '99.98% uptime'],
      ['Queue throughput', '1,284/min', 'Healthy', 'No backlog'],
      ['Memory pressure', '76%', 'Needs attention', 'analytics-cluster'],
    ],
  },
}

export function OperationalView({ activeTab }: { activeTab: keyof typeof datasets }) {
  const data = datasets[activeTab] ?? {
    title: activeTab,
    description: 'Review workspace operations and recent infrastructure activity.',
    icon: Activity,
    rows: [['workspace', 'Healthy', 'Local safe mode · no external changes', 'Just now']],
  }
  const [showDeployment, setShowDeployment] = useState(false)
  const [deploymentStarted, setDeploymentStarted] = useState(false)
  const [deploymentComplete, setDeploymentComplete] = useState(false)
  const [environment, setEnvironment] = useState('production')
  const [branch, setBranch] = useState('main')
  const [service, setService] = useState('web-production')
  const [releaseNote, setReleaseNote] = useState('Routine production release')
  const [region, setRegion] = useState('us-east-1')
  const [instanceType, setInstanceType] = useState('t3.medium')
  const [runtime, setRuntime] = useState('Node.js 20')
  const [healthCheck, setHealthCheck] = useState('HTTP 200 / 30s')
  const [capacity, setCapacity] = useState('2 vCPU · 4 GB')
  const [commit, setCommit] = useState('latest')
  const [deploymentId, setDeploymentId] = useState('')
  const [deploymentRows, setDeploymentRows] = useState(data.rows)
  const Icon = data.icon

  function startDeployment() {
    setDeploymentStarted(true)
    setDeploymentComplete(false)
    const id = `dep-${Date.now().toString(36)}`
    setDeploymentId(id)
    window.dispatchEvent(new CustomEvent('cloud:deployment-created', { detail: { id, name: service, region, status: 'Deploying', cpu: 0, instanceType, runtime, healthCheck, capacity, commit } }))
    window.setTimeout(() => {
      setDeploymentStarted(false)
      setDeploymentComplete(true)
      setDeploymentRows((rows) => [[service, 'Queued', `${branch} · ${id}`, 'Just now'], ...rows.filter(([resource]) => resource !== service)])
    }, 1200)
  }
  return (
    <>
    <section className="operational-view" aria-labelledby="operational-title">
      <div className="operational-hero">
        <div className="eyebrow"><span className="live-pulse" />Live workspace data</div>
        <div className="operational-title-row">
          <div><h1 id="operational-title">{data.title}</h1><p>{data.description}</p></div>
          <button className="primary-action" onClick={() => activeTab === 'Deployments' ? setShowDeployment(true) : undefined}><Icon size={16} />{activeTab === 'Deployments' ? 'New deployment' : 'Create alert'}<ArrowUpRight size={16} /></button>
        </div>
      </div>
      <div className="operational-summary">
        <div><span><CheckCircle2 size={16} />Healthy</span><strong>18</strong><small>Across workspace</small></div>
        <div><span><Clock3 size={16} />Last hour</span><strong>99.98%</strong><small>Availability</small></div>
        <div><span><AlertTriangle size={16} />Attention</span><strong>2</strong><small>Open items</small></div>
      </div>
      <div className="operational-toolbar"><div className="search-field"><Search size={15} /><input aria-label={`Search ${data.title}`} placeholder={`Search ${data.title.toLowerCase()}`} /></div><button className="secondary-action"><FileText size={16} />Export</button></div>
      <div className="panel operational-panel"><div className="table-wrap"><table><thead><tr><th>Resource</th><th>Status</th><th>Details</th><th>Updated</th><th><span className="sr-only">Action</span></th></tr></thead><tbody>{(activeTab === 'Deployments' ? deploymentRows : data.rows).map(([resource, status, details, updated]) => <tr key={resource}><td><div className="server-name"><div className="server-icon"><Server size={16} /></div><strong>{resource}</strong></div></td><td><span className={`status-badge ${status === 'Failed' || status === 'WARN' ? 'status-warning' : 'status-healthy'}`}><span className="status-dot" />{status}</span></td><td><span className="table-muted">{details}</span></td><td><span className="table-muted">{updated}</span></td><td><button className="more-button" aria-label={`Open ${resource}`}><GitBranch size={16} /></button></td></tr>)}</tbody></table></div></div>
    </section>
    {showDeployment && <div className="deployment-modal-backdrop" role="presentation" onClick={() => setShowDeployment(false)}><div className="deployment-modal" role="dialog" aria-modal="true" aria-labelledby="deployment-modal-title" onClick={(event) => event.stopPropagation()}><div className="deployment-modal-header"><div><span className="eyebrow"><span className="live-pulse" />Deployment workflow</span><h2 id="deployment-modal-title">Create a deployment</h2><p>Prepare a safe release for your production environment.</p></div><button className="icon-button" onClick={() => setShowDeployment(false)} aria-label="Close deployment dialog"><X size={18} /></button></div><div className="deployment-form-grid"><label>Service<select value={service} onChange={(event) => setService(event.target.value)}><option value="web-production">web-production</option><option value="worker-queue">worker-queue</option><option value="analytics-cluster">analytics-cluster</option></select></label><label>Environment<select value={environment} onChange={(event) => setEnvironment(event.target.value)}><option value="production">Production</option><option value="staging">Staging</option></select></label><label>Source branch<input value={branch} onChange={(event) => setBranch(event.target.value)} /></label><label>Release note<input value={releaseNote} onChange={(event) => setReleaseNote(event.target.value)} /></label></div><div className="deployment-preview"><span>Release preview</span><strong>{service} · {environment}</strong><p>{releaseNote || 'No release note'} · branch {branch || 'main'} · local safe mode</p><div className="deployment-config-summary"><span>{region}</span><span>{instanceType}</span><span>{runtime}</span><span>{healthCheck}</span><span>{capacity}</span><span>{commit}</span></div><div className="deployment-spec-grid"><label>Region<select value={region} onChange={(event) => setRegion(event.target.value)}><option>us-east-1</option><option>us-west-2</option><option>eu-west-1</option><option>ap-southeast-1</option></select></label><label>Instance type<select value={instanceType} onChange={(event) => setInstanceType(event.target.value)}><option>t3.micro</option><option>t3.small</option><option>t3.medium</option><option>m6i.large</option></select></label><label>Runtime<select value={runtime} onChange={(event) => setRuntime(event.target.value)}><option>Node.js 20</option><option>Node.js 22</option><option>Python 3.12</option><option>Go 1.23</option></select></label><label>Health check<select value={healthCheck} onChange={(event) => setHealthCheck(event.target.value)}><option>HTTP 200 / 30s</option><option>HTTP 200 / 60s</option><option>TCP / 30s</option><option>Disabled</option></select></label><label>Capacity<select value={capacity} onChange={(event) => setCapacity(event.target.value)}><option>1 vCPU · 1 GB</option><option>2 vCPU · 4 GB</option><option>4 vCPU · 8 GB</option><option>8 vCPU · 16 GB</option></select></label><label>Commit<select value={commit} onChange={(event) => setCommit(event.target.value)}><option>latest</option><option>main · a81f29c</option><option>release · f92b10d</option><option>rollback · 7ce44aa</option></select></label></div></div>{deploymentComplete && <div className="deployment-success" role="status"><CheckCircle2 size={17} /><div><strong>Deployment queued successfully</strong><span>{deploymentId} · {service} · {environment} · branch {branch}</span></div></div>}<div className="deployment-modal-actions"><button className="secondary-action" onClick={() => setShowDeployment(false)}>Close</button><button className="primary-action" onClick={() => deploymentComplete ? setShowDeployment(false) : startDeployment()} disabled={deploymentStarted}>{deploymentStarted ? 'Starting deployment…' : deploymentComplete ? 'View deployment' : 'Start deployment'}<ArrowUpRight size={16} /></button></div></div></div>}
  </>
  )
}

export function PlaceholderView({ title }: { title: string }) {
  return <OperationalView activeTab={title === 'CDN & DNS' ? 'Monitoring' : 'Logs'} />
}

