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
  id: string;
  name: string;
  email: string;
};

export default function FlatmateList() {
  const [flatmates, setFlatmates] = useState<Flatmate[] | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchFlatmates = useCallback(async () => {
    try {
      const res = await fetch("/api/users");
      const json = await res.json();

      if (!res.ok || json.status !== 200) {
        throw new Error(json.message || "Failed to fetch flatmates");
      }

      setFlatmates(json.data.flatmates);
    } catch (err: unknown) {
      setError((err as Error).message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, []);

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
        fetchFlatmates();
      } catch {
        router.push("/dashboard");
      }
    }
    checkUserRole();
  }, [router, fetchFlatmates]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p>Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  if (!flatmates || flatmates.length === 0) {
    return (
      <div className="flex flex-col items-center m-4 p-4">
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-6 sm:p-10 text-center">
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
            <h1 className="text-xl font-semibold text-gray-800 mb-2">
              No flatmates yet
            </h1>
            <p className="text-gray-500 mb-6">
              Add your first flatmate to get started with expense sharing
            </p>

            {/* Button Group: Mobile */}
            <div className="flex flex-col gap-3 w-full md:hidden">
              <Link href="/dashboard/flatmates/addnew" className="w-full">
                <Button size="sm" className="w-full">
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Add Manually
                </Button>
              </Link>
              <Link href="/dashboard/flatmates/invite" className="w-full">
                <Button size="sm" variant="outline" className="w-full">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Invite by Email
                </Button>
              </Link>
            </div>
            {/* Button Group: Desktop */}
            <div className="hidden md:flex gap-3">
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
            </div>

            <Link
              href="/dashboard/flatmates/invitations"
              className="mt-4 w-full sm:w-auto"
            >
              <Button variant="ghost" size="sm">
                <Clock className="h-4 w-4 mr-2" />
                View Pending Invitations
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <Card className="mx-auto w-full max-w-5xl ">
      <CardContent className="  p-4 sm:p-6">
        <div className=" flex flex-col sm:flex-row justify-between items-center mb-4 sm:mb-6 gap-3">
          <h2 className="text-xl font-semibold">Flatmate List</h2>

          {/* Button Group: Mobile */}
          <div className="flex flex-col gap-2 w-full  md:hidden">
            <Link href="/dashboard/flatmates/addnew" className="w-full">
              <Button size="sm" className="w-full">
                <PlusCircle className="h-4 w-4 mr-2" />
                Add Manually
              </Button>
            </Link>
            <Link href="/dashboard/flatmates/invite" className="w-full">
              <Button size="sm" variant="outline" className="w-full">
                <UserPlus className="h-4 w-4 mr-2" />
                Invite by Email
              </Button>
            </Link>
            <Link href="/dashboard/flatmates/invitations" className="w-full">
              <Button size="sm" variant="ghost" className="w-full">
                <Clock className="h-4 w-4 mr-2" />
                Pending Invitations
              </Button>
            </Link>
          </div>
          {/* Button Group: Desktop */}
          <div className="hidden md:flex gap-3">
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

        <div className="overflow-x-auto">
          {/* Flatmate Cards: Mobile */}
          <div className="space-y-4 md:hidden">
            {flatmates.map((user, i) => (
              <div key={user.id} className="border rounded-md p-3">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium">{i + 1}</span>
                  <UserActions user={user} refetch={fetchFlatmates} />
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Name:</span>
                    <span className="font-medium">{user.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">
                      Email:
                    </span>
                    <span className="text-sm truncate max-w-xs">
                      {user.email}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Flatmate Table: Desktop */}
          <div className="hidden md:block">
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
                {flatmates.map((user, i) => (
                  <TableRow key={user.id}>
                    <TableCell>{i + 1}</TableCell>
                    <TableCell>{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <UserActions user={user} refetch={fetchFlatmates} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
