import { relations } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { chatsTable } from "./chat";
import { imagesTable } from "./image";

export const messagesTable = sqliteTable("message", {
  id: text("id").primaryKey().default("uuid()"),
  content: text("content").notNull(),
  role: text("role", { enum: ["USER", "MODEL"] }).notNull(),
  chatId: text("chatId")
    .notNull()
    .references(() => chatsTable.id, { onDelete: "cascade" }),
  createdAt: integer("createdAt", { mode: "timestamp" })
    .notNull()
    .default(new Date()),
});

export const messagesRelations = relations(messagesTable, ({ one }) => ({
  chat: one(chatsTable, {
    fields: [messagesTable.chatId],
    references: [chatsTable.id],
  }),
  image: one(imagesTable, {
    fields: [messagesTable.id],
    references: [imagesTable.messageId],
  }),
}));
