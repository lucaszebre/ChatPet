import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import React from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";

const Preview = ({ children }: { children: React.ReactNode }) => {
  const { t } = useTranslation("preview");
  const navigate = useNavigate();

  return (
    <div className="flex flex-col justify-start py-[4rem] items-center w-full h-full">
      <div className="flex flex-col w-full max-w-[30%] items-center gap-4 justify-start ">
        <div className="w-full flex justify-start">
          <Button
            variant={"outline"}
            onClick={() => {
              navigate(-1);
            }}
          >
            <ArrowLeft className="w-4" />
            {t("back")}
          </Button>
        </div>

        <div className="bg-transparent w-full">{children}</div>
      </div>
    </div>
  );
};

export default Preview;
