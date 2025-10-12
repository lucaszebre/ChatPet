import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarSeparator,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { authClient } from "@/lib/auth-client";
import { type ChatType } from "@/types";
import { useLocalStorage } from "@uidotdev/usehooks";
import {
  DoorClosed,
  DoorOpen,
  Languages,
  MessageSquare,
  Plus,
  Search,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router";
import { Command } from "./command";
import { SidebarThread } from "./sidebar-thread";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { InputSearch } from "./ui/input-search";

export const AppSidebar = () => {
  const [search, setSearch] = useState("");
  const [commandOpen, setCommandOpen] = useState(false);
  const user = authClient.useSession();
  const navigate = useNavigate();
  const { state } = useSidebar();
  const { t, i18n } = useTranslation("sidebar");

  const toggleLanguage = () => {
    const currentLang = i18n.language;
    const newLang = currentLang === "FR" ? "UK" : "FR";
    i18n.changeLanguage(newLang);
  };

  const [threads, saveThreads] = useLocalStorage<ChatType[]>("threads", []);

  const getThreads = useCallback(async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_BASE_URL}/api/private/chats`,
        {
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      saveThreads(data);
    } catch (error) {
      console.error(error);
    }
  }, [saveThreads]);

  useEffect(() => {
    getThreads();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === "k") {
        event.preventDefault();
        setCommandOpen(true);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <>
      <Card
        className={`fixed top-3 z-10 flex gap-0 flex-row items-center  p-2 left-3 cursor-pointer ${
          state === "expanded" ? "hidden" : ""
        }`}
      >
        <SidebarTrigger className="cursor-pointer px-2" />
        <Button
          className="cursor-pointer"
          variant={"ghost"}
          onClick={() => setCommandOpen(true)}
          title="Search threads (⌘K)"
        >
          <Search />
        </Button>
        <Link to={"/"} className="w-full">
          <Button className="cursor-pointer" variant={"ghost"}>
            <Plus />
          </Button>
        </Link>
      </Card>

      <Sidebar className="bg-sidebar-foreground " variant="sidebar">
        <SidebarHeader className="flex  flex-col gap-2 pt-[1rem] w-full  relative items-center justify-start">
          <div className="flex w-full  flex-row-reverse  items-center justify-start">
            <p className="flex  text-xl font-bold gap-2  w-[90%]  items-start justify-center text-primary">
              {t("sidebar.title")}
              <img src="/pet.png" alt="Pet" width={25} height={25} />
            </p>
            <SidebarTrigger className="cursor-pointer" />
          </div>
          <Link to={"/"} className="w-full">
            <Button size={"lg"} className="w-full cursor-pointer">
              {t("sidebar.newChat")}
            </Button>
          </Link>

          <InputSearch
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onClear={() => setSearch("")}
          />
          <SidebarSeparator />
        </SidebarHeader>
        <SidebarContent
          style={{
            scrollbarGutter: "unset",
            scrollbarColor: "transparent transparent",
            scrollbarWidth: "thin",
          }}
        >
          <SidebarGroup>
            <SidebarGroupLabel className="flex h-2 text-sm justify-start">
              {t("sidebar.recentDiscussion")}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="flex flex-col gap-3 py-2">
                {threads
                  .filter((thread) => {
                    if (search.length > 0) {
                      return thread.name.includes(search);
                    }
                    return thread;
                  })
                  .map((item) => {
                    return (
                      <SidebarThread
                        key={item.id}
                        item={item}
                        threads={threads}
                        saveThreads={saveThreads}
                        isLoading={item.isLoading}
                      />
                    );
                  })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter className="pb-[1rem]">
          <Button
            size={"lg"}
            onClick={toggleLanguage}
            variant={"outline"}
            className="w-full cursor-pointer flex items-center gap-2"
          >
            <Languages size={16} />
            {t("sidebar.languageToggle")}
          </Button>
          <Button
            size={"lg"}
            onClick={() => {
              if (user.data?.user.id) {
                authClient.signOut();
              } else {
                navigate("/auth");
              }
            }}
            variant={"ghost"}
            className="w-full cursor-pointer"
          >
            {user.data?.user.id ? <DoorOpen /> : <DoorClosed />}
            {user.data?.user.id ? t("sidebar.logout") : t("sidebar.login")}
          </Button>
        </SidebarFooter>
      </Sidebar>

      <Command
        open={commandOpen}
        onOpenChange={setCommandOpen}
        dialogClassName="max-w-lg"
        title={t("sidebar.searchThreads")}
        description="Search and navigate to your chat threads"
        placeholder="Search threads..."
        emptyText="No threads found."
        items={threads.map((thread) => ({
          id: thread.id,
          title: thread.name,
          description: `Created ${new Date(
            thread.createdAt
          ).toLocaleDateString()}`,
          icon: <MessageSquare className="h-4 w-4" />,
          onSelect: () => {
            navigate(`/chat/${thread.id}`);
            setCommandOpen(false);
          },
        }))}
      />
    </>
  );
};
