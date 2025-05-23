// app/api/users/route.ts

import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { sessionAuth } from "@/lib/sessionAuth";

export async function GET() {
  const { user, status } = await sessionAuth();

  if (!user && status === "unauthenticated") {
    return NextResponse.json({
      message: "User is not authenticated",
      status: 401,
    });
  }

  // Check authorization - only owners can access flatmate data
  if (user?.role !== "OWNER") {
    return NextResponse.json({
      message: "Unauthorized access - only owners can view flatmates",
      status: 403,
    });
  }

  const userData = await prisma.user.findUnique({
    where: { id: user?.id },
    select: {
      flatmates: {
        select: {
          id: true,
          name: true,
          email: true,
          ownerId: true,
          createdAt: true,
        },
      },
    },
  });

  if (!userData) {
    return NextResponse.json({ message: "User not found", status: 404 });
  }


  return NextResponse.json({ message: "Success", status: 200, data: userData });
}
