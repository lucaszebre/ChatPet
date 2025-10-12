import i18n from "i18next";
import detector from "i18next-browser-languagedetector";
import resourcesToBackend from "i18next-resources-to-backend";
import { initReactI18next } from "react-i18next";
import { I18N_NAMESPACE } from "./src/constants/I18nNamespace";
i18n
  .use(detector)
  .use(initReactI18next)
  .use(
    resourcesToBackend(
      (language: string, namespace: string) =>
        import(`@/i18n/locales/${language}/${namespace}.json`)
    )
  )
  .init({
    fallbackLng: "FR",
    compatibilityJSON: "v4",
    ns: I18N_NAMESPACE,
    react: {
      useSuspense: true,
    },
    interpolation: {
      escapeValue: true,
    },
    defaultNS: "common",
  });

export default i18n;
