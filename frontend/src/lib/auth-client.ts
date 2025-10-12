import { createAuthClient } from "better-auth/react";
export const authClient = createAuthClient({
  baseURL: "http://localhost:5000",
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
