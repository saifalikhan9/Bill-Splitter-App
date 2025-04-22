import { Button } from "@/components/ui/button";
import Link from 'next/link'
import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/authOptions";

export default async function Home() {
  const session = await getServerSession(authOptions);

  
  return (
    <div className="min-h-screen flex flex-col ">
      <main className="flex flex-1 flex-col items-center justify-center text-center px-4">
        <h1 className="text-5xl font-bold mb-4 text-gray-800">WELCOME</h1>
        <p className="text-xl text-gray-600 max-w-xl mb-8">
        Split bills the smart way — no matter how many flatmates you live with.
        </p>
        {session?.user ?<div>
        <Link href={"/dashboard"}>
        <Button size="lg">DASHBOARD</Button>
        </Link>
        </div> : <div>
        <Link href={"/login"}>
        <Button size="lg">LOGIN</Button>
        </Link>
        </div>}
        
       
      </main>
    </div>
  );
}
