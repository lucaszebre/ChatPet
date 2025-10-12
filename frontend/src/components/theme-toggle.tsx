import { useTheme } from "next-themes";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";
import { MoonIcon, SunIcon } from "lucide-react";

export const ThemeToggle = ({ className }: { className?: string }) => {
  const { setTheme, theme } = useTheme();
  const { t } = useTranslation("sidebar");

  return (
    <Button
      className={className}
      variant="outline"
      size="icon"
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
    >
      <SunIcon
        className="size-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0"
        aria-hidden="true"
      />
      <MoonIcon
        className="absolute size-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100"
        aria-hidden="true"
      />
      <span className="sr-only">{t("toggleTheme")}</span>
    </Button>
  );
};
