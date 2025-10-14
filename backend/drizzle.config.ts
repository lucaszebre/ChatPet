import "dotenv/config";
import { defineConfig } from "drizzle-kit";
import path from "node:path";

import fs from "node:fs";

function getLocalD1DB() {
  try {
    const basePath = path.resolve(".wrangler/state/v3/d1");
    const dbFile = fs.readdirSync(basePath).find((f) => f.endsWith(".sqlite"));

    if (!dbFile) {
      console.log(`Running on local d1`);
      return;
    }

    const url = path.resolve(basePath, dbFile);
    return url;
  } catch (err) {
    console.log(`Error  ${err}`);
  }
}

export default defineConfig({
  out: "./drizzle",
  schema: "./src/db/drizzleSchema/index.ts",
  dialect: "sqlite",
  ...(process.env.NODE_ENV === "production"
    ? {
        driver: "d1-http",
        dbCredentials: {
          accountId: process.env.CLOUDFLARE_ACCOUNT_ID!,
          databaseId: process.env.CLOUDFLARE_DATABASE_ID!,
          token: process.env.CLOUDFLARE_D1_TOKEN!,
        },
      }
    : {
        dbCredentials: {
          url: getLocalD1DB()!,
        },
      }),
});
