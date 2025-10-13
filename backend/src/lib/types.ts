import type { OpenAPIHono, RouteConfig, RouteHandler } from "@hono/zod-openapi";
import type { PinoLogger } from "hono-pino";
import type { auth } from "../routes/auth/auth.js";

export interface AppBindings {
  Bindings: {
    BETTER_AUTH_SECRET: string;
    BETTER_AUTH_URL: string;
    AUTH_GITHUB_ID: string;
    AUTH_GITHUB_SECRET: string;
    GOOGLE_AI_API_KEY: string;
    AUTH_GOOGLE_ID: string;
    AUTH_GOOGLE_SECRET: string;
    HOST: string;
    DATABASE_PASSWORD: string;
    DATABASE_USER: string;
    DATABASE_PORT: string;
    SERVER_PORT: string;
    DATABASE: string;
    DATABASE_URL: string;
    DIRECT_URL: string;
    SHADOW_DATABASE_URL: string;
    REDIRECT_PROXY_URL: string;
    AUTH_URL: string;
    UPLOADTHING_TOKEN: string;
    TRUSTED_ORIGIN: string;
    LOG_LEVEL: string;
    VITE_BACKEND_BASE_URL: string;
    DB: D1Database;
  };

  Variables: {
    logger: PinoLogger;

    user: typeof auth.$Infer.Session.user | null;
    session: typeof auth.$Infer.Session.session | null;
  };
}

export type AppOpenAPI = OpenAPIHono<AppBindings>;

export type AppRouteHandler<R extends RouteConfig> = RouteHandler<
  R,
  AppBindings
>;
