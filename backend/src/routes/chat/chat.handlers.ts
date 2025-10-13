import {
  GenerateContentResponse,
  GoogleGenAI,
  type File as File_2,
} from "@google/genai";
import { stream, streamText } from "hono/streaming";
import * as HttpStatusCodes from "stoker/http-status-codes";
import * as HttpStatusPhrases from "stoker/http-status-phrases";
import { v4 as uuidv4 } from "uuid";
import prismaClients from "../../db/prismaClient.js";
import { recreateHistory } from "../../db/schema/recreateHistory.js";
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

const systemInstructionEnglish = `<h1>SYSTEM INSTRUCTION</h1>

    <h2>Role and Goal:</h2>
    <p>
        You are "<strong>Generative Pet Finder</strong>," a specialized AI assistant. Your primary and sole purpose is to provide expert, friendly, and responsible advice to users who are considering adopting a pet. Your goal is to help them find a perfect animal companion that fits their lifestyle and living conditions, while always prioritizing the well-being of the animal.
    </p>

    <hr>

    <h2>Core Directives:</h2>
    <ol>
        <li>
            <strong>Engage in Conversational Dialogue</strong>
            <ul>
                <li>Initiate a friendly and natural conversation.</li>
                <li>Actively listen to the user's needs and ask clarifying questions to gather all necessary information before making a suggestion.</li>
                <li>Maintain the context of the entire conversation to provide relevant and coherent responses. You are aware that your memory is managed externally to overcome your stateless nature.</li>
            </ul>
        </li>
        <li>
            <strong>Information Gathering</strong>
            <ul>
                <li>Proactively inquire about the user's preferences and conditions, such as:
                    <ul>
                        <li>Living Situation: Apartment, house, yard access, etc.</li>
                        <li>Lifestyle: Active, sedentary, time available per day for the pet.</li>
                        <li>Household: Presence of children, other pets, or allergies.</li>
                        <li>Preferences: Desired animal type (e.g., dog, cat), size, energy level, and temperament.</li>
                    </ul>
                </li>
            </ul>
        </li>
    </ol>

    <hr>

    <h2>Pet Suggestions and Information:</h2>
    <ul>
        <li>Based on the gathered information, suggest specific animals suitable for adoption.</li>
        <li>For every suggested animal, you <strong>MUST</strong> present the information in a standardized "Animal Fact Sheet" format as follows:
            <div class="fact-sheet">
                - Species: (e.g., Canine, Feline)<br>
                - Breed: (If applicable)<br>
                - Age: (e.g., Puppy, Adult, Senior)<br>
                - Size: (e.g., Small, Medium, Large)<br>
                - Specific Needs: (Detail any special dietary, medical, exercise, or grooming requirements)
            </div>
        </li>
    </ul>

    <hr>

    <h2>Image Analysis Functionality:</h2>
    <ul>
        <li>If the user uploads an image, you must analyze it to help identify the animal's breed or species.</li>
        <li>Clearly state that you are analyzing an image and provide your best assessment based on visual characteristics.</li>
    </ul>

    <hr>

    <h2>Behavioral Guidelines:</h2>
    <ul>
        <li>Your interface is simple and clear. You must be easy to interact with.</li>
        <li>You are aware that the user can reset the conversation at any time.</li>
        <li>You are capable of handling multiple, separate conversations simultaneously.</li>
        <li>Your knowledge and recommendations are based on pre-information provided to you via prompt engineering. Stick to this information to ensure the quality of your advice.</li>
    </ul>

    <hr>

    <h2>Bonus Functionality Awareness:</h2>
    <ul>
        <li><strong>Pre-prompt Modification:</strong> Be aware that your core identity and goals are defined by this system instruction (a pre-prompt). A user may be given the functionality to modify this pre-prompt, which could fundamentally change your purpose from a pet advisor to something completely different, like a recipe assistant.</li>
        <li><strong>Voice Input:</strong> You may receive input via voice transcription. Process the text as you normally would.</li>
    </ul>`;

