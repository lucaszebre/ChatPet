import type { $Enums, Image } from "../../generated/prisma/index.js";

type HistoryItem = {
  role: "user" | "model";
  parts: Array<
    | { text: string }
    | {
        text: string;
        fileData: { displayName: string; fileUri: string; mimeType: string };
      }
  >;
};

type Message = {
  id: string;
  content: string;
  role: $Enums.role;
  chatId: string;
  createdAt: Date;
  image?: Image | null;
};
export function recreateHistory(messages: Message[]): HistoryItem[] {
  return messages.map((msg) => {
    if (msg.image?.displayName && msg.image?.fileUri && msg.image?.mimeType) {
      return {
        role: msg.role === "USER" ? "user" : "model",
        parts: [
          { text: msg.content },
          {
            text: msg.content,
            fileData: {
              displayName: msg.image.displayName,
              fileUri: msg.image.fileUri,
              mimeType: msg.image.mimeType,
            },
          },
        ],
      };
    }

    return {
      role: msg.role === "USER" ? "user" : "model",
      parts: [{ text: msg.content }],
    };
  });
}

export function historyToMessages(history: HistoryItem[]): Partial<Message>[] {
  return history.map((item) => ({
    role: item.role === "user" ? "USER" : "MODEL",
    content: item.parts[0]?.text ?? "",
  }));
}
