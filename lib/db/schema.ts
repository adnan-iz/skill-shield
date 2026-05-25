import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'

export const validationResults = sqliteTable('validation_results', {
  id: text('id').primaryKey(),
  result: text('result').notNull(),
  createdAt: integer('created_at').notNull(),
  expiresAt: integer('expires_at'),
})

export const rateLimits = sqliteTable('rate_limits', {
  key: text('key').primaryKey(),
  count: integer('count').notNull(),
  resetAt: integer('reset_at').notNull(),
})

export const auditLogs = sqliteTable('audit_logs', {
  id: text('id').primaryKey(),
  event: text('event').notNull(),
  scanId: text('scan_id'),
  metadata: text('metadata'),
  createdAt: integer('created_at').notNull(),
})

export const approvals = sqliteTable('approvals', {
  id: text('id').primaryKey(),
  scanId: text('scan_id').notNull(),
  status: text('status', { enum: ['pending', 'approved', 'rejected'] }).notNull().default('pending'),
  reviewedBy: text('reviewed_by'),
  reviewNotes: text('review_notes'),
  createdAt: integer('created_at').notNull(),
  reviewedAt: integer('reviewed_at'),
})

export const webhooks = sqliteTable('webhooks', {
  id: text('id').primaryKey(),
  url: text('url').notNull(),
  events: text('events').notNull(),
  secret: text('secret'),
  enabled: integer('enabled', { mode: 'boolean' }).default(true).notNull(),
  createdAt: integer('created_at').notNull(),
  lastTriggeredAt: integer('last_triggered_at'),
  lastStatusCode: integer('last_status_code'),
})
