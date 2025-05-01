"use client";
import { AuthForm } from "@/components/AuthForm";
import React from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { AuthenticatedUser } from "@/components/AuthenticatedUser";

interface SignupData {
  email: string;
  password: string;
  name?: string;
}

const SignUpPage = () => {
  const router = useRouter();
  const handleSubmit = async (data: SignupData) => {
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        body: JSON.stringify(data),
        headers: {
          "Content-Type": "application/json",
        },
      });

      const response = await res.json();

      if (!res.ok) {
        throw new Error(
          response.message || "Registration failed. Please try again."
        );
      }

      toast.success(response.message || "User registered successfully!");
      router.push("/signin"); // Redirect to sign-in page after successful registration
    } catch (e: Error | unknown) {
      const error = e as Error;
      toast.error(error.message || "Something went wrong. Please try again.");
      console.error("Registration error:", error);
    }
  };

  return (
    <>
      <AuthenticatedUser />
      <div className="min-h-screen w-full flex justify-center items-center">
        <AuthForm type="signup" onSubmitForm={handleSubmit} />
      </div>
    </>
  );
};

export default SignUpPage;
