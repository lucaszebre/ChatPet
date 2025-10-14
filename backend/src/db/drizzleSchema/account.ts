import { relations } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { users } from "./auth";

export const accountsTable = sqliteTable("account", {
  id: text("id").primaryKey(),
  accountId: text("accountId").notNull(),
  providerId: text("providerId").notNull(),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  accessToken: text("accessToken"),
  refreshToken: text("refreshToken"),
  idToken: text("idToken"),
  accessTokenExpiresAt: integer("accessTokenExpiresAt", {
    mode: "timestamp",
  }),
  refreshTokenExpiresAt: integer("refreshTokenExpiresAt", {
    mode: "timestamp",
  }),
  scope: text("scope"),
  password: text("password"),
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updatedAt", { mode: "timestamp" }).notNull(),
});

export const accountsRelations = relations(accountsTable, ({ one }) => ({
  user: one(users, {
    fields: [accountsTable.userId],
    references: [users.id],
  }),
}));
