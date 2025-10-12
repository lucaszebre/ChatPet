import { ChatInput } from "@/components/chat-input";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import type { ChatType } from "@/types";
import { useLocalStorage } from "@uidotdev/usehooks";
import { Newspaper, School, StarsIcon } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";
import { v4 as uuidv4 } from "uuid";
import type { Message } from "../chat/page";

type SelectionType = {
  id: string;
  labelKey: string;
  icon: React.ComponentType;
  questionKeys: string[];
};

const selectionData: SelectionType[] = [
  {
    id: "lifestyle",
    labelKey: "categories.lifestyle",
    icon: StarsIcon,
    questionKeys: [
      "questions.lifestyle.living",
      "questions.lifestyle.time",
      "questions.lifestyle.activity",
      "questions.lifestyle.household",
    ],
  },
  {
    id: "preferences",
    labelKey: "categories.preferences",
    icon: Newspaper,
    questionKeys: [
      "questions.preferences.type",
      "questions.preferences.size",
      "questions.preferences.age",
      "questions.preferences.energy",
    ],
  },
  {
    id: "care",
    labelKey: "categories.care",
    icon: School,
    questionKeys: [
      "questions.care.experience",
      "questions.care.training",
      "questions.care.health",
      "questions.care.grooming",
    ],
  },
];

export const Home = () => {
  const { t } = useTranslation("home");
  const [currentSelection, setCurrentSelection] = useState<SelectionType>(
    selectionData[0]
  );
  const [threads, savethreads] = useLocalStorage<ChatType[]>("threads", []);
  const currentUser = authClient.useSession();
  const [search, setSearch] = useState("");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const router = useNavigate();
  const handleFileSelect = (file: File) => {
    setUploadedFile(file);
    setIsPopoverOpen(false);
  };

  const createNewChat = async () => {
    const id = uuidv4();

    sessionStorage.setItem("currentThreads", search);
    const idMessage = uuidv4();

    const userMessage: Message = {
      id: idMessage,
      role: "USER",
      content: search,
      createdAt: new Date().toISOString(),
      image: undefined,
    };
    if (uploadedFile) {
      const fileDataUrl = (await new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = () => resolve(reader.result as string);

        reader.onerror = (error) => reject(error);

        reader.readAsDataURL(uploadedFile);
      })) as string;

      userMessage.image = {
        id: uuidv4(),
        url: fileDataUrl ?? "",
        messageId: uuidv4(),
        mineType: uploadedFile.type,
        sizeBytes: "",
        expirationTime: new Date().toISOString(),
        name: uploadedFile.name,
      };
    }

    sessionStorage.setItem("userMessage", JSON.stringify(userMessage));

    savethreads(() => {
      const newThreads = threads;
      newThreads.push({
        id,
        userId: currentUser.data?.user.id ?? "",
        createdAt: new Date(),
        updateAt: new Date(),
        histories: [
          {
            role: "user",
            parts: [{ text: search }],
          },
        ],
        name: "New Thread",
        isLoading: true,
      });

      return newThreads;
    });

    router(`/chat/${id}`);
  };
  return (
    <div className="flex flex-col justify-between h-full">
      <div className="flex w-full h-full justify-center items-start">
        {!search.length ? (
          <section className="w-full max-w-[800px]  p-8 ">
            <h1 className="text-4xl font-bold text-start mb-6 text-primary">
              {t("title", { username: currentUser.data?.user.name || "Guest" })}
            </h1>
            <div className="flex gap-4 mb-8 flex-wrap">
              {selectionData.map((selection) => {
                const IconComponent = selection.icon;
                return (
                  <Button
                    key={selection.id}
                    variant={
                      currentSelection.id === selection.id ? "default" : "ghost"
                    }
                    onClick={() => setCurrentSelection(selection)}
                    className={`flex items-center gap-2 px-6 py-2 rounded-full shadow-sm border cursor-pointer ${
                      currentSelection.id === selection.id
                        ? "bg-primary text-primary-foreground border-primary"
                        : "text-primary hover:bg-primary/10 hover:text-secondary"
                    }`}
                  >
                    <IconComponent />
                    {t(selection.labelKey)}
                  </Button>
                );
              })}
            </div>

            <div className="flex flex-col ">
              {currentSelection.questionKeys.map((questionKey, index) => (
                <Button
                  key={index}
                  size={"lg"}
                  variant={"ghost"}
                  onClick={() => {
                    setSearch(t(questionKey));
                  }}
                  className={` rounded-none py-[2rem] cursor-pointer justify-start text-xl text-primary hover:text-secondary hover:bg-primary/10 ${
                    index < currentSelection.questionKeys.length - 1
                      ? "border-b"
                      : ""
                  }`}
                >
                  {t(questionKey)}
                </Button>
              ))}
            </div>
          </section>
        ) : null}
      </div>
      <div className="flex flex-row justify-center">
        <ChatInput
          search={search}
          setSearch={setSearch}
          uploadedFile={uploadedFile}
          setUploadedFile={setUploadedFile}
          isPopoverOpen={isPopoverOpen}
          setIsPopoverOpen={setIsPopoverOpen}
          handleFileSelect={handleFileSelect}
          sendMessage={() => {
            createNewChat();
          }}
        />
      </div>
    </div>
  );
};
