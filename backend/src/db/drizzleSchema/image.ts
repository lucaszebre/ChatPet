import { relations } from "drizzle-orm";
import { sqliteTable, text } from "drizzle-orm/sqlite-core";
import { messagesTable } from "./message";

export const imagesTable = sqliteTable("image", {
  id: text("id").primaryKey().default("uuid()"),
  url: text("url").notNull(),
  key: text("key"),
  name: text("name").notNull(),
  mimeType: text("mimeType").notNull(),
  sizeBytes: text("sizeBytes").notNull(),
  expirationTime: text("expirationTime").notNull(),
  displayName: text("displayName").notNull(),
  fileUri: text("fileUri").notNull(),
  messageId: text("messageId")
    .notNull()
    .unique()
    .references(() => messagesTable.id, { onDelete: "cascade" }),
});

export const imagesRelations = relations(imagesTable, ({ one }) => ({
  message: one(messagesTable, {
    fields: [imagesTable.messageId],
    references: [messagesTable.id],
  }),
}));
