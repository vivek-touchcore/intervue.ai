
import {pgTable, boolean, pgEnum, serial, text,  varchar, timestamp, uuid, integer, json, jsonb} from 'drizzle-orm/pg-core';

export const uploadStatusEnum = pgEnum("upload_status", ["PENDING", "PROCESSING", "FAILED", "SUCCESS"])

export const file = pgTable('file', {
    id: serial('id').primaryKey(),
    name: text('name').notNull(),
    uploadStatus: uploadStatusEnum('upload_status'),
    url: text('url').notNull(),
    key: text('key').notNull(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    userId: uuid('user_id').notNull(),
    lastOpenedAt: timestamp('last_opened_at').notNull().defaultNow(),
    summary: text('summary')
})

export const message = pgTable('message', {
    id: uuid('id').defaultRandom().primaryKey(),
    text: text('text'),
    userId: uuid('user_id').notNull(),
    isUserMessage: boolean('is_user_message'),
    fileId: serial('file_id').references(() => file.id),
    createdAt: timestamp('created_at').notNull().defaultNow()
})

export const transcription = pgTable('transcription', {
    id: uuid('id').defaultRandom().primaryKey(),
    transcript: jsonb('transcript'),
    fileId: serial('file_id').references(() => file.id),
})

export type fileType = typeof file.$inferSelect;