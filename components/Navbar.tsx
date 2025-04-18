"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, LogOut } from "lucide-react";

export function Navbar() {
  const { data: session } = useSession();

  return (
    <nav className="border-b bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <LayoutDashboard className="h-8 w-8 text-primary" />
              <span className="text-xl font-bold text-primary">Split Bills</span>
            </Link>
          </div>

          {session?.user && (
            <div className="flex items-center space-x-4">
              <span className="text-md text-gray-600">
                Welcome, {session.user.name || session.user.email}
              </span>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => signOut({ callbackUrl: "/" })}
                className="flex items-center "
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </Button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}