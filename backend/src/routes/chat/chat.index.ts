import { createRouter } from "../../lib/create-app.js";
import * as handlers from "./chat.handlers.js";
import * as routes from "./chat.routes.js";

export const chat = createRouter()
  .openapi(routes.getAllChats, handlers.getAllChats)
  .openapi(routes.getChat, handlers.getChat)
  .openapi(routes.createChat, handlers.createChat)
  .openapi(routes.updateChat, handlers.updateChat)
  .openapi(routes.deleteChat, handlers.deleteChat)
  .openapi(routes.addMessage, handlers.addMessage);
