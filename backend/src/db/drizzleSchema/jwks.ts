import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const jwksTable = sqliteTable("jwks", {
  id: text("id").primaryKey(),
  publicKey: text("publicKey").notNull(),
  privateKey: text("privateKey").notNull(),
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull(),
});
