import {
  GenerateContentResponse,
  GoogleGenAI,
  type File as File_2,
} from "@google/genai";
import { env } from "cloudflare:workers";
import { and, asc, desc, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";
import { stream, streamText } from "hono/streaming";
import * as HttpStatusCodes from "stoker/http-status-codes";
import * as HttpStatusPhrases from "stoker/http-status-phrases";
import { v4 as uuidv4 } from "uuid";
import * as schema from "../../db/drizzleSchema";
import { recreateHistory } from "../../db/schema/recreateHistory.js";
import {
  SYSTEM_INSTRUCTION_ENGLISH,
  SYSTEM_INSTRUCTION_FRENCH,
} from "../../lib/system-prompts.js";
import type { AppRouteHandler } from "../../lib/types.js";
import { utapi } from "../../lib/uploadthing.js";
import type {
  DeleteChatRoute,
  GetAllChatsRoute,
  GetChatRoute,
  UpdateChatRoute,
} from "./chat.routes.js";
export type ChatMessage = {
  role: "user" | "model";
  parts: { text: string }[];
};

export type ChatType = {
  id: string;
  userId: string;
  createdAt: Date;
  updateAt: Date;
  name: string;
  isLoading?: boolean;
  histories?: ChatMessage[];
};

const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_AI_API_KEY || "" });

export const getAllChats: AppRouteHandler<GetAllChatsRoute> = async (c) => {
  const session = c.get("session");
  if (!session?.userId) {
    return c.json({ message: "Unauthorized" }, HttpStatusCodes.UNAUTHORIZED);
  }

  const db = drizzle(env.chatpet_d1, { schema });

  const chats = await db.query.chatsTable.findMany({
    where: eq(schema.chatsTable.userId, session.userId),
    orderBy: desc(schema.chatsTable.createdAt),
    with: {
      histories: {
        orderBy: asc(schema.messagesTable.createdAt),
        with: {
          image: {
            with: {
              message: true,
            },
          },
        },
      },
    },
  });

  return c.json(chats, HttpStatusCodes.OK);
};

export const getChat: AppRouteHandler<GetChatRoute> = async (c) => {
  const session = c.get("session");
  const { id } = c.req.valid("param");
  if (!session?.userId) {
    return c.json({ message: "Unauthorized" }, HttpStatusCodes.UNAUTHORIZED);
  }
  const db = drizzle(env.chatpet_d1, { schema });

  const chat = await db.query.chatsTable.findFirst({
    where: eq(schema.chatsTable.id, id),
    with: {
      histories: {
        with: {
          image: true,
        },
      },
    },
  });

  if (!chat) {
    return c.json(
      { message: HttpStatusPhrases.NOT_FOUND },
      HttpStatusCodes.NOT_FOUND
    );
  }
  return c.json(chat, HttpStatusCodes.OK);
};