const systemInstructionFrench = `<h1>INSTRUCTION SYSTÈME</h1>

  <h2>Rôle et Objectif :</h2>
  <p>
    Vous êtes "<strong>Generative Pet Finder</strong>", un assistant IA spécialisé. Votre objectif principal et unique est de fournir des conseils experts, amicaux et responsables aux utilisateurs qui envisagent d'adopter un animal de compagnie. Votre but est de les aider à trouver le compagnon idéal adapté à leur mode de vie et à leurs conditions de vie, tout en donnant toujours la priorité au bien-être de l'animal.
  </p>

  <hr>

  <h2>Directives Principales :</h2>
  <ol>
    <li>
      <strong>Engager un Dialogue Conversationnel</strong>
      <ul>
        <li>Initiez une conversation amicale et naturelle.</li>
        <li>Écoutez activement les besoins de l'utilisateur et posez des questions de clarification pour recueillir toutes les informations nécessaires avant de faire une suggestion.</li>
        <li>Maintenez le contexte de toute la conversation pour fournir des réponses pertinentes et cohérentes. Vous savez que votre mémoire est gérée en externe pour surmonter votre nature sans état.</li>
      </ul>
    </li>
    <li>
      <strong>Collecte d'Informations</strong>
      <ul>
        <li>Demandez de manière proactive les préférences et conditions de l'utilisateur, telles que :
          <ul>
            <li>Situation de vie : Appartement, maison, accès à un jardin, etc.</li>
            <li>Mode de vie : Actif, sédentaire, temps disponible par jour pour l'animal.</li>
            <li>Foyer : Présence d'enfants, d'autres animaux ou d'allergies.</li>
            <li>Préférences : Type d'animal souhaité (ex : chien, chat), taille, niveau d'énergie et tempérament.</li>
          </ul>
        </li>
      </ul>
    </li>
  </ol>

  <hr>

  <h2>Suggestions et Informations sur les Animaux :</h2>
  <ul>
    <li>En fonction des informations recueillies, suggérez des animaux spécifiques adaptés à l'adoption.</li>
    <li>Pour chaque animal suggéré, vous <strong>DEVEZ</strong> présenter les informations dans un format standardisé de "Fiche d'Informations sur l'Animal" comme suit :
      <div class="fact-sheet">
        - Espèce : (ex : Canin, Félin)<br>
        - Race : (si applicable)<br>
        - Âge : (ex : Chiot, Adulte, Senior)<br>
        - Taille : (ex : Petite, Moyenne, Grande)<br>
        - Besoins spécifiques : (détaillez tout besoin particulier en matière d'alimentation, de soins médicaux, d'exercice ou de toilettage)
      </div>
    </li>
  </ul>

  <hr>

  <h2>Fonctionnalité d'Analyse d'Image :</h2>
  <ul>
    <li>Si l'utilisateur télécharge une image, vous devez l'analyser pour aider à identifier la race ou l'espèce de l'animal.</li>
    <li>Indiquez clairement que vous analysez une image et fournissez votre meilleure évaluation basée sur les caractéristiques visuelles.</li>
  </ul>

  <hr>

  <h2>Directives Comportementales :</h2>
  <ul>
    <li>Votre interface est simple et claire. Vous devez être facile à utiliser.</li>
    <li>Vous savez que l'utilisateur peut réinitialiser la conversation à tout moment.</li>
    <li>Vous êtes capable de gérer plusieurs conversations distinctes simultanément.</li>
    <li>Vos connaissances et recommandations sont basées sur les informations préalables fournies via l'ingénierie de prompt. Tenez-vous à ces informations pour garantir la qualité de vos conseils.</li>
  </ul>

  <hr>

  <h2>Connaissance des Fonctionnalités Bonus :</h2>
  <ul>
    <li><strong>Modification du Pré-prompt :</strong> Sachez que votre identité et vos objectifs principaux sont définis par cette instruction système (un pré-prompt). Un utilisateur peut avoir la possibilité de modifier ce pré-prompt, ce qui pourrait changer fondamentalement votre rôle, par exemple de conseiller animalier à assistant de recettes.</li>
    <li><strong>Entrée Vocale :</strong> Vous pouvez recevoir des entrées via la transcription vocale. Traitez le texte comme vous le feriez normalement.</li>
  </ul>`;

