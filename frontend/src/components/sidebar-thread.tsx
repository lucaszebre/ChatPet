import { Button } from "@/components/ui/button";
import { SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";
import { type ChatType } from "@/types";
import { Trash } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate, useParams } from "react-router";
import { AlertDialog } from "./alert-dialog";
import { Icons } from "./icons/Icons";

export type SidebarThreadProps = {
  item: ChatType;
  threads: ChatType[];
  saveThreads: (threads: ChatType[]) => void;
  className?: string;
  isLoading?: boolean;
};

export const SidebarThread = ({
  item,
  threads,
  saveThreads,
  className,
  isLoading = false,
}: SidebarThreadProps) => {
  const navigate = useNavigate();
  const params = useParams();
  const { t } = useTranslation("sidebar");

  const handleDeleteThread = async () => {
    try {
      await fetch(
        `${import.meta.env.VITE_BACKEND_BASE_URL}/api/private/chat/${item.id}`,
        {
          method: "delete",
          credentials: "include",
        }
      );

      saveThreads(threads.filter((thread) => thread.id !== item.id));

      if (params.id === item.id) {
        navigate("/");
      }
    } catch (error) {
      console.error("Failed to delete thread:", error);
    }
  };

  return (
    <SidebarMenuItem
      className={`rounded-none z-0 ${className || ""}`}
      key={item.id}
    >
      <SidebarMenuButton className="py-[1.5rem] pr-[1.5rem] rounded-xs relative">
        <Link to={`chat/${item.id}`}>
          <span>{item.name}</span>

          {isLoading && (
            <Icons.spinner className="absolute z-10 right-1 top-1/2 transform -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
          )}
        </Link>
        <AlertDialog
          title={t("sidebar.deleteThread.title", {
            threadName: item.name,
          })}
          description={t("sidebar.deleteThread.description")}
          confirmText={t("sidebar.deleteThread.confirm")}
          cancelText={t("sidebar.deleteThread.cancel")}
          showCancel
          showConfirm
          trigger={
            <Button
              size="sm"
              variant="ghost"
              className="absolute z-10 right-1 cursor-pointer h-6 w-6 p-0 text-muted-foreground hover:text-destructive dark:hover:text-red-400"
            >
              <Trash className="h-4 w-4" />
            </Button>
          }
          onConfirm={handleDeleteThread}
        />
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
};