export const createChat = async (c: any) => {
  const session = c.get("session");
  if (!session?.userId) {
    return c.json({ message: "Unauthorized" }, HttpStatusCodes.UNAUTHORIZED);
  }

  const body = await c.req.parseBody();

  const id = body["id"];
  const messageContent = body["content"];

  const image = body["image"];
  const lang = body["lang"];

  if (!messageContent) {
    return c.json({ message: "We need message" }, HttpStatusCodes.BAD_REQUEST);
  }

  if (!id) {
    return c.json({ message: "We need the id" }, HttpStatusCodes.BAD_REQUEST);
  }

  const chat = ai.chats.create({
    model: "gemini-2.5-flash",
    history: [],
    config: {
      systemInstruction:
        lang === "EN" ? SYSTEM_INSTRUCTION_ENGLISH : SYSTEM_INSTRUCTION_FRENCH,
    },
  });

  const sumUp = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: `Summarize this message in maximum 4 words, keeping the same language as the input message. Provide the output as a JSON object with a single key named 'summary': ${messageContent}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: "object",
        properties: {
          summary: {
            type: "string",
            description:
              "A 1-4 word summary of the message in the original language.",
            maxLength: 50,
          },
        },
        required: ["summary"],
      },
    },
  });

  const summary = JSON.parse(sumUp.text as string).summary as string;

  let chatResponseStream;
  let myFile: File_2;
  if (!image) {
    chatResponseStream = await chat.sendMessageStream({
      message: messageContent,
    });
  } else {
    if (image instanceof Array) {
      return c.json(
        { message: "No file provided or multiple files not allowed" },
        HttpStatusCodes.BAD_REQUEST
      );
    }

    if (!(image instanceof File)) {
      return c.json(
        { message: "Invalid file format" },
        HttpStatusCodes.BAD_REQUEST
      );
    }

    const maxSizeInBytes = 5 * 1024 * 1024;
    if (image.size > maxSizeInBytes) {
      return c.json(
        { message: "File size too large. Maximum allowed size is 10MB" },
        HttpStatusCodes.BAD_REQUEST
      );
    }

    const allowedImageTypes = ["image/jpeg", "image/jpg", "image/png"];

    if (!allowedImageTypes.includes(image.type)) {
      return c.json(
        {
          message:
            "Invalid file type. Only image files are allowed (JPEG, PNG, GIF, WebP, BMP)",
        },
        HttpStatusCodes.BAD_REQUEST
      );
    }

    myFile = await ai.files.upload({
      file: image,
    });

    chatResponseStream = await chat.sendMessageStream({
      message: [
        { text: messageContent },
        {
          fileData: {
            displayName: myFile.displayName,
            fileUri: myFile.uri,
            mimeType: myFile.mimeType,
          },
        },
      ],
    });
  }

  return stream(c, async (stream) => {
    let fullResponse = "";

    for await (const chunk of chatResponseStream) {
      const textChunk = chunk.text as string;
      fullResponse += textChunk;

      const dataStream = JSON.stringify({
        text: textChunk,
        name: summary,
        id,
        userId: session.userId,
      });

      await stream.writeln(dataStream);
    }

    const db = drizzle(env.chatpet_d1, { schema });

    try {
      await db.insert(schema.chatsTable).values({
        id,
        userId: session.userId,
        createdAt: new Date(),
        updateAt: new Date(),
        name: summary,
        systemPrompt:
          lang === "EN"
            ? SYSTEM_INSTRUCTION_ENGLISH
            : SYSTEM_INSTRUCTION_FRENCH,
      });

      if (image) {
        const { data } = await utapi.uploadFiles(image as File);

        if (!data?.ufsUrl) {
          return c.json(
            { message: "Failed to upload image to UploadThing" },
            HttpStatusCodes.INTERNAL_SERVER_ERROR
          );
        }

        const key = data.key;

        const messageArr = await db
          .insert(schema.messagesTable)
          .values({
            id: uuidv4(),
            chatId: id,
            content: messageContent,
            role: "USER",
          })
          .returning();

        const message = messageArr[0];

        await db.insert(schema.imagesTable).values({
          id: uuidv4(),

          url: data.ufsUrl,
          key: key,
          name: data.name,
          mimeType: myFile.mimeType ?? "",
          expirationTime: "",
          sizeBytes: myFile.sizeBytes ?? "",
          displayName: myFile.displayName ?? "",
          fileUri: myFile.uri ?? "",
          messageId: message.id,
        });
      } else {
        console.log(messageContent, "messageContent");
        console.log(fullResponse, "fullResponse");
        await db.batch([
          db.insert(schema.messagesTable).values({
            id: uuidv4(),
            chatId: id,
            content: messageContent,
            role: "USER",
          }),
          db.insert(schema.messagesTable).values({
            id: uuidv4(),
            chatId: id,
            content: fullResponse,
            role: "MODEL",
          }),
        ]);
      }
    } catch (error) {
      console.error("Failed to save chat to database:", error);
    }
  });
};

export const updateChat: AppRouteHandler<UpdateChatRoute> = async (c) => {
  const session = c.get("session");
  const { id } = c.req.valid("param");
  const updates = c.req.valid("json");

  if (!session?.userId) {
    return c.json({ message: "Unauthorized" }, HttpStatusCodes.UNAUTHORIZED);
  }
  const db = drizzle(env.chatpet_d1, { schema });

  const existingChat = await db.query.chatsTable.findFirst({
    where: eq(schema.chatsTable.id, id),
  });

  if (!existingChat) {
    return c.json(
      { message: HttpStatusPhrases.NOT_FOUND },
      HttpStatusCodes.NOT_FOUND
    );
  }
  await db
    .update(schema.chatsTable)
    .set({
      ...updates,
      updateAt: new Date(),
    })
    .where(eq(schema.chatsTable.id, id));

  const updatedChat = await db.query.chatsTable.findFirst({
    where: eq(schema.chatsTable.id, id),
    with: {
      histories: {
        with: {
          image: true,
        },
      },
    },
  });

  return c.json(updatedChat, HttpStatusCodes.OK);
};

export const deleteChat: AppRouteHandler<DeleteChatRoute> = async (c) => {
  const session = c.get("session");
  const { id } = c.req.valid("param");

  if (!session?.userId) {
    return c.json({ message: "Unauthorized" }, HttpStatusCodes.UNAUTHORIZED);
  }
  const db = drizzle(env.chatpet_d1, { schema });

  const existingChat = await db.query.chatsTable.findFirst({
    where: and(
      eq(schema.chatsTable.id, id),
      eq(schema.chatsTable.userId, session.userId)
    ),
    with: {
      histories: {
        with: {
          image: true,
        },
      },
    },
  });

  if (!existingChat) {
    return c.json(
      { message: HttpStatusPhrases.NOT_FOUND },
      HttpStatusCodes.NOT_FOUND
    );
  }

  const imageKeys = existingChat.histories
    .filter((msg) => msg.image)
    .map((msg) => msg.image?.key)
    .filter((key) => key) as string[];

  if (imageKeys.length > 0) {
    try {
      await utapi.deleteFiles(imageKeys);
    } catch (error) {
      console.error("Failed to delete images from UploadThing:", error);
    }
  }

  await db.delete(schema.chatsTable).where(eq(schema.chatsTable.id, id));
  return c.body(null, HttpStatusCodes.NO_CONTENT);
};

export const addMessage = async (c: any) => {
  const session = c.get("session");
  const { id } = c.req.valid("param");
  const body = await c.req.parseBody();

  const content = body["content"];

  const image = body["image"];

  if (!content) {
    return c.json({ message: "We need content" }, HttpStatusCodes.BAD_REQUEST);
  }

  if (!session?.userId) {
    return c.json({ message: "Unauthorized" }, HttpStatusCodes.UNAUTHORIZED);
  }
  const db = drizzle(env.chatpet_d1, { schema });

  const existingChat = await db.query.chatsTable.findFirst({
    where: and(
      eq(schema.chatsTable.id, id),
      eq(schema.chatsTable.userId, session.userId)
    ),
    with: {
      histories: {
        with: {
          image: true,
        },
      },
    },
  });

  if (!existingChat) {
    return c.json(
      { message: HttpStatusPhrases.NOT_FOUND },
      HttpStatusCodes.NOT_FOUND
    );
  }

  try {
    let chatResponseStream: AsyncGenerator<GenerateContentResponse>;
    const chat = ai.chats.create({
      model: "gemini-2.5-flash",
      history: [...recreateHistory(existingChat.histories)],
      config: {
        systemInstruction: existingChat.systemPrompt,
      },
    });

    if (!image) {
      chatResponseStream = await chat.sendMessageStream({
        message: content,
      });
    } else {
      if (image instanceof Array) {
        return c.json(
          { message: "No file provided or multiple files not allowed" },
          HttpStatusCodes.BAD_REQUEST
        );
      }

      if (!(image instanceof File)) {
        return c.json(
          { message: "Invalid file format" },
          HttpStatusCodes.BAD_REQUEST
        );
      }

      const maxSizeInBytes = 5 * 1024 * 1024;
      if (image.size > maxSizeInBytes) {
        return c.json(
          { message: "File size too large. Maximum allowed size is 10MB" },
          HttpStatusCodes.BAD_REQUEST
        );
      }

      const allowedImageTypes = ["image/jpeg", "image/jpg", "image/png"];
      if (!allowedImageTypes.includes(image.type)) {
        return c.json(
          {
            message:
              "Invalid file type. Only image files are allowed (JPEG, PNG, GIF, WebP, BMP)",
          },
          HttpStatusCodes.BAD_REQUEST
        );
      }

      const myfile = await ai.files.upload({
        file: image,
      });

      if (!myfile.uri || !myfile.mimeType) {
        return c.json(
          {
            message:
              "Invalid file type. Only image files are allowed (JPEG, PNG, GIF, WebP, BMP)",
          },
          HttpStatusCodes.BAD_REQUEST
        );
      }

      chatResponseStream = await chat.sendMessageStream({
        message: [
          { text: content },
          {
            fileData: {
              displayName: myfile.displayName,
              fileUri: myfile.uri,
              mimeType: myfile.mimeType,
            },
          },
        ],
      });
    }

    return streamText(c, async (stream) => {
      let fullResponse = "";

      for await (const chunk of chatResponseStream) {
        const textChunk = chunk.text as string;
        fullResponse += textChunk;

        const data = JSON.stringify({
          text: textChunk,
          id,
          userId: session.userId,
        });
        await stream.writeln(data);
      }

      try {
        if (image) {
          const { data } = await utapi.uploadFiles(image);

          if (!data?.ufsUrl) {
            return c.json(
              { message: "Failed to upload image to UploadThing" },
              HttpStatusCodes.INTERNAL_SERVER_ERROR
            );
          }

          const key = data.key;

          const messageArr = await db
            .insert(schema.messagesTable)
            .values({
              id: uuidv4(),

              chatId: id,
              content,
              role: "USER",
            })
            .returning();

          const message = messageArr[0];

          await db.insert(schema.imagesTable).values({
            id: uuidv4(),

            url: data.ufsUrl,
            key: key,
            name: data.name,
            mimeType: image.mimeType ?? "",
            expirationTime: "",
            sizeBytes: image.sizeBytes ?? "",
            displayName: image.displayName ?? "",
            fileUri: image.uri ?? "",
            messageId: message.id,
          });
        } else {
          await db.insert(schema.messagesTable).values({
            id: uuidv4(),

            chatId: id,
            content,
            role: "USER",
          });
        }

        await db.insert(schema.messagesTable).values({
          id: uuidv4(),
          chatId: id,
          content: fullResponse,
          role: "MODEL",
        });

        await db
          .update(schema.chatsTable)
          .set({ updateAt: new Date() })
          .where(eq(schema.chatsTable.id, id));
      } catch (error) {
        console.error("Failed to update chat/messages in database:", error);
      }
    });
  } catch (error) {
    const errorMessage = {
      role: "model",
      parts: [
        {
          text: "I'm sorry, I'm having trouble processing your request right now.",
        },
      ],
    };

    await db.insert(schema.messagesTable).values({
      id: uuidv4(),
      chatId: id,
      content: errorMessage.parts[0].text,
      role: "MODEL",
    });

    const updatedChat = await db
      .update(schema.chatsTable)
      .set({ updateAt: new Date() })
      .where(eq(schema.chatsTable.id, id));

    return c.json(updatedChat, HttpStatusCodes.OK);
  }
};
