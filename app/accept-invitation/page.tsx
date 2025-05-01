"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createAuthSchema } from "@/lib/types";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { toast } from "sonner";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { EyeIcon, EyeOffIcon } from "lucide-react";

const flatmateSchema = createAuthSchema("signup");

export default function AcceptInvitation() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(true);
  const [validating, setValidating] = useState(true);
  
  interface Invitation {
    id: number;
    email: string;
    name: string;
    token: string;
    ownerName: string;
    expiresAt: string;
  }
  
  const [invitation, setInvitation] = useState<Invitation | null>(null);

  const form = useForm<z.infer<typeof flatmateSchema>>({
    resolver: zodResolver(flatmateSchema),
    defaultValues: {
      email: "",
      name: "",
      password: "",
      confirmPassword: "",
    },
  });

  useEffect(() => {
    if (!token) {
      toast.error("Invalid invitation link");
      router.push("/");
      return;
    }

    // Validate token
    const validateToken = async () => {
      try {
        setValidating(true);
        const response = await fetch(`/api/accept-invitation?token=${token}`);
        const data = await response.json();

        if (!response.ok || !data.valid) {
          toast.error(data.message || "Invalid invitation");
          router.push("/");
          return;
        }

        setInvitation(data.invitation);
        // Update form default values with invitation data
        form.setValue("email", data.invitation.email || "");
        form.setValue("name", data.invitation.name || "");
      } catch (error) {
        console.error("Error validating token:", error);
        toast.error("Failed to validate invitation");
        router.push("/");
      } finally {
        setValidating(false);
        setLoading(false);
      }
    };

    validateToken();
  }, [token, router, form]);

  const onSubmit = async (e: z.infer<typeof flatmateSchema>) => {
    try {
      setLoading(true);
      const response = await fetch("/api/accept-invitation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token,
          password: e.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to create account");
      }

      toast.success("Account created successfully!");
      router.push("/signin");
    } catch (error: unknown) {
      console.error("Error accepting invitation:", error);
      const err = error as Error;
      toast.error(err.message || "Failed to create account");
    } finally {
      setLoading(false);
    }
  };

  if (validating) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-full h-full flex items-center justify-center">
          <p className="text-gray-500 text-center">Validating invitation...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="flex-1 flex flex-col md:items-center md:justify-center">
        <Card className="flex-1 w-full md:flex-initial md:max-w-md md:mx-auto md:my-8 md:shadow-md rounded-none md:rounded-lg border-0 md:border">
          <CardHeader className="px-6 pt-8 pb-4 md:p-6">
            <CardTitle className="text-xl md:text-2xl">Accept Invitation</CardTitle>
            <CardDescription className="text-sm md:text-base mt-2">
              {invitation && (
                <>
                  You&apos;ve been invited by <strong>{invitation.ownerName}</strong>{" "}
                  to join as a flatmate. Please set your password to create your
                  account.
                </>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent className="px-6 pb-8 md:p-6 md:pt-0">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm md:text-base">Email</FormLabel>
                      <FormControl>
                        <Input 
                          type="email" 
                          disabled 
                          {...field} 
                          className="h-12 md:h-10 text-base"
                        />
                      </FormControl>
                      <FormMessage className="text-xs md:text-sm" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm md:text-base">Name</FormLabel>
                      <FormControl>
                        <Input 
                          type="text" 
                          disabled 
                          {...field} 
                          className="h-12 md:h-10 text-base"
                        />
                      </FormControl>
                      <FormMessage className="text-xs md:text-sm" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm md:text-base">Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showPassword ? "text" : "password"}
                            placeholder="Create a password"
                            {...field}
                            required
                            minLength={6}
                            className="h-12 md:h-10 text-base pr-10"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute right-0 top-0 h-full px-3 py-1 hover:bg-transparent"
                            onClick={() => setShowPassword(!showPassword)}
                            aria-label={showPassword ? "Hide password" : "Show password"}
                          >
                            {showPassword ? (
                              <EyeOffIcon className="h-5 w-5 md:h-4 md:w-4" />
                            ) : (
                              <EyeIcon className="h-5 w-5 md:h-4 md:w-4" />
                            )}
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage className="text-xs md:text-sm" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm md:text-base">Confirm Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder="Confirm your password"
                            {...field}
                            required
                            minLength={6}
                            className="h-12 md:h-10 text-base pr-10"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute right-0 top-0 h-full px-3 py-1 hover:bg-transparent"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                          >
                            {showConfirmPassword ? (
                              <EyeOffIcon className="h-5 w-5 md:h-4 md:w-4" />
                            ) : (
                              <EyeIcon className="h-5 w-5 md:h-4 md:w-4" />
                            )}
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage className="text-xs md:text-sm" />
                    </FormItem>
                  )}
                />
                <Button 
                  type="submit" 
                  className="w-full h-12 md:h-10 text-base mt-6" 
                  disabled={loading}
                >
                  {loading ? "Creating Account..." : "Create Account"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}