"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle, CheckCircle, Mail } from "lucide-react";

export default function ProfilePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Email authorization status
  const [emailAuthorized, setEmailAuthorized] = useState(false);
  
  // Check for email auth callback status
  useEffect(() => {
    const emailAuthStatus = searchParams.get("emailAuth");
    if (emailAuthStatus) {
      if (emailAuthStatus === "success") {
        toast.success("Email authorized successfully!");
        // Refresh the page to update the user data
        router.replace("/dashboard/profile");
      } else {
        toast.error(`Email authorization failed: ${emailAuthStatus}`);
      }
    }
  }, [searchParams, router]);
  
  // Profile form fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  
  // Password change fields
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  // Fetch user data
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch("/api/user/profile");
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.message || "Failed to fetch user profile");
        }
        
        setUser(data.user);
        setName(data.user.name);
        setEmail(data.user.email);
        
        // Set email authorization status
        setEmailAuthorized(data.user.emailAuthorized || false);
      } catch (error: any) {
        console.error("Error fetching profile:", error);
        toast.error(error.message || "Failed to load profile");
      } finally {
        setLoading(false);
      }
    };
    
    fetchUser();
  }, []);
  
  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast.error("Name cannot be empty");
      return;
    }
    
    try {
      setLoading(true);
      const response = await fetch("/api/user/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || "Failed to update profile");
      }
      
      toast.success("Profile updated successfully");
      // Refresh the page to see changes
      router.refresh();
    } catch (error: any) {
      console.error("Error updating profile:", error);
      toast.error(error.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };
  
  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error("All password fields are required");
      return;
    }
    
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }
    
    if (newPassword.length < 6) {
      toast.error("New password must be at least 6 characters long");
      return;
    }
    
    try {
      setLoading(true);
      const response = await fetch("/api/user/password", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || "Failed to change password");
      }
      
      toast.success("Password updated successfully");
      
      // Reset password fields
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      console.error("Error changing password:", error);
      toast.error(error.message || "Failed to change password");
    } finally {
      setLoading(false);
    }
  };
  
  // Function to initiate email authorization
  const handleAuthorizeEmail = () => {
    window.location.href = "/api/email-auth";
  };
  
  // Function to revoke email authorization
  const handleRevokeEmailAuth = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/email-auth/revoke", {
        method: "POST",
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || "Failed to revoke email authorization");
      }
      
      setEmailAuthorized(false);
      toast.success("Email authorization revoked successfully");
    } catch (error: any) {
      console.error("Error revoking email authorization:", error);
      toast.error(error.message || "Failed to revoke email authorization");
    } finally {
      setLoading(false);
    }
  };
  
  if (loading && !user) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <p>Loading profile...</p>
      </div>
    );
  }
  
  return (
    <div className="max-w-3xl w-full mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Your Profile</CardTitle>
          <CardDescription>
            Manage your account information, password, and email settings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="profile">
            <TabsList className="mb-4">
              <TabsTrigger value="profile">Profile Details</TabsTrigger>
              <TabsTrigger value="password">Change Password</TabsTrigger>
              {user?.role === "OWNER" && (
                <TabsTrigger value="email">Email Authorization</TabsTrigger>
              )}
            </TabsList>
            
            <TabsContent value="profile">
              <form onSubmit={handleProfileUpdate} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Name</label>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your name"
                    disabled={loading}
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Email</label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Your email"
                    disabled={true} // Email should not be editable
                    className="bg-gray-50"
                  />
                  <p className="text-xs text-gray-500">Email address cannot be changed</p>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Role</label>
                  <Input
                    value={user?.role || ""}
                    disabled
                    className="bg-gray-50"
                  />
                </div>
                
                <Button type="submit" disabled={loading}>
                  {loading ? "Updating..." : "Update Profile"}
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="password">
              <form onSubmit={handlePasswordChange} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Current Password</label>
                  <Input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Your current password"
                    disabled={loading}
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">New Password</label>
                  <Input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Your new password"
                    disabled={loading}
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Confirm New Password</label>
                  <Input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm your new password"
                    disabled={loading}
                  />
                </div>
                
                <Button type="submit" disabled={loading}>
                  {loading ? "Updating..." : "Change Password"}
                </Button>
              </form>
            </TabsContent>
            
            {user?.role === "OWNER" && (
              <TabsContent value="email">
                <div className="space-y-6">
                  <div className="space-y-2">
                    <h3 className="text-lg font-medium">Email Authorization Status</h3>
                    <p className="text-sm text-gray-500">
                      Authorize your email account to send bills directly to your flatmates.
                    </p>
                    
                    <div className="flex items-center space-x-2 mt-2">
                      {emailAuthorized ? (
                        <>
                          <CheckCircle className="text-green-500" />
                          <span>Your email is authorized for sending bills</span>
                        </>
                      ) : (
                        <>
                          <AlertCircle className="text-amber-500" />
                          <span>Email not authorized</span>
                        </>
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <p className="text-sm">
                      {emailAuthorized
                        ? "You can revoke the authorization at any time."
                        : "Authorize your Google account to send emails through this application."}
                    </p>
                    
                    {emailAuthorized ? (
                      <Button 
                        variant="destructive" 
                        onClick={handleRevokeEmailAuth}
                        disabled={loading}
                      >
                        Revoke Authorization
                      </Button>
                    ) : (
                      <Button 
                        onClick={handleAuthorizeEmail}
                        disabled={loading}
                      >
                        <Mail className="mr-2 h-4 w-4" />
                        Authorize Email
                      </Button>
                    )}
                  </div>
                  
                  <div className="mt-4 p-4 bg-gray-50 rounded-md text-sm">
                    <h4 className="font-medium mb-2">About Email Authorization</h4>
                    <p className="mb-2">
                      When you authorize your email, you're giving this application permission to:
                    </p>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>Send emails on your behalf</li>
                      <li>Your login credentials are never stored</li>
                      <li>Uses secure OAuth2 authentication with Google</li>
                    </ul>
                  </div>
                </div>
              </TabsContent>
            )}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
} 