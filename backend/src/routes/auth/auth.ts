import { betterAuth } from "better-auth";
import { withCloudflare } from "better-auth-cloudflare";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { jwt } from "better-auth/plugins";
import { drizzle } from "drizzle-orm/d1";
import * as schema from "../../db/drizzleSchema";

function createAuth(
  env?: CloudflareBindings,
  cf?: IncomingRequestCfProperties
) {
  // Use actual DB for runtime, empty object for CLI
  const db = env
    ? drizzle(env.chatpet_d1, { schema, logger: true })
    : ({} as any);

  return betterAuth({
    ...withCloudflare(
      {
        cf: cf || {},

        d1: env
          ? {
              db,
              options: {
                usePlural: true,
                debugLogs: true,
              },
            }
          : undefined,
      },
      {
        plugins: [jwt()],
        trustedOrigins: env?.TRUSTED_ORIGIN ? [env.TRUSTED_ORIGIN] : [],
        logger: {
          level: "debug",
        },
        debug: true,
        advanced: {
          useSecureCookies: false,
          crossSubDomainCookies: {
            enabled: true,
            domain: env?.TRUSTED_ORIGIN ? env.TRUSTED_ORIGIN : "",
          },
        },
        socialProviders: {
          github: {
            clientId: env?.AUTH_GITHUB_ID ? env.AUTH_GITHUB_ID : "",
            clientSecret: env?.AUTH_GITHUB_SECRET ? env.AUTH_GITHUB_SECRET : "",
            redirectURI: env?.AUTH_URL
              ? `${env.AUTH_URL}/api/auth/callback/github`
              : "",
          },
          google: {
            clientId: env?.AUTH_GOOGLE_ID ? env.AUTH_GOOGLE_ID : "",
            clientSecret: env?.AUTH_GITHUB_SECRET ? env.AUTH_GOOGLE_SECRET : "",
            redirectURI: env?.AUTH_URL
              ? `${env.AUTH_URL}/api/auth/callback/google`
              : "",
          },
        },
      }
    ),
    // Only add database adapter for CLI schema generation
    ...(env
      ? {}
      : {
          database: drizzleAdapter({} as D1Database, {
            provider: "sqlite",
            usePlural: true,
            debugLogs: true,
          }),
        }),
  });
}

// Export for CLI schema generation
export const auth = createAuth();

// Export for runtime usage
export { createAuth };
