import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'

export const validationResults = sqliteTable('validation_results', {
  id: text('id').primaryKey(),
  result: text('result').notNull(),
  createdAt: integer('created_at').notNull(),
})

export const rateLimits = sqliteTable('rate_limits', {
  key: text('key').primaryKey(),
  count: integer('count').notNull(),
  resetAt: integer('reset_at').notNull(),
})
