import { generateBillPDF } from "@/lib/pdfGenerator";
import { prisma } from "@/lib/prisma";
import { sessionAuth } from "@/lib/sessionAuth";
import { billstype } from "@/lib/types";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const { user, status } = await sessionAuth();
  if (status === "unauthenticated" || !user) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { billId } = await request.json();
  if (!billId) {
    return new NextResponse("Bill ID is required", { status: 400 });
  }

  try {
    const billData: billstype | null = await prisma.bill.findUnique({
      where: { id: billId },
      select: {
        id: true,
        ownerId: true,
        masterReading: true,
        actualBill: true,
        createdAt: true,
        details: true,
      },
    });

    if (!billData) {
      return new NextResponse("Bill not found", { status: 404 });
    }

    // Generate the PDF in memory
    const pdfBuffer = await generateBillPDF(billData, user.name);

    if (!pdfBuffer) {
      return new NextResponse("Failed to generate PDF", { status: 500 });
    }

    return new NextResponse(pdfBuffer, {
      status: 200,
    });
  } catch (error) {
    console.error("Error generating PDF:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
