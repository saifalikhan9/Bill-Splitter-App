"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useState } from "react";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import { signIn } from "next-auth/react";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  // FormDescription, // Can be removed for more minimal look if desired
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from 'next/link'
import { createAuthSchema } from "@/lib/types"

// Define the form data type based on the authentication type
interface AuthFormData {
  email: string;
  password: string;
  name?: string;
  confirmPassword?: string;
}

// Define the props for the AuthForm
interface AuthFormProps {
  type: "signup" | "signin";
  onSubmitForm: (data: AuthFormData) => void; // Pass the submit handler as a prop
  isLoading?: boolean; // Optional loading state for the button
}

export function AuthForm({
  type,
  onSubmitForm,
  isLoading = false,
}: AuthFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const FormSchema = createAuthSchema(type);

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      email: "",
      password: "",
      ...(type === "signup" ? { name: "", confirmPassword: "" } : {}),
    },
  });

  // Use the passed onSubmitForm handler
  function onSubmit(data: z.infer<typeof FormSchema>) {
    console.log("Form Data:", data);
    onSubmitForm(data as AuthFormData); // Call the handler passed via props
  }

  const isSignup = type === "signup";
  const submitButtonText = isSignup ? "Sign Up" : "Sign In";
  const cardTitle = isSignup ? "Create an Account" : "Welcome Back";
  const cardDescription = isSignup
    ? "Enter your details below to create your account."
    : "Enter your email and password to sign in.";

  return (
    <Card className="w-full max-w-sm ">
      {" "}
      {/* Added Card wrapper */}
      <CardHeader>
        <CardTitle>{cardTitle}</CardTitle>
        <CardDescription>{cardDescription}</CardDescription>
      </CardHeader>
      
      {/* Google Sign In Button */}
      <CardContent className="pt-1 pb-0">
        <Button 
          type="button" 
          variant="outline" 
          className="w-full"
          onClick={() => signIn('google', { callbackUrl: '/' })}
        >
          <svg viewBox="0 0 24 24" width="16" height="16" className="mr-2">
            <path
              fill="currentColor"
              d="M12.545 10.239v3.821h5.445c-.712 2.315-2.647 3.972-5.445 3.972a6.033 6.033 0 110-12.064c1.498 0 2.866.549 3.921 1.453l2.814-2.814A9.969 9.969 0 0012.545 2C7.021 2 2.543 6.477 2.543 12s4.478 10 10.002 10c8.396 0 10.249-7.85 9.426-11.748l-9.426-.013z"
            />
          </svg>
          Continue with Google
        </Button>
        <div className="relative my-3">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t"></div>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
          </div>
        </div>
      </CardContent>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            {" "}
            {/* Moved form fields into CardContent, adjusted spacing */}
            {isSignup && (
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>name</FormLabel>
                    <FormControl>
                      <Input placeholder="johndoe" {...field} />
                    </FormControl>
                    {/* Optional: Keep or remove FormDescription for minimalism */}
                    {/* <FormDescription>This is your public display name.</FormDescription> */}
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="you@example.com"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        {...field}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent" // Adjusted styling slightly
                        onClick={() => setShowPassword(!showPassword)}
                        aria-label={
                          showPassword ? "Hide password" : "Show password"
                        }
                      >
                        {showPassword ? (
                          <EyeOffIcon className="h-4 w-4" />
                        ) : (
                          <EyeIcon className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {isSignup && (
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="••••••••"
                          {...field}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent" // Adjusted styling slightly
                          onClick={() =>
                            setShowConfirmPassword(!showConfirmPassword)
                          }
                          aria-label={
                            showConfirmPassword
                              ? "Hide confirm password"
                              : "Show confirm password"
                          }
                        >
                          {showConfirmPassword ? (
                            <EyeOffIcon className="h-4 w-4" />
                          ) : (
                            <EyeIcon className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </CardContent>
          <CardFooter>
            {" "}
            {/* Moved button into CardFooter */}
            <Button type="submit" className="w-full mt-3" disabled={isLoading}>
              {/* Optionally show loading indicator */}
              {isLoading ? "Processing..." : submitButtonText}
            </Button>
            {/* Optional: Add a link to switch between sign up and sign in */}
        
          </CardFooter>
          {isSignup ? (  
              <p className="mt-4 text-sm text-center">
                Already have an account?{" "}
                <Link href="/signin" className="text-blue-600 hover:underline">
                  Sign In
                </Link>
              </p>
            ) : (
              <p className="mt-4 text-sm text-center">
                Don&apos;t have an account?{" "}
                <Link href="/signup" className="text-blue-600 hover:underline">
                  Sign Up
                </Link>
              </p> 
            )}
        </form>
      </Form>
    </Card>
  );
}
