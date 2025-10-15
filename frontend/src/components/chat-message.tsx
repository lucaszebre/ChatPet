import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { Check, Copy } from "lucide-react";
import { memo, useState } from "react";
import { useTranslation } from "react-i18next";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";

type ChatMessageProps = {
  message: string;
  isUser?: boolean;
  timestamp?: string;
  className?: string;
  imageBase64?: string;
};

export const ChatMessage = memo(
  ({
    message,
    isUser = false,
    timestamp,
    className,
    imageBase64,
  }: ChatMessageProps) => {
    const { t } = useTranslation("chat");
    const [isCopied, setIsCopied] = useState(false);
    const handleCopy = async () => {
      try {
        await navigator.clipboard.writeText(message);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
      } catch (error) {
        console.error("Failed to copy text:", error);
      }
    };

    if (isUser) {
      return (
        <div className={cn("flex w-full mb-4 justify-end group", className)}>
          <div className="max-w-[80%]">
            <Card className="p-4 shadow-sm border bg-primary text-primary-foreground ml-12 rounded-2xl">
              {imageBase64 && (
                <img
                  src={imageBase64}
                  alt="chat message image"
                  className="mb-4 max-w-full rounded-lg"
                  style={{ maxHeight: 300, objectFit: "contain" }}
                />
              )}
              <div className="prose prose-base max-w-none dark:prose-invert prose-headings:font-bold prose-h1:text-2xl prose-h2:text-xl prose-h3:text-lg prose-p:text-base prose-p:leading-relaxed prose-p:font-medium prose-pre:bg-muted prose-pre:text-muted-foreground prose-code:bg-muted prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-blockquote:border-l-primary prose-blockquote:pl-4 prose-blockquote:italic prose-ul:text-base prose-ol:text-base prose-li:text-base">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={[rehypeHighlight, rehypeRaw]}
                  components={{
                    ul: ({ children, ...props }) => (
                      <ul className="space-y-2 my-4" {...props}>
                        {children}
                      </ul>
                    ),
                    li: ({ children, ...props }) => (
                      <li className="flex items-start" {...props}>
                        <span className="text-primary mr-2 mt-1">•</span>
                        <span className="flex-1">{children}</span>
                      </li>
                    ),
                    h1: ({ children, ...props }) => (
                      <h1
                        className="text-xl font-semibold mb-3 mt-6 first:mt-0"
                        {...props}
                      >
                        {children}
                      </h1>
                    ),
                    h2: ({ children, ...props }) => (
                      <h2
                        className="text-lg font-semibold mb-2 mt-5 first:mt-0"
                        {...props}
                      >
                        {children}
                      </h2>
                    ),
                    h3: ({ children, ...props }) => (
                      <h3
                        className="text-base font-semibold mb-2 mt-4 first:mt-0"
                        {...props}
                      >
                        {children}
                      </h3>
                    ),
                    p: ({ children, ...props }) => (
                      <p className="mb-4 last:mb-0 leading-relaxed" {...props}>
                        {children}
                      </p>
                    ),
                    pre: ({ children, ...props }) => (
                      <pre
                        className="bg-muted p-4 rounded-lg overflow-x-auto my-4"
                        {...props}
                      >
                        {children}
                      </pre>
                    ),
                    code: (props) => {
                      const { children, className, ...rest } = props;
                      const isInline = !className?.includes("language-");
                      return isInline ? (
                        <code
                          className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono"
                          {...rest}
                        >
                          {children}
                        </code>
                      ) : (
                        <code className={className} {...rest}>
                          {children}
                        </code>
                      );
                    },
                    blockquote: ({ children, ...props }) => (
                      <blockquote
                        className="border-l-4 border-primary pl-4 italic my-4 text-muted-foreground"
                        {...props}
                      >
                        {children}
                      </blockquote>
                    ),
                  }}
                >
                  {message}
                </ReactMarkdown>
              </div>

              {timestamp && (
                <div className="text-xs mt-2 opacity-70 text-muted-foreground">
                  {timestamp}
                </div>
              )}

              <div className="flex items-center gap-1 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className={cn(
                          "h-8 w-8 hover:bg-accent  cursor-pointer transition-all duration-200",
                          isCopied && "bg-green-100 hover:bg-green-200"
                        )}
                        onClick={handleCopy}
                      >
                        {isCopied ? (
                          <Check className="h-4 w-4 text-green-600" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{isCopied ? t("messageCopied") : t("copyMessage")}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </Card>
          </div>
        </div>
      );
    }

    return (
      <div className={cn("flex w-full mb-6 group", className)}>
        <div className="w-full max-w-none">
          {imageBase64 && (
            <img
              src={imageBase64}
              alt="chat message image"
              className="mb-4 max-w-full rounded-lg"
              style={{ maxHeight: 300, objectFit: "contain" }}
            />
          )}
          <div className="prose prose-base max-w-none dark:prose-invert prose-headings:font-bold prose-h1:text-2xl prose-h2:text-xl prose-h3:text-lg prose-p:text-base prose-p:leading-relaxed prose-p:font-medium prose-pre:bg-muted prose-pre:text-muted-foreground prose-code:bg-muted prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-blockquote:border-l-primary prose-blockquote:pl-4 prose-blockquote:italic prose-ul:text-base prose-ol:text-base prose-li:text-base">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeHighlight, rehypeRaw]}
              components={{
                ul: ({ children, ...props }) => (
                  <ul className="space-y-2 my-4" {...props}>
                    {children}
                  </ul>
                ),
                li: ({ children, ...props }) => (
                  <li className="flex items-start" {...props}>
                    <span className="text-primary mr-2 mt-1">•</span>
                    <span className="flex-1">{children}</span>
                  </li>
                ),
                h1: ({ children, ...props }) => (
                  <h1
                    className="text-xl font-semibold mb-3 mt-6 first:mt-0"
                    {...props}
                  >
                    {children}
                  </h1>
                ),
                h2: ({ children, ...props }) => (
                  <h2
                    className="text-lg font-semibold mb-2 mt-5 first:mt-0"
                    {...props}
                  >
                    {children}
                  </h2>
                ),
                h3: ({ children, ...props }) => (
                  <h3
                    className="text-base font-semibold mb-2 mt-4 first:mt-0"
                    {...props}
                  >
                    {children}
                  </h3>
                ),
                p: ({ children, ...props }) => (
                  <p className="mb-4 last:mb-0 leading-relaxed" {...props}>
                    {children}
                  </p>
                ),
                pre: ({ children, ...props }) => (
                  <pre
                    className="bg-muted p-4 rounded-lg overflow-x-auto my-4"
                    {...props}
                  >
                    {children}
                  </pre>
                ),
                code: (props) => {
                  const { children, className, ...rest } = props;
                  const isInline = !className?.includes("language-");
                  return isInline ? (
                    <code
                      className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono"
                      {...rest}
                    >
                      {children}
                    </code>
                  ) : (
                    <code className={className} {...rest}>
                      {children}
                    </code>
                  );
                },
                blockquote: ({ children, ...props }) => (
                  <blockquote
                    className="border-l-4 border-primary pl-4 italic my-4 text-muted-foreground"
                    {...props}
                  >
                    {children}
                  </blockquote>
                ),
              }}
            >
              {message}
            </ReactMarkdown>
          </div>

          {timestamp && (
            <div className="text-xs mt-2 opacity-70 text-muted-foreground">
              {timestamp}
            </div>
          )}

          {message.length > 0 ? (
            <div className="flex items-center gap-1 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className={cn(
                        "h-8 w-8 hover:bg-accent cursor-pointer transition-all duration-200",
                        isCopied && "bg-green-100 hover:bg-green-200"
                      )}
                      onClick={handleCopy}
                    >
                      {isCopied ? (
                        <Check className="h-4 w-4 text-green-600" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{isCopied ? t("messageCopied") : t("copyMessage")}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          ) : null}
        </div>
      </div>
    );
  }
);
