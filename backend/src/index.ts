import { serve } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";
import app from "./app.js";
import { auth } from "./routes/auth/auth.js";

app.on(["POST", "GET"], "/api/auth/*", (c) => auth.handler(c.req.raw));

app.get("/", (c) => {
  return c.text("welcome to the chat pet backend");
});

app.use(
  "*",
  serveStatic({
    root: "../frontend/dist",
  })
);

app.use("/*", serveStatic({ root: "../frontend/dist", path: "index.html" }));

serve(
  {
    fetch: app.fetch,
    port: 5000,
  },
  (info) => {
    console.log(`Server is running on http://localhost:${info.port}`);
  }
);

export default app;
