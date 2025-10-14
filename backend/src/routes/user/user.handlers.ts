import { drizzle } from "drizzle-orm/d1";
import * as HttpStatusCodes from "stoker/http-status-codes";
import * as HttpStatusPhrases from "stoker/http-status-phrases";

import { env } from "cloudflare:workers";
import { eq } from "drizzle-orm";
import * as schema from "../../db/drizzleSchema";
import { ZOD_ERROR_CODES, ZOD_ERROR_MESSAGES } from "../../lib/constants.js";
import type { AppRouteHandler } from "../../lib/types.js";
import type { GetOneRoute, PatchRoute } from "./user.routes.js";

export const getOne: AppRouteHandler<GetOneRoute> = async (c) => {
  const session = c.get("session");
  const db = drizzle(env.chatpet_d1, { schema });

  const user = await db.query.users.findFirst({
    where: eq(schema.users.id, session?.userId as string),
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

  const db = drizzle(env.chatpet_d1, { schema });

  const updatedUser = await db
    .update(schema.users)
    .set({ ...updates })
    .where(eq(schema.chatsTable.id, session?.userId as string))
    .returning();

  const user = updatedUser[0];

  return c.json(user, HttpStatusCodes.OK);
};
