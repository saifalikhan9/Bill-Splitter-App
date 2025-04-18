import { NavItem } from "@/components/nav-items";
import { Navbar } from "@/components/Navbar";
import {
  Home,
  LineChart,
  LogsIcon,
  Package,
  Settings,
  ShoppingCart,
  Users2,
  User as UserIcon,
  CreditCard,
  Calculator,
  PlusCircle,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import Link from "next/link";
import React from "react";
import { User } from "@/components/user";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";

export default async function DashBoardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession(authOptions);
  const userRole = session?.user?.role || "FLATMATE";

  return (
    <main className="flex min-h-screen w-full flex-col bg-muted/40">
      <DesktopNav userRole={userRole} />
      <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
        <header className=" sticky top-0 z-30 flex justify-between h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
          <h1 className="text-4xl font-bold">Dashboard</h1>
          <User />
        </header>
        <main className="w-full bg-muted/40 flex flex-col items-center p-3">
          {children}
        </main>
      </div>
    </main>
  );
}

interface DesktopNavProps {
  userRole: string;
}

function DesktopNav({ userRole }: DesktopNavProps) {
  const isOwner = userRole === "OWNER";

  return (
    <aside className="fixed inset-y-0 left-0 z-10 hidden w-14 flex-col border-r bg-background sm:flex">
      <nav className="flex flex-col items-center gap-4 px-2 sm:py-5">
        <NavItem href="/dashboard" label="Dashboard">
          <Home className="h-5 w-5" />
        </NavItem>

        {isOwner && (
          <NavItem href="/dashboard/flatmates" label="Flatmates">
            <Users2 className="h-5 w-5" />
          </NavItem>
        )}

        {isOwner && (
          <NavItem href="/dashboard/calculate" label="Create Bill">
            <PlusCircle className="h-5 w-5" />
          </NavItem>
        )}

        <NavItem href="/dashboard/profile" label="Profile">
          <UserIcon className="h-5 w-5" />
        </NavItem>
      </nav>
    </aside>
  );
}
