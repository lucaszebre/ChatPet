import { z } from "@hono/zod-openapi";

export const ImageSchema = z.object({
  id: z.string(),
  url: z.string(),
  key: z.string().optional().nullable(),
  name: z.string(),
  mimeType: z.string(),
  sizeBytes: z.string(),
  expirationTime: z.string(),
  displayName: z.string(),
  fileUri: z.string(),
  messageId: z.string(),
});

export const MessageSchema = z.object({
  id: z.string(),
  content: z.string(),
  chatId: z.string(),
  role: z.enum(["USER", "MODEL"]).openapi({
    example: "USER",
  }),
  image: ImageSchema.optional().nullable(),
});

export const ChatSchema = z
  .object({
    id: z.string().openapi({
      example: "chat_123",
    }),
    userId: z.string().openapi({
      example: "user_123",
    }),
    histories: z.array(MessageSchema),
    createdAt: z.string().datetime().openapi({
      example: "2024-01-01T10:00:00Z",
    }),
    updateAt: z.string().datetime().openapi({
      example: "2024-01-01T10:30:00Z",
    }),
    name: z.string().openapi({
      example: "My Chat",
      default: "",
    }),
    systemPrompt: z.string().openapi({
      example: "You are a helpful assistant",
    }),
  })
  .openapi("Chat");

export const CreateChatSchema = ChatSchema.omit({
  createdAt: true,
  updateAt: true,
  userId: true,
  name: true,
}).extend({
  message: z.string(),
  file: z.file().optional(),
  lang: z.enum(["FR", "EN"]).openapi({
    example: "FR",
  }),
});

export const UpdateChatSchema = ChatSchema.omit({
  id: true,
  userId: true,
  createdAt: true,
  histories: true,
}).partial();

export const ChatHistoryMessageSchema = z.object({
  role: z.enum(["user", "assistant", "system"]).openapi({
    example: "user",
  }),
  content: z.string().openapi({
    example: "Hello, how can I help you today?",
  }),
  timestamp: z.string().datetime().openapi({
    example: "2024-01-01T10:00:00Z",
  }),
});

export const ChatHistoriesSchema = z.array(ChatHistoryMessageSchema).openapi({
  example: [
    {
      role: "user",
      content: "Hello, how are you?",
      timestamp: "2024-01-01T10:00:00Z",
    },
    {
      role: "assistant",
      content: "I'm doing well, thank you! How can I assist you today?",
      timestamp: "2024-01-01T10:00:05Z",
    },
  ],
});
