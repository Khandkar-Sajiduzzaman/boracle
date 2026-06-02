// src/lib/db/schema/gradesheet.js - Gradesheet table (one per user)
import { pgTable, text, uuid, bigint } from 'drizzle-orm/pg-core';
import { userinfo } from './userinfo.js';

export const gradesheet = pgTable('gradesheet', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').notNull().unique().references(() => userinfo.email, { onDelete: 'cascade', onUpdate: 'cascade' }),
  courses: text('courses').notNull(),
  originalCgpa: text('original_cgpa'),
  lastParsedSemester: text('last_parsed_semester'),
  targetDegreeCredits: text('target_degree_credits'),
  targetCgpa: text('target_cgpa'),
  updatedAt: bigint('updatedat', { mode: 'number' }),
});
