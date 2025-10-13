import { serve } from "@hono/node-server";
import app from "./app.js";
import { auth } from "./routes/auth/auth.js";

app.on(["POST", "GET"], "/api/auth/*", (c) => auth.handler(c.req.raw));

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
