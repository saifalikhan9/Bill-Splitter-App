"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { createFlatmateSchema } from "@/lib/types";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

const FormSchema = createFlatmateSchema();

interface ExtendedUser {
  name?: string | null;
  email?: string | null;
  image?: string | null;
  role?: string;
}

export default function AddFlatmateForm() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is authorized
    if (status === "loading") return;
    
    const user = session?.user as ExtendedUser | undefined;
    if (!session || user?.role !== "OWNER") {
      toast.error("Only owners can add flatmates");
      router.push("/dashboard");
      return;
    }
    
    setLoading(false);
  }, [session, status, router]);

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: z.infer<typeof FormSchema>) => {
    try {
      const res = await fetch("/api/register/flatmates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const { error, message } = await res.json();
        throw new Error(error || message || "Something went wrong");
      }

      toast.success("Successfully added new Flatmate");
      form.reset();
      
      // Redirect after success
      setTimeout(() => {
        router.push("/dashboard/flatmates");
      }, 2000);
    } catch (err: unknown) {
      const error = err as Error;
      const message = error.message || "Failed";
      toast.error(message);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="mb-4">
        <Link href="/dashboard/flatmates">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Flatmates
          </Button>
        </Link>
      </div>
      
      <Card>
        <CardContent className="p-6">
          <h1 className="text-xl font-semibold mb-4">Add a New Flatmate</h1>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="John Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="john@example.com"
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
                      <Input
                        type="password"
                        placeholder="••••••••"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                className="w-full"
                disabled={form.formState.isSubmitting}
              >
                {form.formState.isSubmitting ? "Adding..." : "Add Flatmate"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
