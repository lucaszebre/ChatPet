import { createRoute } from "@hono/zod-openapi";
import * as HttpStatusCodes from "stoker/http-status-codes";
import { jsonContent, jsonContentRequired } from "stoker/openapi/helpers";
import {
  createErrorSchema,
  createMessageObjectSchema,
} from "stoker/openapi/schemas";
import {
  PatchUserSchema,
  uploadAvatarUserSchema,
  UserSchema,
} from "../../db/schema/user.js";
import { notFoundSchema } from "../../lib/constants.js";

const tags = ["User"];

export const getOne = createRoute({
  path: "/api/private/user",
  method: "get",
  tags,
  responses: {
    [HttpStatusCodes.OK]: jsonContent(UserSchema, "The requested user"),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(notFoundSchema, "User not found"),
  },
});

export const patch = createRoute({
  path: "/api/private/user",
  method: "patch",
  request: {
    body: jsonContentRequired(PatchUserSchema, "The user updates"),
  },
  tags,
  responses: {
    [HttpStatusCodes.BAD_REQUEST]: jsonContent(
      createMessageObjectSchema("empty body"),
      "The updated user"
    ),

    [HttpStatusCodes.OK]: jsonContent(UserSchema, "The updated user"),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(notFoundSchema, "user not found"),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(PatchUserSchema),
      "The validation error(s)"
    ),
  },
});

export const uploadAvatar = createRoute({
  path: "/api/private/user-avatar",
  method: "post",
  request: {
    body: jsonContentRequired(
      uploadAvatarUserSchema,
      "The Body don't respect the need"
    ),
  },
  tags,
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      uploadAvatarUserSchema,
      "new Avatar User"
    ),

    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(uploadAvatarUserSchema),
      "The validation error(s)"
    ),
    [HttpStatusCodes.INTERNAL_SERVER_ERROR]: jsonContent(
      createMessageObjectSchema("Could not upload the avatar"),
      "Could not upload the avatar"
    ),
  },
});

export type GetOneRoute = typeof getOne;
export type PatchRoute = typeof patch;
export type UploadAvatarRoute = typeof uploadAvatar;
