// app/api/users/[id]/route.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { sessionAuth } from "@/lib/sessionAuth";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user, status } = await sessionAuth();
  const { id } = await params;

  if (!user && status === "unauthenticated") {
    return NextResponse.json({ message: "unauthorized", status: 404 });
  }
  if (user?.role !== "OWNER") {
    return NextResponse.json({
      message: "You are not allowed to perform this operation",
      status: 300,
    });
  }

  const flatmate = await prisma.user.findFirst({
    where: {
      id: id,
      ownerId: user.id,
      role: "FLATMATE",
    },
  });

  if (!flatmate) {
    return NextResponse.json({
      message: "Flatmate not found or not associated with this owner.",
      status: 404,
    });
  }

  // Delete the flatmate record
  await prisma.user.delete({
    where: { id },
  });

  return NextResponse.json({
    message: "Flatmate deleted successfully.",
    status: 200,
  });
}
