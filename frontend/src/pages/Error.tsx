import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";

export const ErrorPage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation("error");

  const handleRefresh = () => {
    window.location.reload();
  };

  const handleGoHome = () => {
    navigate("/home");
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen text-center  ">
      <h1 className="text-4xl font-bold text-red-600 dark:text-red-400 mb-4">
        {t("title")}
      </h1>
      <p className="text-gray-700 font-bold dark:text-gray-300 mb-6">
        {t("description")}
      </p>
      <div className="flex space-x-4">
        <Button onClick={handleRefresh}>{t("refreshPage")}</Button>
        <Button onClick={handleGoHome}>{t("goHome")}</Button>
      </div>
    </div>
  );
};
