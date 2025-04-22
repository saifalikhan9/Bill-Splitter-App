import Calculator from "@/components/Calculator";
import { prisma } from "@/lib/prisma";
import { sessionAuth } from "@/lib/sessionAuth";
import { notFound, redirect } from "next/navigation";
import React from "react";

export default async function page() {
  const { user, status } = await sessionAuth();
  

  if (status === "unauthenticated") {
    redirect("/signin");
  }

  // Check if user is an OWNER, redirect otherwise
  if (user?.role !== "OWNER") {
    redirect("/dashboard"); // Redirect to dashboard if not an owner
  }

  const res = await prisma.user.findUnique({
    where: { id: (user?.id) },
    select: { flatmates: {select: {id:true, name:true, ownerId:true}} },
  });

  if (!res) {
    return notFound();
  }
  
  const data = res?.flatmates;


  return (
    <div className="flex flex-col justify-center w-full items-center m-3 p-3">
      <Calculator data={data} Owner={user} />
    </div>
  );
}
