import { createAuthClient } from "better-auth/react";
export const authClient = createAuthClient({
  baseURL: "https://backend-chatpet.yakirisk.workers.dev",
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 60 * 60 * 24,
      freshAge: 60 * 60,
    },
    token: true,
  },
});

export const $fetchWithClient = authClient.$fetch;
