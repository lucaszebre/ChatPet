import * as HttpStatusCodes from "stoker/http-status-codes";
import * as HttpStatusPhrases from "stoker/http-status-phrases";

import prismaClients from "../../db/prismaClient.js";
import { ZOD_ERROR_CODES, ZOD_ERROR_MESSAGES } from "../../lib/constants.js";
import type { AppRouteHandler } from "../../lib/types.js";
import type { GetOneRoute, PatchRoute } from "./user.routes.js";

export const getOne: AppRouteHandler<GetOneRoute> = async (c) => {
  const session = c.get("session");
  const prisma = await prismaClients.fetch(c.env.DB);

  const user = await prisma.user.findFirst({
    where: {
      id: session?.userId,
    },
  });

  if (!user) {
    return c.json(
      {
        message: HttpStatusPhrases.NOT_FOUND,
      },
      HttpStatusCodes.NOT_FOUND
    );
  }

  return c.json(user, HttpStatusCodes.OK);
};

export const patch: AppRouteHandler<PatchRoute> = async (c) => {
  const session = c.get("session");

  const updates = c.req.valid("json");

  if (!updates) {
    return c.json(
      {
        message: HttpStatusPhrases.BAD_REQUEST,
      },
      HttpStatusCodes.BAD_REQUEST
    );
  }

  if (Object.keys(updates).length === 0) {
    return c.json(
      {
        success: false,
        error: {
          issues: [
            {
              code: ZOD_ERROR_CODES.INVALID_UPDATES,
              path: [],
              message: ZOD_ERROR_MESSAGES.NO_UPDATES,
            },
          ],
          name: "ZodError",
        },
      },
      HttpStatusCodes.UNPROCESSABLE_ENTITY
    );
  }

  const prisma = await prismaClients.fetch(c.env.DB);

  const updatedUser = await prisma.user.update({
    where: { id: session?.userId! },
    data: updates,
  });

  return c.json(updatedUser, HttpStatusCodes.OK);
};
