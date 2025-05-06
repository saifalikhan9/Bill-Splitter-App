
import { Home, Users2, User as UserIcon, PlusCircle } from "lucide-react";
import React from "react";
import { User } from "@/components/user";
import { FloatingNav } from "@/components/ui/floating-navbar";
import { Header } from "@/components/Header";
import { sessionAuth } from "@/lib/sessionAuth";
import DesktopNav from "@/components/DesktopNav";

export default async function DashBoardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
   const {user} = await sessionAuth()
  const userRole = user?.role   // what if i useMemo here to prevent the re rendering of the component

  return (
    <main className="flex min-h-screen w-full flex-col ">
      <DesktopNav userRole={userRole} /> {/* to prevent this component re rendering  */}
      <div className="flex flex-col p-2">
        <header className=" pb-3 border-b-2 border-gray-400  sticky top-0 z-30 flex justify-between h-14 items-center gap-4   px-4 sm:static sm:h-auto   sm:px-6">
          <Header />
          <User />
        </header>
        <main className="w-full flex-1 p-3 sm:pl-14 transition-all duration-500">
          {children}
        </main>
      </div>
      <div className="fixed bottom-0 left-0 right-0 z-20 flex justify-center sm:hidden  border-t border-muted/40 py-2">

{userRole === "OWNER" && (<>
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
</>)}

        {userRole === "FLATMATE" && (<>
          <FloatingNav
          navItems={[
            {
              name: "Dashboard",
              link: "/dashboard",
              icon: <Home className="h-5 w-5" />,
            },
            {
              name: "Profile",
              link: "/dashboard/profile",
              icon: <UserIcon className="h-5 w-5" />,
            },
          ]}
        />
        </>)}

      </div>
    </main>
  );
}
