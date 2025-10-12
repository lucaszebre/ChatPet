import { Outlet } from "react-router";

import { AppSidebar } from "@/components/app-sidebar";
import { RequireAuth } from "@/components/dashboard/require-auth";
import { ThemeToggle } from "@/components/theme-toggle";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Toaster } from "react-hot-toast";

export const HomeLayout = () => {
  return (
    <RequireAuth>
      <SidebarProvider className="relative">
        <AppSidebar />
        <SidebarInset>
          <div className="min-w-full min-h-full">
            <div className="fixed right-3 top-3">
              <ThemeToggle className="cursor-pointer" />
            </div>
            <Outlet />
            <Toaster />
          </div>
        </SidebarInset>
      </SidebarProvider>
    </RequireAuth>
  );
};
