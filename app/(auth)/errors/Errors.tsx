"use client";
import { useEffect } from "react";
import { useSearchParams } from "next/navigation";

export default function AuthErrorPage() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  useEffect(() => {
    console.error("Authentication error:", error);
  }, [error]);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Authentication Error</h1>
      <p className="text-red-500">{error || "Unknown error occurred"}</p>
      <p className="mt-4">
        Please try again or contact support if the problem persists.
      </p>
    </div>
  );
}