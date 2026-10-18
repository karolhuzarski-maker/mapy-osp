import {sqliteTable,text,integer,primaryKey,index} from 'drizzle-orm/sqlite-core';
export const sessions=sqliteTable('sessions',{id:text('id').primaryKey(),createdAt:integer('created_at').notNull()});
export const memberships=sqliteTable('memberships',{sessionId:text('session_id').notNull(),unit:text('unit').notNull()},t=>[primaryKey({columns:[t.sessionId,t.unit]})]);
export const hazards=sqliteTable('hazards',{
 id:integer('id').primaryKey({autoIncrement:true}),unit:text('unit').notNull(),category:text('category').notNull(),kind:text('kind').notNull(),points:text('points').notNull(),description:text('description').notNull(),priority:text('priority').notNull(),owner:text('owner').notNull(),createdAt:integer('created_at').notNull(),updatedAt:integer('updated_at').notNull(),version:integer('version').notNull().default(1),deleted:integer('deleted').notNull().default(0)
},t=>[index('hazards_unit_idx').on(t.unit),index('hazards_owner_idx').on(t.owner)]);
export const notes=sqliteTable('notes',{unit:text('unit').primaryKey(),body:text('body').notNull(),version:integer('version').notNull(),updatedAt:integer('updated_at').notNull()});
