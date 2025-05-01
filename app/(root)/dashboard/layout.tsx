import { NavItem } from "@/components/nav-items";
import { Home, Users2, User as UserIcon, PlusCircle } from "lucide-react";
import React from "react";
import { User } from "@/components/user";
import { FloatingNav } from "@/components/ui/floating-navbar";
import { Header } from "@/components/Header";
import { sessionAuth } from "@/lib/sessionAuth";

export default async function DashBoardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
   const {user} = await sessionAuth()
  const userRole = user?.role || "FLATMATE";

  return (
    <main className="flex min-h-screen w-full flex-col ">
      <DesktopNav userRole={userRole} />
      <div className="flex flex-col p-2">
        <header className=" pb-3 border-b-2 border-gray-400  sticky top-0 z-30 flex justify-between h-14 items-center gap-4   px-4 sm:static sm:h-auto   sm:px-6">
          <Header />
          <User />
        </header>
        <main className="w-full  flex flex-col items-center p-3">
          {children}
        </main>
      </div>
      <div className="fixed bottom-0 left-0 right-0 z-20 flex justify-center sm:hidden  border-t border-muted/40 py-2">
        <FloatingNav
          navItems={[
            {
              name: "Dashboard",
              link: "/dashboard",
              icon: <Home className="h-5 w-5" />,
            },
            {
              name: "Flatmates",
              link: "/dashboard/flatmates",
              icon: <Users2 className="h-5 w-5" />,
            },
            {
              name: "Create Bill",
              link: "/dashboard/calculate",
              icon: <PlusCircle className="h-5 w-5" />,
            },
            {
              name: "Profile",
              link: "/dashboard/profile",
              icon: <UserIcon className="h-5 w-5" />,
            },
          ]}
        />
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
    <aside className="fixed inset-y-0 top-15 left-0 z-10 hidden w-14 flex-col  inset-shadow-neutral-900 border-r-1 border-r-gray-400  sm:flex">
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
