import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sessionAuth } from "@/lib/sessionAuth";

export async function GET() {
  try {
    const { user, status } = await sessionAuth();
    
    if (status === "unauthenticated" || !user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    
    const billDetails = await prisma.billDetail.findMany({
      where: { userId: Number(user.id) },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        billId: true,
        name: true,
        reading: true,
        Amount: true,
        createdAt: true,
      },
    });
    
    return NextResponse.json({ billDetails }, { status: 200 });
  } catch (error) {
    console.error("Error fetching bill details:", error);
    return NextResponse.json({ message: "Failed to fetch bill details" }, { status: 500 });
  }
} 