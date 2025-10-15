import TosFrench from "@/markdown/French/tos.mdx";
import Preview from "@/markdown/preview";
import Tos from "@/markdown/tos.mdx";
import { useTranslation } from "react-i18next";

export const TosPage = () => {
  const { t } = useTranslation("common");

  if (t("lang") === "EN") {
    return (
      <Preview>
        <Tos />
      </Preview>
    );
  }

  return (
    <Preview>
      <TosFrench />
    </Preview>
  );
};
