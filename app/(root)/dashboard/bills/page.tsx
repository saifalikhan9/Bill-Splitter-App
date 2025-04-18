"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import Link from "next/link";
import { ArrowLeft, Plus } from "lucide-react";

export default function BillsPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        // Fetch user profile to determine role
        const userResponse = await fetch("/api/user/profile");
        const userData = await userResponse.json();
        
        if (!userResponse.ok) {
          throw new Error(userData.message || "Failed to fetch user profile");
        }
        
        setUser(userData.user);
      } catch (error: any) {
        console.error("Error fetching data:", error);
        toast.error(error.message || "Failed to load user profile");
      } finally {
        setLoading(false);
      }
    };
    
    fetchUser();
  }, []);
  
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <p>Loading...</p>
      </div>
    );
  }
  
  const isOwner = user?.role === "OWNER";
  
  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardContent className="p-6">
        <div className="mb-6">
          <Link href="/dashboard">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
        </div>
        
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-4">Bills Management</h2>
          <p className="text-gray-500 mb-8">
            Bill information is now available directly on your dashboard homepage.
          </p>
          
          {isOwner && (
            <Link href="/dashboard/calculate">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create New Bill
              </Button>
            </Link>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
