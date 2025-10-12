import PrivacyPolicyFrench from "@/markdown/French/privacy-policy.mdx";
import Preview from "@/markdown/preview";
import PrivacyPolicy from "@/markdown/privacy-policy.mdx";
import { useTranslation } from "react-i18next";

export const PrivacyPolicyPage = () => {
  const { t } = useTranslation("language");

  if (t("language") == "en") {
    return (
      <Preview>
        <PrivacyPolicy />
      </Preview>
    );
  }
  return (
    <Preview>
      <PrivacyPolicyFrench />
    </Preview>
  );
};
