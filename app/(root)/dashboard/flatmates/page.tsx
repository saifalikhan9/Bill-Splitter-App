"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import UserActions from "./UserActions";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Clock, PlusCircle, UserPlus } from "lucide-react";
import { useRouter } from "next/navigation";

type Flatmate = {
  id: number;
  name: string;
  email: string;
};

export default function FlatmateList() {
  const [flatmates, setFlatmates] = useState<Flatmate[] | null>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
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
        }
      } catch (error) {
        console.error("Error checking user role:", error);
        router.push("/dashboard");
      } finally {
        setLoading(false);
      }
    }
    
    checkUserRole();
  }, [router]);

  const fetchFlatmates = useCallback(async () => {
    try {
      const res = await fetch("/api/users");
      const json = await res.json();

      if (!res.ok || json.status !== 200) {
        throw new Error(json.message || "Failed to fetch flatmates");
      }

      setFlatmates(json.data.flatmates);
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    }
  }, []);

  useEffect(() => {
    if (!loading) {
      fetchFlatmates();
    }
  }, [fetchFlatmates, loading]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <p>Loading...</p>
      </div>
    );
  }

  if (flatmates?.length === 0) {
    return (
      <Card className="border-dashed border-2 border-gray-300">
        <CardContent className="flex flex-col items-center justify-center p-10 text-center">
          <div className="rounded-full bg-gray-100 p-4 mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-10 w-10 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
              />
            </svg>
          </div>
          <h1 className="text-xl font-semibold text-gray-800 mb-2">No flatmates yet</h1>
          <p className="text-gray-500 mb-6">Add your first flatmate to get started with expense sharing</p>
          <div className="flex gap-3">
            <Link href="/dashboard/flatmates/addnew">
              <Button>
                <PlusCircle className="h-4 w-4 mr-2" />
                Add Manually
              </Button>
            </Link>
            <Link href="/dashboard/flatmates/invite">
              <Button variant="outline">
                <UserPlus className="h-4 w-4 mr-2" />
                Invite by Email
              </Button>
            </Link>
          </div>
          <div className="mt-4">
            <Link href="/dashboard/flatmates/invitations">
              <Button variant="ghost" size="sm">
                <Clock className="h-4 w-4 mr-2" />
                View Pending Invitations
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <CardContent>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Flatmate List</h2>
          <div className="flex gap-3">
            <Link href="/dashboard/flatmates/addnew">
              <Button size="sm">
                <PlusCircle className="h-4 w-4 mr-2" />
                Add Manually
              </Button>
            </Link>
            <Link href="/dashboard/flatmates/invite">
              <Button size="sm" variant="outline">
                <UserPlus className="h-4 w-4 mr-2" />
                Invite by Email
              </Button>
            </Link>
            <Link href="/dashboard/flatmates/invitations">
              <Button size="sm" variant="ghost">
                <Clock className="h-4 w-4 mr-2" />
                Pending Invitations
              </Button>
            </Link>
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {flatmates?.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.id}</TableCell>
                <TableCell>{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <UserActions user={user} refetch={fetchFlatmates} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
