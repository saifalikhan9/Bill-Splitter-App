"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { toast } from "sonner";

export default function AcceptInvitation() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");
  
  const [loading, setLoading] = useState(true);
  const [validating, setValidating] = useState(true);
  const [invitation, setInvitation] = useState<any>(null);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
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
  }, [token, router]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate password
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return;
    }
    
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    
    try {
      setLoading(true);
      const response = await fetch("/api/accept-invitation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token,
          password,
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || "Failed to create account");
      }
      
      toast.success("Account created successfully!");
      router.push("/signin");
    } catch (error: any) {
      console.error("Error accepting invitation:", error);
      toast.error(error.message || "Failed to create account");
    } finally {
      setLoading(false);
    }
  };
  
  if (validating) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md mx-auto">
          <CardContent className="p-6">
            <div className="flex justify-center items-center h-40">
              <p className="text-gray-500">Validating invitation...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Accept Invitation</CardTitle>
          <CardDescription>
            {invitation && (
              <>
                You've been invited by <strong>{invitation.ownerName}</strong> to join as a flatmate.
                Please set your password to create your account.
              </>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <Input 
                type="email" 
                value={invitation?.email || ""} 
                disabled 
                className="bg-gray-100"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Name</label>
              <Input 
                type="text" 
                value={invitation?.name || ""} 
                disabled 
                className="bg-gray-100"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Password</label>
              <Input 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                placeholder="Create a password"
                required
                minLength={6}
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Confirm Password</label>
              <Input 
                type="password" 
                value={confirmPassword} 
                onChange={(e) => setConfirmPassword(e.target.value)} 
                placeholder="Confirm your password"
                required
                minLength={6}
              />
            </div>
            
            <Button 
              type="submit" 
              className="w-full" 
              disabled={loading}
            >
              {loading ? "Creating Account..." : "Create Account"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
} 