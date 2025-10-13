import { cors } from "hono/cors";
import * as HttpStatusCodes from "stoker/http-status-codes";
import * as HttpStatusPhrases from "stoker/http-status-phrases";
import configureOpenAPI from "./lib/configure-open-api.js";
import createApp from "./lib/create-app.js";
import { auth } from "./routes/auth/auth.js";
import { chat } from "./routes/chat/chat.index.js";
import { user } from "./routes/user/user.index.js";

const app = createApp();

app.use("*", async (c, next) => {
  console.log(`[${c.req.method}] ${c.req.url}`);
  await next();
});

app.onError((err, c) => {
  console.error("Worker threw exception:", err);
  return c.json({ message: "Internal Server Error" }, 500);
});

app.use(
  "*", // or replace with "*" to enable cors for all routes
  cors({
    origin: (_, c) => c.env.TRUSTED_ORIGIN, // Your client's origin
    allowHeaders: [
      "Content-Type",
      "Authorization",
      "Access-Control-Allow-Headers",
      "Access-Control-Allow-Origin",
      "Access-Control-Request-Method",
      "Access-Control-Request-Headers",
    ],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    exposeHeaders: [
      "Content-Length",
      "x-request-id",
      "x-platform",
      "x-forwarded-for",
      "Access-Control-Allow-Headers",
      "Access-Control-Allow-Origin",
    ],
    credentials: true,
    maxAge: 86400, // 24 hours
  })
);

app.use(
  "/api/private/*", // or replace with "*" to enable cors for all routes
  cors({
    origin: (_, c) => c.env.TRUSTED_ORIGIN, // Your client's origin
    allowHeaders: [
      "Content-Type",
      "Authorization",
      "set-auth-token",
      "Access-Control-Allow-Headers",
      "Access-Control-Allow-Origin",
      "Access-Control-Request-Method",
      "Access-Control-Request-Headers",
    ],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    exposeHeaders: [
      "Content-Length",
      "x-request-id",
      "authorization",
      "x-platform",
      "x-forwarded-for",
      "set-auth-token",
      "Access-Control-Allow-Headers",
      "Access-Control-Allow-Origin",
    ],
    credentials: true,
    maxAge: 86400, // 24 hours
  })
);

app.use("*", async (c, next) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers });

  if (!session) {
    c.set("user", null);
    c.set("session", null);
    return next();
  }

  c.set("user", session.user);
  c.set("session", session.session);
  return next();
});

app.use("/api/private/*", async (c, next) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers });

  if (!session) {
    return c.json(
      {
        message: HttpStatusPhrases.UNAUTHORIZED,
      },
      HttpStatusCodes.UNAUTHORIZED
    );
  }

  return next();
});

app.get("/session", async (c) => {
  const session = c.get("session");
  const user = c.get("user");

  if (!user) return c.body(null, 401);

  return c.json({
    session,
    user,
  });
});

configureOpenAPI(app);

const routes = [user, chat] as const;

routes.forEach((route) => {
  app.route("/", route);
});

export type AppType = (typeof routes)[number];

export default app;
