import { relations } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { users } from "./auth";
import { messagesTable } from "./message";

export const chatsTable = sqliteTable("chat", {
  id: text("id").primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull(),
  updateAt: integer("updateAt", { mode: "timestamp" })
    .notNull()
    .default(new Date()),
  name: text("name").notNull().default(""),
  systemPrompt: text("systemPrompt").notNull(),
});

export const chatsRelations = relations(chatsTable, ({ one, many }) => ({
  user: one(users, {
    fields: [chatsTable.userId],
    references: [users.id],
  }),
  histories: many(messagesTable),
}));
