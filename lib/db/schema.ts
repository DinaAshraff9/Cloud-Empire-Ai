import { boolean, integer, jsonb, pgTable, text, timestamp } from 'drizzle-orm/pg-core'

export const cloudServers = pgTable('cloud_servers', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull(),
  name: text('name').notNull(),
  region: text('region').notNull(),
  provider: text('provider').notNull(),
  status: text('status').notNull().default('running'),
  cpuPercent: integer('cpu_percent').notNull().default(0),
  memoryPercent: integer('memory_percent').notNull().default(0),
  diskPercent: integer('disk_percent').notNull().default(0),
  ipAddress: text('ip_address'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})

export const cloudDeployments = pgTable('cloud_deployments', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull(),
  serverId: text('server_id').notNull(),
  name: text('name').notNull(),
  environment: text('environment').notNull().default('production'),
  status: text('status').notNull().default('queued'),
  commitSha: text('commit_sha'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  finishedAt: timestamp('finished_at', { withTimezone: true }),
})

export const cloudAlerts = pgTable('cloud_alerts', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull(),
  serverId: text('server_id'),
  severity: text('severity').notNull().default('info'),
  title: text('title').notNull(),
  message: text('message').notNull(),
  acknowledged: boolean('acknowledged').notNull().default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})

export const cloudTelemetry = pgTable('cloud_telemetry', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull(),
  serverId: text('server_id').notNull(),
  recordedAt: timestamp('recorded_at', { withTimezone: true }).notNull(),
  cpuPercent: integer('cpu_percent').notNull(),
  memoryPercent: integer('memory_percent').notNull(),
  networkMbps: text('network_mbps').notNull(),
  requestsPerSecond: integer('requests_per_second').notNull(),
  anomalyScore: text('anomaly_score').notNull().default('0'),
  source: text('source').notNull().default('Google Borg Cluster Trace'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})

export const cloudActivity = pgTable('cloud_activity', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull(),
  action: text('action').notNull(),
  resource: text('resource').notNull(),
  status: text('status').notNull().default('success'),
  metadata: jsonb('metadata').notNull().default({}),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})
