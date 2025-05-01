import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sessionAuth } from "@/lib/sessionAuth";

// DELETE - Delete a bill by ID
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { user, status } = await sessionAuth();

    if (status === "unauthenticated" || !user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    if (user.role !== "OWNER") {
      return NextResponse.json({ message: "Access denied" }, { status: 403 });
    }

    const billId = parseInt(id, 10);

    if (isNaN(billId)) {
      return NextResponse.json({ message: "Invalid bill ID" }, { status: 400 });
    }

    const bill = await prisma.bill.findUnique({
      where: { id: billId },
      select: { ownerId: true },
    });

    if (!bill) {
      return NextResponse.json({ message: "Bill not found" }, { status: 404 });
    }

    if (bill.ownerId !== user.id) {
      return NextResponse.json(
        { message: "You don't have permission to delete this bill" },
        { status: 403 }
      );
    }

    await prisma.bill.delete({
      where: { id: billId },
    });

    return NextResponse.json(
      { message: "Bill deleted successfully" },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error("Error deleting bill:", error);
    return NextResponse.json(
      { message: "Failed to delete bill" },
      { status: 500 }
    );
  }
}

// GET - Get a bill by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user, status } = await sessionAuth();

    if (status === "unauthenticated" || !user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const billId = parseInt(id, 10);

    if (isNaN(billId)) {
      return NextResponse.json({ message: "Invalid bill ID" }, { status: 400 });
    }

    const bill = await prisma.bill.findUnique({
      where: { id: billId },
      include: {
        details: true,
      },
    });

    if (!bill) {
      return NextResponse.json({ message: "Bill not found" }, { status: 404 });
    }

    if (user.role === "FLATMATE") {
      const flatmateDetail = bill.details.find(
        (detail) => detail.userId === user.id
      );

      if (!flatmateDetail) {
        return NextResponse.json(
          { message: "You don't have access to this bill" },
          { status: 403 }
        );
      }

      return NextResponse.json(
        {
          bill: {
            id: bill.id,
            createdAt: bill.createdAt,
            detail: flatmateDetail,
          },
        },
        { status: 200 }
      );
    }

    if (bill.ownerId === user.id) {
      return NextResponse.json({ bill }, { status: 200 });
    }

    return NextResponse.json(
      { message: "You don't have access to this bill" },
      { status: 403 }
    );
  } catch (error: unknown) {
    console.error("Error fetching bill:", error);
    return NextResponse.json(
      { message: "Failed to fetch bill" },
      { status: 500 }
    );
  }
}
