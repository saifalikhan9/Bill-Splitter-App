"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ArrowLeft, Copy, RefreshCw } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type Invitation = {
  id: number;
  name: string;
  email: string;
  token: string;
  expiresAt: string;
  createdAt: string;
};

export default function Invitations() {
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const router = useRouter();

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
        
        // If authorized, fetch invitations
        fetchInvitations();
      } catch (error) {
        console.error("Error checking user role:", error);
        router.push("/dashboard");
      } finally {
        setCheckingAuth(false);
      }
    }
    
    checkUserRole();
  }, [router]);

  const fetchInvitations = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/invitations");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch invitations");
      }

      setInvitations(data.invitations);
    } catch (error: unknown) {
      const err = error as Error;
      console.error("Error fetching invitations:", err);
      toast.error(err.message || "Failed to fetch invitations");
    } finally {
      setLoading(false);
    }
  };

  const copyInvitationLink = (token: string) => {
    const link = `${process.env.NEXT_PUBLIC_APP_URL || window.location.origin}/accept-invitation?token=${token}`;
    navigator.clipboard.writeText(link);
    toast.success("Invitation link copied to clipboard!");
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + " " + date.toLocaleTimeString();
  };

  if (checkingAuth || loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4 flex justify-between items-center">
        <Link href="/dashboard/flatmates">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Flatmates
          </Button>
        </Link>
        <Button size="sm" onClick={fetchInvitations} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Pending Invitations</CardTitle>
        </CardHeader>
        <CardContent>
          {invitations.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No pending invitations</p>
              <Link href="/dashboard/flatmates/invite">
                <Button variant="outline" className="mt-4">
                  Create New Invitation
                </Button>
              </Link>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Expires</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invitations.map((invitation) => (
                  <TableRow key={invitation.id}>
                    <TableCell>{invitation.name}</TableCell>
                    <TableCell>{invitation.email}</TableCell>
                    <TableCell>{formatDate(invitation.createdAt)}</TableCell>
                    <TableCell>{formatDate(invitation.expiresAt)}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="icon"
                          variant="outline"
                          onClick={() => copyInvitationLink(invitation.token)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 