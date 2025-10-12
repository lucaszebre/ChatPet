/* eslint-disable node/no-process-env */
import { config } from "dotenv";
import { expand } from "dotenv-expand";
import path from "node:path";
import { z } from "zod";

expand(
  config({
    path: path.resolve(
      process.cwd(),
      process.env.NODE_ENV === "development" ? ".env.local" : ".env.production"
    ),
  })
);

const EnvSchema = z.object({
  NODE_ENV: z.string().default("development"),
  PORT: z.coerce.number().default(9999),
  LOG_LEVEL: z.enum([
    "fatal",
    "error",
    "warn",
    "info",
    "debug",
    "trace",
    "silent",
  ]),
  GOOGLE_AI_API_KEY: z.string(),
  BETTER_AUTH_SECRET: z.string(),
  BETTER_AUTH_URL: z.string(),
  AUTH_GITHUB_ID: z.string(),
  AUTH_GITHUB_SECRET: z.string(),
  AUTH_GOOGLE_ID: z.string(),
  AUTH_GOOGLE_SECRET: z.string(),
  HOST: z.string().default("locahost"),
  DATABASE_PASSWORD: z.string().default("root"),
  DATABASE_USER: z.string().default("lucas"),
  DATABASE_PORT: z.coerce.number().default(5432),
  SEVER_PORT: z.coerce.number().default(5000),
  DATABASE: z.string().default("applyeasy"),
  DATABASE_URL: z.string(),
  DIRECT_URL: z.string(),
  SHADOW_DATABASE_URL: z.string().optional(),
  REDIRECT_PROXY_URL: z.string(),
  AUTH_URL: z.string(),
  TRUSTED_ORIGIN: z.string(),
  UPLOADTHING_TOKEN: z.string(),
});

export type env = z.infer<typeof EnvSchema>;

// eslint-disable-next-line ts/no-redeclare
const { data: env, error } = EnvSchema.safeParse(process.env);

if (error) {
  console.error("❌ Invalid env:");
  console.error(JSON.stringify(error.flatten().fieldErrors, null, 2));
  process.exit(1);
}

export default env!;
