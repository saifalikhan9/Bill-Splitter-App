"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import { ArrowLeft, Copy } from "lucide-react";
import Link from "next/link";

export default function InviteFlatmate() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [invitationLink, setInvitationLink] = useState("");

  // Check if user is authorized to view this page
  useEffect(() => {
    async function checkUserRole() {
      try {
        const response = await fetch("/api/user/profile");
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to load user profile");
        }

        if (data.user.role !== "OWNER") {
          toast.error("You don't have permission to access this page");
          router.push("/dashboard");
          return;
        }
      } catch (error) {
        console.error("Error checking user role:", error);
        router.push("/dashboard");
      } finally {
        setCheckingAuth(false);
        setLoading(false);
      }
    }

    checkUserRole();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !email.trim()) {
      toast.error("Please fill in all fields");
      return;
    }

    try {
      setLoading(true);
      const response = await fetch("/api/invitations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to create invitation");
      }

      setInvitationLink(data.invitationLink);
      toast.success("Invitation created successfully!");
      //
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error("Error creating invitation:", error);
        toast.error(error.message || "Failed to create invitation");
      }
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(invitationLink);
    toast.success("Invitation link copied to clipboard!");
  };

  if (checkingAuth) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-4">
        <Link href="/dashboard/flatmates">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Flatmates
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Invite a Flatmate</CardTitle>
          <CardDescription>
            Generate an invitation link to send to your flatmate.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!invitationLink ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium">
                  Flatmate Name
                </label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter flatmate's name"
                  disabled={loading}
                  required
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">
                  Flatmate Email
                </label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter flatmate's email"
                  disabled={loading}
                  required
                />
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading
                  ? "Generating Invitation..."
                  : "Generate Invitation Link"}
              </Button>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg border">
                <p className="text-sm font-medium mb-2">Invitation Link:</p>
                <div className="flex items-center">
                  <div className="overflow-x-auto bg-white p-2 rounded border flex-1 text-sm">
                    {invitationLink}
                  </div>
                  <Button
                    variant="outline"
                    size="icon"
                    className="ml-2"
                    onClick={copyToClipboard}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="text-sm text-gray-500">
                <p>
                  This link will expire after 48 hours. Your flatmate can use
                  this link to set up their account with their own password.
                </p>
              </div>

              <div className="flex flex-col gap-2">
                <Button variant="outline" onClick={() => setInvitationLink("")}>
                  Create Another Invitation
                </Button>
                <Link href="/dashboard/flatmates">
                  <Button className="w-full">Back to Flatmates</Button>
                </Link>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
