import { relations } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { users } from "./auth";

export const sessionsTable = sqliteTable("session", {
  id: text("id").primaryKey(),
  expiresAt: integer("expiresAt", { mode: "timestamp" }).notNull(),
  token: text("token").notNull().unique(),
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updatedAt", { mode: "timestamp" }).notNull(),
  ipAddress: text("ipAddress"),
  userAgent: text("userAgent"),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
});

export const sessionsRelations = relations(sessionsTable, ({ one }) => ({
  user: one(users, {
    fields: [sessionsTable.userId],
    references: [users.id],
  }),
}));
