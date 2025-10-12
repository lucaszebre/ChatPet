import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { ArrowLeft } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";

export const Auth = () => {
  const { t } = useTranslation("auth");
  return (
    <div className="flex min-h-screen flex-col ">
      <div className="p-4 absolute left-5 top-5">
        <Link to="/">
          <Button
            variant="ghost"
            className=" cursor-pointer text-primary gap-2"
          >
            <ArrowLeft size={16} />
            {t("backToChat")}
          </Button>
        </Link>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center px-6">
        <div className="w-full max-w-md space-y-6 text-center">
          <div className="flex  justify-center">
            <img src="/pet.png" alt="Pet" width={125} height={125} />
          </div>
          <h1 className="text-3xl font-bold">
            {t("welcomeTo")} <span className="text-primary">ChatPet</span>
          </h1>

          <div className="mt-8 space-y-3">
            <Button
              onClick={async () => {
                try {
                  const data = await authClient.signIn.social({
                    provider: "google",
                    callbackURL: `${
                      import.meta.env.VITE_BASE_URL
                    }/auth/complete`,
                    errorCallbackURL: `${import.meta.env.VITE_BASE_URL}/error`,
                    newUserCallbackURL: `${import.meta.env.VITE_BASE_URL}/auth`,
                  });

                  return { data: data.data?.url };
                } catch (error) {
                  console.error(error);
                  return {
                    error: {
                      status: 500,
                      statusText: "Error",
                      data: "Sign in failed",
                    },
                  };
                }
              }}
              className="flex w-full items-center cursor-pointer justify-center gap-2 rounded-md p-3 hover:opacity-90"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="#fff"
              >
                <path d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z" />
              </svg>
              {t("continueWithGoogle")}
            </Button>

            <Button
              variant="outline"
              className="flex w-full items-center cursor-pointer justify-center gap-2 rounded-md p-3 hover:opacity-90 border-gray-700 bg-transparent"
              onClick={async () => {
                try {
                  const data = await authClient.signIn.social({
                    provider: "github",
                    callbackURL: `${
                      import.meta.env.VITE_BASE_URL
                    }/auth/complete`,
                    errorCallbackURL: `${import.meta.env.VITE_BASE_URL}/error`,
                    newUserCallbackURL: `${import.meta.env.VITE_BASE_URL}/auth`,
                  });

                  return { data: data.data?.url };
                } catch (error) {
                  console.error(error);
                  return {
                    error: {
                      status: 500,
                      statusText: "Error",
                      data: "Sign in failed",
                    },
                  };
                }
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="#fff"
              >
                <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.48 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.03-2.682-.103-.253-.447-1.27.098-2.646 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0 1 12 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.748-1.025 2.748-1.025.546 1.376.202 2.394.1 2.646.64.699 1.026 1.591 1.026 2.682 0 3.841-2.337 4.687-4.565 4.935.359.309.678.917.678 1.852 0 1.335-.012 2.415-.012 2.741 0 .267.18.578.688.48C19.138 20.165 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
              </svg>
              {t("continueWithGithub")}
            </Button>
          </div>

          <p className="mt-4 text-sm ">
            {t("agreementPrefix")}{" "}
            <Link to="/tos" className="text-primary hover:underline">
              {t("termsOfService")}
            </Link>{" "}
            {t("agreementAnd")}{" "}
            <Link to="/privacy-policy" className="text-primary hover:underline">
              {t("privacyPolicy")}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
