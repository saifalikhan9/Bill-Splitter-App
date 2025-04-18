"use client";
import React, { useEffect } from "react";
import { AuthForm } from "@/components/AuthForm";
import { signIn } from "next-auth/react";
import { useSearchParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { AuthenticatedUser } from "@/components/AuthenticatedUser";

const SignInPage = () => {
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const errorMapping = {
      CredentialsSignin: "Invalid email or password",
      default: "An error occurred during sign-in",
    };
    const error = searchParams.get("error");
    if (error) {
      const errorMessage = errorMapping[error] || errorMapping.default;
      toast.error(errorMessage);
    }
  }, [searchParams]);

  const handleSubmit = async (data: { email: string; password: string }) => {
    try {
      const result = await signIn("credentials", {
        redirect: false,
        callbackUrl: "/",
        ...data,
      });

      if (result?.error) {
        toast.error("Invalid email or password");
      } else {
        toast.success("Successfully signed in!");
        if (result?.url) router.push(result.url);
      }
    } catch (error) {
      toast.error("An unexpected error occurred. Please try again.");
      console.error("Sign-in error:", error);
    }
  };

  return (
    <>
      <AuthenticatedUser />
      <div className="w-full flex justify-center items-center min-h-screen">
        <AuthForm type="signin" onSubmitForm={handleSubmit} />
      </div>
    </>
  );
};

export default SignInPage;
