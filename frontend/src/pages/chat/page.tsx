import { ChatInput } from "@/components/chat-input";
import { ChatMessage } from "@/components/chat-message";
import Dialog from "@/components/implementation/dialog";
import { Button } from "@/components/ui/button";
import { DialogClose } from "@/components/ui/dialog";
import type { ChatType } from "@/types";
import "@mdxeditor/editor/style.css";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useLocalStorage } from "@uidotdev/usehooks";
import { Plus } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router";
import { v4 as uuidv4 } from "uuid";

type ROLE = "USER" | "MODEL";
export type Message = {
  id: string;
  role: ROLE;
  content?: string;
  timestamp?: string;
  createdAt?: string;
  image?: {
    id: string;
    url: string;
    messageId: string;
    mineType: string;
    sizeBytes: string;
    expirationTime: string;
    name: string;
  };
};

export const Chat = () => {
  const { t } = useTranslation("home");

  const [messages, setMessages] = useState<Message[]>([]);
  const [currentResponse, setCurrentResponse] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [search, setSearch] = useState("");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [threads, saveThreads] = useLocalStorage<ChatType[]>("threads", []);
  const [editable, setEditable] = useState(false);
  const { id } = useParams<{ id: string }>();

  const editor = useEditor({
    extensions: [StarterKit],
    editable, // define your extension array
  });
  useEffect(() => {
    const scrollToBottom = () => {
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({
          behavior: "smooth",
          block: "end",
        });
      }
    };

    const timeoutId = setTimeout(scrollToBottom, 100);

    return () => clearTimeout(timeoutId);
  }, [messages, currentResponse]);

  const handleFileSelect = (file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      toast.error("The size of the image is too large (max 5MB)");
      setIsPopoverOpen(false);
      return;
    }
    if (!["image/jpg", "image/png", "image/jpeg"].includes(file.type)) {
      toast.error("You need to upload a valid Image ");
      setIsPopoverOpen(false);
      return;
    }

    setUploadedFile(file);
    setIsPopoverOpen(false);
  };
  console.log(t("common:lang"), "lang");
  const sendMessage = useCallback(
    async (
      content: { message: string; image?: File },
      signal?: AbortSignal
    ) => {
      const { message, image } = content;
      if (!message.trim() || !id) return;
      setIsLoading(true);
      setCurrentResponse("");

      const currentUserMessage = JSON.parse(
        sessionStorage.getItem("userMessage") as string
      ) as Message;

      if (currentUserMessage) {
        setMessages((prev) => {
          if (prev.some((element) => element.id === currentUserMessage.id)) {
            return prev;
          }
          return [...prev, currentUserMessage];
        });
      } else {
        const idMessage = uuidv4();

        const userMessage: Message = {
          id: idMessage,
          role: "USER",
          content: search,
          createdAt: new Date().toISOString(),
          image: undefined,
        };
        if (image) {
          const fileDataUrl = (await new Promise((resolve, reject) => {
            const reader = new FileReader();

            reader.onload = () => resolve(reader.result as string);

            reader.onerror = (error) => reject(error);

            reader.readAsDataURL(image);
          })) as string;

          userMessage.image = fileDataUrl
            ? {
                id: uuidv4(),
                url: fileDataUrl ?? "",
                messageId: uuidv4(),
                mineType: "",
                sizeBytes: "",
                expirationTime: new Date().toISOString(),
                name: "",
              }
            : undefined;
        }

        setMessages((prev) => {
          if (prev.some((element) => element.id === userMessage.id)) {
            return prev;
          }
          return [...prev, userMessage];
        });
      }

      try {
        const match = currentUserMessage?.image?.url.match(
          /^data:(.+);base64,(.+)$/
        );

        const mimeType = match?.[1] || "image/png";
        const dataBase64 = match?.[2];
        let fileBase64: File | undefined = undefined;
        if (dataBase64 && dataBase64.length > 0) {
          const bufferBase64 = Buffer.from(dataBase64 as string, "base64");

          fileBase64 = new File(
            [bufferBase64],
            currentUserMessage.image?.name || "",
            { type: mimeType }
          );
        }

        const currentThreads = sessionStorage.getItem("currentThreads");
        const formData = new FormData();
        if (currentThreads && currentThreads.length > 0) {
          formData.append("id", id);
          formData.append("content", message);
          if (image || fileBase64) {
            formData.append("image", (image as File) ?? fileBase64);
          }
          formData.append("histories", JSON.stringify(messages));
          formData.append("lang", t("common:lang"));
        } else {
          formData.append("role", "user");
          formData.append("content", message);
          if (image || fileBase64) {
            formData.append("image", (image as File) ?? (fileBase64 as File));
          }
          formData.append("timestamp", new Date().toISOString());
        }
        const response = await fetch(
          currentThreads && currentThreads?.length > 0
            ? `${import.meta.env.VITE_BACKEND_BASE_URL}/api/private/chat`
            : `${
                import.meta.env.VITE_BACKEND_BASE_URL
              }/api/private/chat/${id}/message  `,
          {
            method: "post",
            credentials: "include",
            signal,
            body: formData,
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const reader = response.body?.getReader();
        const decoder = new TextDecoder();

        if (!reader) {
          throw new Error("No reader available");
        }

        let fullResponse = "";
        let buffer = "";

        setIsLoading(false);

        while (true) {
          const { value, done } = await reader.read();

          if (done) {
            break;
          }

          const textChunk = decoder.decode(value, { stream: true });
          buffer += textChunk;

          const lines = buffer.split("\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            if (line.trim()) {
              try {
                const data = JSON.parse(line.trim()) as {
                  text: string;
                  name: string;
                  id: string;
                  userId: string;
                  completed?: boolean;
                };

                if (data?.name?.length > 0) {
                  saveThreads(() =>
                    threads.map((thread) => {
                      if (thread.id === id) {
                        return {
                          ...thread,
                          name: data.name,
                          isLoading: false,
                        };
                      }
                      return thread;
                    })
                  );
                }

                fullResponse += data.text;
                setCurrentResponse(fullResponse);
              } catch (error) {
                console.error("Error parsing JSON line:", error, "Line:", line);
              } finally {
                sessionStorage.removeItem("currentThreads");
                sessionStorage.removeItem("userMessage");
              }
            }
          }
        }
        const assistantMessage: Message = {
          id: uuidv4(),
          role: "MODEL",
          content: fullResponse,
          createdAt: new Date().toISOString(),
        };

        setMessages((prev) => [...prev, assistantMessage]);
        setCurrentResponse("");
      } catch (error) {
        console.error("Failed to send message:", error);
      }
    },
    [id, messages, saveThreads, threads]
  );

  const currentThreads = threads.find((t) => t.id === id);
  const getMessages = useCallback(
    async (signal: AbortSignal) => {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_BASE_URL}/api/private/chat/${id}`,
        {
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          signal,
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      setMessages(data.histories);

      editor.commands.setContent(data.systemPrompt);
    },
    [id]
  );

  const updateSystemPrompt = async (systemPrompt: string) => {
    const response = await fetch(
      `${import.meta.env.VITE_BACKEND_BASE_URL}/api/private/chat/${id}`,
      {
        method: "PATCH",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          systemPrompt,
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  };

  useEffect(() => {
    const controller = new AbortController();
    const currentThreads = sessionStorage.getItem("currentThreads");

    (async () => {
      if (currentThreads) {
        sendMessage(
          {
            message: currentThreads,
          },
          controller.signal
        );
      } else {
        getMessages(controller.signal);
      }
    })();

    return () => {
      controller.abort("Abort cause only one fetch is needed");
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  return (
    <div
      className={`flex flex-col h-full justify-center pt-[3rem] pb-[13rem] items-center overflow-x-hidden`}
    >
      <title>
        {currentThreads?.name
          ? `${currentThreads.name} - ChatPet `
          : `${t("chat:newThread")} - ChatPet`}
      </title>
      <Dialog
        classNameContent="min-h-[300px] max-h-[500px] w-[800px] p-4   flex flex-col   justify-between"
        title={t("chat:systemPromptTitle")}
        trigger={
          <Button
            size={"sm"}
            className="fixed cursor-pointer text-sm top-3 right-14"
          >
            <Plus /> {t("chat:editSystemPrompt")}
          </Button>
        }
        footer={
          <div className="flex gap-4">
            <Button
              className="cursor-pointer"
              onClick={() => {
                setEditable((prev) => !prev);
              }}
            >
              {editable ? t("chat:disableEdit") : t("chat:enableEdit")}
            </Button>
            <DialogClose>
              <Button
                className="cursor-pointer"
                onClick={async () => {
                  await updateSystemPrompt(editor.getText());
                }}
              >
                {t("chat:submit")}
              </Button>
            </DialogClose>
          </div>
        }
      >
        <div className=" h-full overflow-y-auto w-full rounded-md focus-visible:outline-none">
          <EditorContent
            className="border min-h-[300px] rounded-sm  text-lg w-full h-full p-4 prose prose-lg max-w-none focus-visible:outline-none [&_.ProseMirror]:focus-visible:outline-none"
            editor={editor}
          />
        </div>
      </Dialog>

      <div className="flex-1 overflow-y-auto w-[55%] overflow-x-hidden min-h-0">
        {messages.map((message, index) => (
          <ChatMessage
            key={index}
            message={message.content || ""}
            isUser={message.role === "USER"}
            imageBase64={message.image?.url}
            timestamp={
              message.timestamp
                ? new Date(message.timestamp).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : undefined
            }
          />
        ))}
        {(currentThreads?.isLoading || isLoading) && (
          <div className="flex w-full mb-6 justify-start">
            <div className="flex items-center space-x-2 p-4">
              <div className="flex items-center space-x-2">
                <span className="dot-animate">
                  <span className="dot bg-primary rounded-full w-2 h-2 inline-block mx-0.5 animate-bounce" />
                  <span className="dot bg-primary rounded-full w-2 h-2 inline-block mx-0.5 animate-bounce delay-100" />
                  <span className="dot bg-primary rounded-full w-2 h-2 inline-block mx-0.5 animate-bounce delay-200" />
                </span>
                <span className="text-muted-foreground text-sm">
                  {t("thinking")}
                </span>
              </div>
            </div>
          </div>
        )}

        {currentResponse && (
          <ChatMessage
            message={currentResponse}
            isUser={false}
            imageBase64={sessionStorage.getItem("currentThreads") ?? ""}
            timestamp={new Date().toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          />
        )}

        <div ref={messagesEndRef} className="h-4" />
      </div>
      <ChatInput
        search={search}
        setSearch={setSearch}
        uploadedFile={uploadedFile}
        setUploadedFile={setUploadedFile}
        isPopoverOpen={isPopoverOpen}
        setIsPopoverOpen={setIsPopoverOpen}
        handleFileSelect={handleFileSelect}
        sendMessage={(params) => {
          sendMessage({
            message: params.message,
            image: params.image,
          });
        }}
      />
    </div>
  );
};
