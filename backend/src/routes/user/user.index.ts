import { createRouter } from "../../lib/create-app.js";
import * as handlers from "./user.handlers.js";
import * as routes from "./user.routes.js";

export const user = createRouter()
  .openapi(routes.getOne, handlers.getOne)
  .openapi(routes.patch, handlers.patch);
