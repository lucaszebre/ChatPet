import { createRoute, z } from "@hono/zod-openapi";
import * as HttpStatusCodes from "stoker/http-status-codes";
import { jsonContent, jsonContentRequired } from "stoker/openapi/helpers";
import {
  createErrorSchema,
  createMessageObjectSchema,
} from "stoker/openapi/schemas";
import {
  ChatHistoryMessageSchema,
  ChatSchema,
  CreateChatSchema,
  UpdateChatSchema,
} from "../../db/schema/chat.js";
import { notFoundSchema } from "../../lib/constants.js";

const tags = ["Chat"];

export const getAllChats = createRoute({
  path: "/api/private/chats",
  method: "get",
  tags,
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      z.array(ChatSchema),
      "List of user chats"
    ),
    [HttpStatusCodes.UNAUTHORIZED]: jsonContent(
      createMessageObjectSchema("Unauthorized"),
      "User not authenticated"
    ),
  },
});

export const getChat = createRoute({
  path: "/api/private/chat/{id}",
  method: "get",
  request: {
    params: z.object({
      id: z.string().openapi({
        param: {
          name: "id",
          in: "path",
        },
        example: "chat_123",
      }),
    }),
  },
  tags,
  responses: {
    [HttpStatusCodes.OK]: jsonContent(ChatSchema, "The requested chat"),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(notFoundSchema, "Chat not found"),
    [HttpStatusCodes.UNAUTHORIZED]: jsonContent(
      createMessageObjectSchema("Unauthorized"),
      "User not authenticated"
    ),
  },
});

export const createChat = createRoute({
  path: "/api/private/chat",
  method: "post",

  tags,
  responses: {
    [HttpStatusCodes.OK]: {
      description: "Streaming response with AI chat messages",
      content: {
        "text/plain": {
          schema: {
            type: "string",
          },
        },
      },
    },
    [HttpStatusCodes.BAD_REQUEST]: jsonContent(
      createMessageObjectSchema("Invalid request body"),
      "Invalid request body"
    ),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(CreateChatSchema),
      "The validation error(s)"
    ),
    [HttpStatusCodes.UNAUTHORIZED]: jsonContent(
      createMessageObjectSchema("Unauthorized"),
      "User not authenticated"
    ),
  },
});

export const updateChat = createRoute({
  path: "/api/private/chat/{id}",
  method: "patch",
  request: {
    params: z.object({
      id: z.string().openapi({
        param: {
          name: "id",
          in: "path",
        },
        example: "chat_123",
      }),
    }),
    body: jsonContentRequired(UpdateChatSchema, "The chat updates"),
  },
  tags,
  responses: {
    [HttpStatusCodes.OK]: jsonContent(ChatSchema, "The updated chat"),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(notFoundSchema, "Chat not found"),
    [HttpStatusCodes.BAD_REQUEST]: jsonContent(
      createMessageObjectSchema("Invalid request body"),
      "Invalid request body"
    ),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(UpdateChatSchema),
      "The validation error(s)"
    ),
    [HttpStatusCodes.UNAUTHORIZED]: jsonContent(
      createMessageObjectSchema("Unauthorized"),
      "User not authenticated"
    ),
  },
});

export const deleteChat = createRoute({
  path: "/api/private/chat/{id}",
  method: "delete",
  request: {
    params: z.object({
      id: z.string().openapi({
        param: {
          name: "id",
          in: "path",
        },
        example: "chat_123",
      }),
    }),
  },
  tags,
  responses: {
    [HttpStatusCodes.NO_CONTENT]: {
      description: "Chat deleted successfully",
    },
    [HttpStatusCodes.NOT_FOUND]: jsonContent(notFoundSchema, "Chat not found"),
    [HttpStatusCodes.UNAUTHORIZED]: jsonContent(
      createMessageObjectSchema("Unauthorized"),
      "User not authenticated"
    ),
  },
});

export const addMessage = createRoute({
  path: "/api/private/chat/{id}/message",
  method: "post",
  request: {
    params: z.object({
      id: z.string().openapi({
        param: {
          name: "id",
          in: "path",
        },
        example: "chat_123",
      }),
    }),
  },
  tags,
  responses: {
    [HttpStatusCodes.OK]: {
      description: "Streaming response with AI chat messages",
      content: {
        "text/plain": {
          schema: {
            type: "string",
          },
        },
      },
    },
    [HttpStatusCodes.NOT_FOUND]: jsonContent(notFoundSchema, "Chat not found"),
    [HttpStatusCodes.BAD_REQUEST]: jsonContent(
      createMessageObjectSchema("Invalid message format"),
      "Invalid message format"
    ),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(ChatHistoryMessageSchema),
      "The validation error(s)"
    ),
    [HttpStatusCodes.UNAUTHORIZED]: jsonContent(
      createMessageObjectSchema("Unauthorized"),
      "User not authenticated"
    ),
  },
});

export type GetAllChatsRoute = typeof getAllChats;
export type GetChatRoute = typeof getChat;
export type CreateChatRoute = typeof createChat;
export type UpdateChatRoute = typeof updateChat;
export type DeleteChatRoute = typeof deleteChat;
export type AddMessageRoute = typeof addMessage;