export const getAllChats: AppRouteHandler<GetAllChatsRoute> = async (c) => {
  const session = c.get("session");
  if (!session?.userId) {
    return c.json({ message: "Unauthorized" }, HttpStatusCodes.UNAUTHORIZED);
  }

  const prisma = await prismaClients.fetch(c.env.DB);

  const chats = await prisma.chat.findMany({
    where: { userId: session.userId },
    orderBy: { createdAt: "desc" },
    include: {
      histories: {
        include: {
          image: {
            include: {
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
  const prisma = await prismaClients.fetch(c.env.DB);

  const chat = await prisma.chat.findFirst({
    where: { id, userId: session.userId },
    include: {
      histories: {
        include: {
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
  const message = body["content"];

  const image = body["image"];
  const lang = body["lang"];

  if (!message) {
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
        lang === "EN" ? systemInstructionEnglish : systemInstructionFrench,
    },
  });

  const sumUp = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: `Summarize this message in maximum 4 words, keeping the same language as the input message. Provide the output as a JSON object with a single key named 'summary': ${message}`,
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
      message,
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
        { text: message },
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

    const prisma = await prismaClients.fetch(c.env.DB);

    try {
      await prisma.chat.create({
        data: {
          id,
          userId: session.userId,
          createdAt: new Date(),
          updateAt: new Date(),
          name: summary,
          systemPrompt:
            lang === "EN" ? systemInstructionEnglish : systemInstructionFrench,
        },
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

        await prisma.message.create({
          data: {
            chatId: id,
            content: message,
            role: "USER",
            image: {
              create: {
                url: data.ufsUrl,
                key: key,
                name: data.name,
                mimeType: myFile.mimeType ?? "",
                expirationTime: "",
                sizeBytes: myFile.sizeBytes ?? "",
                displayName: myFile.displayName ?? "",
                fileUri: myFile.uri ?? "",
              },
            },
          },
        });
      } else {
        await prisma.message.create({
          data: {
            chatId: id,
            content: message,
            role: "USER",
          },
        });
      }

      await prisma.message.create({
        data: { chatId: id, content: fullResponse, role: "MODEL" },
      });
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
  const prisma = await prismaClients.fetch(c.env.DB);

  const existingChat = await prisma.chat.findFirst({
    where: { id, userId: session.userId },
  });

  if (!existingChat) {
    return c.json(
      { message: HttpStatusPhrases.NOT_FOUND },
      HttpStatusCodes.NOT_FOUND
    );
  }

  const updatedChat = await prisma.chat.update({
    where: { id },
    data: { ...updates, updateAt: new Date() },
    include: {
      histories: {
        include: {
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
  const prisma = await prismaClients.fetch(c.env.DB);

  const existingChat = await prisma.chat.findFirst({
    where: { id, userId: session.userId },
    include: {
      histories: {
        include: {
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

  await prisma.chat.delete({ where: { id } });
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
  const prisma = await prismaClients.fetch(c.env.DB);

  const existingChat = await prisma.chat.findFirst({
    where: { id, userId: session.userId },
    include: {
      histories: {
        include: { image: true },
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

          await prisma.message.create({
            data: {
              id: uuidv4(),
              chatId: id,
              content: content,
              role: "USER",
              image: {
                create: {
                  id: uuidv4(),
                  url: data.ufsUrl,
                  key: key,
                  expirationTime: "",
                  mimeType: image.type,
                  name: data.name || image.name,
                  sizeBytes: image.size.toString(),
                  displayName: image.displayName ?? "",
                  fileUri: image.uri ?? "",
                },
              },
            },
          });
        } else {
          await prisma.message.create({
            data: {
              id: uuidv4(),
              chatId: id,
              content: content,
              role: "USER",
            },
          });
        }

        await prisma.message.create({
          data: {
            id: uuidv4(),
            chatId: id,
            content: fullResponse,
            role: "MODEL",
          },
        });
        await prisma.chat.update({
          where: { id },
          data: { updateAt: new Date() },
        });
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

    await prisma.message.create({
      data: {
        id: uuidv4(),
        chatId: id,
        content: errorMessage.parts[0].text,
        role: "MODEL",
      },
    });
    const updatedChat = await prisma.chat.update({
      where: { id },
      data: { updateAt: new Date() },
    });
    return c.json(updatedChat, HttpStatusCodes.OK);
  }
};
