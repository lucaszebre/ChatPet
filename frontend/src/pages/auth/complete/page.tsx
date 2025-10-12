import { Icons } from "@/components/icons/Icons";
import { authClient } from "@/lib/auth-client";
import { useNavigate } from "react-router";

export const AuthCompletePage = () => {
  const navigate = useNavigate();

  authClient.getSession().then((res) => {
    if (res.data?.session.userId) {
      navigate("/");
    } else {
      navigate("/auth");
    }
  });

  return (
    <>
      <title>ChatPet - Authentication Complete</title>
      <meta
        name="description"
        content="Your authentication is complete. Redirecting you to your dashboard."
      />
      <div className=" flex-col flex justify-center items-center h-screen w-full ">
        <Icons.spinner className="mr-2 h-12 w-12 animate-spin" />
      </div>
    </>
  );
};
