import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { jwt } from "better-auth/plugins";
import { prisma } from "../../db/index.js";

import env from "../../env.js";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  plugins: [jwt()],
  socialProviders: {
    github: {
      clientId: env.AUTH_GITHUB_ID,
      clientSecret: env.AUTH_GITHUB_SECRET,
    },
    google: {
      clientId: env.AUTH_GOOGLE_ID as string,
      clientSecret: env.AUTH_GOOGLE_SECRET as string,
    },
  },
  trustedOrigins: [env.TRUSTED_ORIGIN],
  logger: {
    level: "debug",
  },
  debug: true,
});
