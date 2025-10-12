import { FileUp, Send, Trash } from "lucide-react";
import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Tooltip } from "./implementation/tooltip";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { FileUploadDropzone } from "./ui/file-upload-dropzone";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Textarea } from "./ui/textarea";

type ChatInputProps = {
  search: string;
  setSearch: (value: string) => void;
  uploadedFile: File | null;
  setUploadedFile: (file: File | null) => void;
  isPopoverOpen: boolean;
  setIsPopoverOpen: (isOpen: boolean) => void;
  handleFileSelect: (file: File) => void;
  sendMessage: (params: { message: string; image?: File }) => void;
};

export const ChatInput = ({
  search,
  setSearch,
  uploadedFile,
  setUploadedFile,
  isPopoverOpen,
  setIsPopoverOpen,
  handleFileSelect,
  sendMessage,
}: ChatInputProps) => {
  const { t } = useTranslation("chat");

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  }, [search]);

  return (
    <Card
      className="w-[60%] fixed bottom-0 pt-4 max-w-4xl min-h-[10rem] py-0  pr-2 pl-2 rounded-b-none"
      style={{
        backgroundColor: "hsl(var(--primary) / 0.1)",
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
      }}
    >
      <CardContent
        className="w-full relative rounded-xl rounded-b-none pb-2 min-h-full"
        style={{
          backgroundColor: "hsl(var(--background) / 0.8)",
          backdropFilter: "blur(5px)",
          WebkitBackdropFilter: "blur(5px)",
        }}
      >
        <Textarea
          ref={textareaRef}
          value={search}
          placeholder={t("placeholder")}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();

              sendMessage({
                message: search,
                image: uploadedFile || undefined,
              });
              setUploadedFile(null);
              setSearch("");
            }
          }}
          onChange={(e) => setSearch(e.target.value)}
          className="peer !text-xl px-0 border-none outline-none w-full max-w-full min-h-[6rem] shadow-none resize-none overflow-hidden whitespace-pre-wrap break-words focus:ring-0 focus:border-none focus:outline-none focus:shadow-none focus:bg-transparent focus-visible:ring-0 focus-visible:border-none focus-visible:outline-none focus-visible:shadow-none focus-visible:bg-transparent [&::-webkit-search-cancel-button]:appearance-none [&::-webkit-search-decoration]:appearance-none [&::-webkit-search-results-button]:appearance-none [&::-webkit-search-results-decoration]:appearance-none"
        />
        <div className="flex w-full justify-between items-end">
          <div className="flex flex-row gap-3 items-end">
            <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
              <PopoverTrigger asChild>
                <Button
                  size={"lg"}
                  variant={"outline"}
                  className="rounded-full cursor-pointer"
                >
                  <FileUp className="text-primary" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-96" align="start">
                <div className="space-y-4">
                  <h4 className="font-medium leading-none">
                    {t("uploadImage")}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {t("uploadDescription")}
                  </p>
                  <FileUploadDropzone
                    onFileSelect={handleFileSelect}
                    accept={{
                      "image/*": [".jpeg", ".jpg", ".png"],
                    }}
                    maxSize={10 * 1024 * 1024}
                    multiple={false}
                  />
                </div>
              </PopoverContent>
            </Popover>
            {uploadedFile && (
              <Card className=" relative bg-green-50 p-5 rounded">
                <Trash
                  onClick={() => setUploadedFile(null)}
                  className="absolute cursor-pointer right-2 top-2"
                  width={12}
                  height={12}
                />
                <img
                  src={uploadedFile ? URL.createObjectURL(uploadedFile) : ""}
                  width={80}
                  height={80}
                />
              </Card>
            )}
          </div>
          <Tooltip
            disabled={search.length > 0}
            content={t("writeMessageFirst")}
          >
            <Button
              onClick={() => {
                sendMessage({
                  message: search,
                  image: uploadedFile || undefined,
                });
                setUploadedFile(null);
                setSearch("");
              }}
              disabled={!search.length}
              size={"lg"}
              className={`cursor-pointer ${
                !search.length ? "opacity-50 pointer-events-none" : ""
              }`}
            >
              <Send />
            </Button>
          </Tooltip>
        </div>
      </CardContent>
    </Card>
  );
};
