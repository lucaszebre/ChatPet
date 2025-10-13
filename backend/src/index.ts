import app from "./app.js";
import { auth } from "./routes/auth/auth.js";

app.on(["POST", "GET"], "/api/auth/*", (c) => auth.handler(c.req.raw));

export default app;
