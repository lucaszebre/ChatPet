import { authClient } from "@/lib/auth-client";
import React from "react";
import { Navigate, useLocation } from "react-router";
import { Icons } from "../icons/Icons";

export const RequireAuth = ({ children }: { children: React.ReactNode }) => {
  const pathname = useLocation().pathname;

  const { data, isPending } = authClient.useSession();

  if (isPending) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Icons.spinner className="mr-2 h-12 w-12 animate-spin" />
      </div>
    );
  }

  return data?.session.userId ? (
    children
  ) : (
    <Navigate to="/auth" replace state={{ path: pathname }} />
  );
};
