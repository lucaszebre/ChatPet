import { ThemeProvider } from "next-themes";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { I18nextProvider } from "react-i18next";
import {
  createBrowserRouter,
  RouterProvider,
  type RouteObject,
} from "react-router";
import "../i18n";
import i18n from "../i18n";
import "./index.css";
import { HomeLayout } from "./pages/home/layout.tsx";

const routes: RouteObject[] = [
  {
    path: "/auth",
    lazy: () =>
      import("./pages/auth/page.tsx").then((module) => ({
        Component: module.Auth,
      })),
    index: true,
  },
  {
    path: "/auth/complete",
    lazy: () =>
      import("./pages/auth/complete/page.tsx").then((module) => ({
        Component: module.AuthCompletePage,
      })),
    index: true,
  },
  {
    path: "/tos",
    lazy: () =>
      import("./pages/tos/page.tsx").then((module) => ({
        Component: module.TosPage,
      })),
  },
  {
    path: "/privacy-policy",
    lazy: () =>
      import("./pages/privacy-policy/page.tsx").then((module) => ({
        Component: module.PrivacyPolicyPage,
      })),
  },

  {
    element: <HomeLayout />,
    children: [
      {
        path: "/",
        index: true,
        lazy: () =>
          import("./pages/home/page.tsx").then((module) => ({
            Component: module.Home,
          })),
      },
      {
        path: "/chat/:id",
        index: true,
        lazy: () =>
          import("./pages/chat/page.tsx").then((module) => ({
            Component: module.Chat,
          })),
      },
    ],
  },

  {
    path: "*",
    index: true,
    lazy: () =>
      import("./pages/notFound.tsx").then((module) => ({
        Component: module.NotFound,
      })),
  },
];

const router = createBrowserRouter(routes);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <I18nextProvider i18n={i18n}>
      <ThemeProvider>
        <RouterProvider router={router} />
      </ThemeProvider>
    </I18nextProvider>
  </StrictMode>
);
