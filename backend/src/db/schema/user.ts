import { z } from "@hono/zod-openapi";

export const UserSchema = z
  .object({
    id: z.string().openapi({
      example: "123",
    }),
    name: z.string().openapi({
      example: "John Doe",
    }),
    email: z.string().email().openapi({
      example: "lucas@gmail.com",
    }),
    image: z.string().nullish().openapi({
      example: "github",
    }),
    createdAt: z.date().openapi({
      example: "",
    }),
  })
  .openapi("User");

export const uploadAvatarUserSchema = z.object({
  image: z.any().openapi({
    example: "123",
  }),
  imageKey: z.string().nullish().openapi({
    example: "John Doe",
  }),
});

export const PatchUserSchema = UserSchema.omit({ createdAt: true }).partial();
