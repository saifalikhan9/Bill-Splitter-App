import { BillResult } from "@/contexts/CarculatorContext";
import { prisma } from "@/lib/prisma";
import { sessionAuth } from "@/lib/sessionAuth";
import { NextRequest, NextResponse } from "next/server";


export async function POST(req: NextRequest) {
  try {
    const session = await sessionAuth();

    // Check if user is authenticated and is an OWNER
    if (!session || !session.user || session.user.role !== "OWNER") {
      return NextResponse.json(
        { error: "Unauthorized: Only owners can create bills" },
        { status: 401 }
      );
    }

    const { data } = await req.json();

    // Validate request data
    if (!data) {
      return NextResponse.json(
        { error: "Invalid data: Missing required fields" },
        { status: 404 }
      );
    }

    
    const newBill = await prisma.bill.create({
      data: {
        ownerId: (session.user.id),
        masterReading : data.masterReading,
        actualBill: data.actualBill,
        details: {
          create: data.details.map(d => ({
            name: d.name,
            reading: d.reading,
            Amount: d.amount,
            userId: ( d.id),
          })),
        },
      },
      include: {
        details: true,
      },
    });


const {name,email} = session.user
if (!name || !email) {
  throw new Error("email and name is not found")
}

    return NextResponse.json({ bill: newBill }, { status: 201 });
  } catch (error) {
    console.error("Error creating bill:", error);
    return NextResponse.json(
      { error: "Failed to create bill" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const { user, status } = await sessionAuth();

    if (status === "unauthenticated" || !user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Only owners can access all bills
    if (user.role !== "OWNER") {
      return NextResponse.json({ message: "Access denied" }, { status: 403 });
    }

    const bills = await prisma.bill.findMany({
      where: { ownerId: (user.id) },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        masterReading: true,
        actualBill: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ bills }, { status: 200 });
  } catch (error) {
    console.error("Error fetching bills:", error);
    return NextResponse.json(
      { message: "Failed to fetch bills" },
      { status: 500 }
    );
  }
}
