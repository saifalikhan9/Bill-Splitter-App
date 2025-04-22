// app/api/bills/[id]/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sessionAuth } from "@/lib/sessionAuth";

// DELETE - Delete a bill by ID
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { user, status } = await sessionAuth();

    // Check authentication
    if (status === "unauthenticated" || !user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Only owners can delete bills
    if (user.role !== "OWNER") {
      return NextResponse.json({ message: "Access denied" }, { status: 403 });
    }

    const billId = parseInt(params.id);

    if (isNaN(billId)) {
      return NextResponse.json({ message: "Invalid bill ID" }, { status: 400 });
    }

    // First, verify that the bill belongs to this owner
    const bill = await prisma.bill.findUnique({
      where: { id: billId },
      select: { ownerId: true },
    });

    if (!bill) {
      return NextResponse.json({ message: "Bill not found" }, { status: 404 });
    }

    // Check if the bill belongs to the authenticated owner
    if (bill.ownerId !== user.id) {
      return NextResponse.json(
        {
          message: "You don't have permission to delete this bill",
        },
        { status: 403 }
      );
    }

    // Delete the bill (BillDetails will be cascade deleted due to the relation)
    await prisma.bill.delete({
      where: { id: billId },
    });

    return NextResponse.json(
      {
        message: "Bill deleted successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting bill:", error);
    return NextResponse.json(
      {
        message: "Failed to delete bill",
      },
      { status: 500 }
    );
  }
}

// GET - Get a bill by ID
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { user, status } = await sessionAuth();

    // Check authentication
    if (status === "unauthenticated" || !user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const billId = parseInt(params.id);

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

    // If user is a flatmate, they can only see their own bill details
    if (user.role === "FLATMATE") {
      // Check if this flatmate is part of this bill
      const flatmateDetail = bill.details.find(
        (detail) => detail.userId === user.id
      );

      if (!flatmateDetail) {
        return NextResponse.json(
          {
            message: "You don't have access to this bill",
          },
          { status: 403 }
        );
      }

      // Return only this flatmate's details
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

    // If user is the owner of this bill, they can see everything
    if (bill.ownerId === user.id) {
      return NextResponse.json({ bill }, { status: 200 });
    }

    // Otherwise, deny access
    return NextResponse.json(
      {
        message: "You don't have access to this bill",
      },
      { status: 403 }
    );
  } catch (error) {
    console.error("Error fetching bill:", error);
    return NextResponse.json(
      {
        message: "Failed to fetch bill",
      },
      { status: 500 }
    );
  }
}
