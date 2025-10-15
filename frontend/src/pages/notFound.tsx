import { Button } from "@/components/ui/button";
import { MoveLeft } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";

export const NotFound = () => {
  const { t: tHead } = useTranslation("head");
  const { t } = useTranslation("notFound");
  return (
    <>
      <title>{`ApplyEasy - ${tHead("notFound.title")}`}</title>
      <meta name="description" content={tHead("notFound.description")} />
      <div className="h-screen w-full flex flex-col items-center justify-center">
        <div className="text-center space-y-6">
          <h1 className="text-7xl font-bold text-gray-900">404</h1>
          <h2 className="text-3xl font-semibold text-gray-700">
            {t("PageNotFound")}
          </h2>
          <p className="text-gray-500 max-w-md mx-auto">
            {t("PageNotFoundDescription")}
          </p>
          <Button asChild className="mt-6 cursor-pointer" variant="default">
            <Link to="/">
              <MoveLeft className="mr-2 h-4 w-4" />
              {t("BackToDashboard")}
            </Link>
          </Button>
        </div>
      </div>
    </>
  );
};
