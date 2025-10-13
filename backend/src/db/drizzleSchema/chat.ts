import { relations } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { messagesTable } from "./message";
import { usersTable } from "./user";

export const chatsTable = sqliteTable("chat", {
  id: text("id").primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull(),
  updateAt: integer("updateAt", { mode: "timestamp" })
    .notNull()
    .default(new Date()),
  name: text("name").notNull().default(""),
  systemPrompt: text("systemPrompt").notNull(),
});

export const chatsRelations = relations(chatsTable, ({ one, many }) => ({
  user: one(usersTable, {
    fields: [chatsTable.userId],
    references: [usersTable.id],
  }),
  histories: many(messagesTable),
}));
