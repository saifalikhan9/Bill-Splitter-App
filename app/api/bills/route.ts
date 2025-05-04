import { sendBillEmail } from "@/lib/emailingService";
import { prisma } from "@/lib/prisma";
import { sessionAuth } from "@/lib/sessionAuth";
import { NextRequest, NextResponse } from "next/server";

interface BillDetail {
  name: string;
  reading: number;
  amount: number;
  id: string;
}

interface BillData {
  masterReading: number;
  actualBill: number;
  details: BillDetail[];
}

export async function POST(req: NextRequest) {
  try {
    const session = await sessionAuth();

    if (!session || !session.user || session.user.role !== "OWNER") {
      return NextResponse.json(
        { error: "Unauthorized: Only owners can create bills" },
        { status: 401 }
      );
    }

    const { data }: { data: BillData } = await req.json();

    if (!data) {
      return NextResponse.json(
        { error: "Invalid data: Missing required fields" },
        { status: 400 }
      );
    }

    // Step 1: Create bill and details in a transaction
    const newBill = await prisma.$transaction(async (tx) => {
      return await tx.bill.create({
        data: {
          ownerId: session.user.id,
          masterReading: data.masterReading,
          actualBill: data.actualBill,
          details: {
            create: data.details.map((d: BillDetail) => ({
              name: d.name,
              reading: d.reading,
              Amount: d.amount,
              userId: d.id,
            })),
          },
        },
        include: { details: true },
      });
    });

    // Step 2: Get flatmate user data
    const flatmates = await prisma.user.findMany({
      where: { id: { in: data.details.map((d) => d.id) } },
      select: { email: true, name: true, id: true },
    });

    const maildata = flatmates.map((mate) => {
      const billDetail = newBill.details.find((d) => d.userId === mate.id);
      return {
        email: mate.email,
        name: mate.name,
        reading: billDetail?.reading,
        amount: billDetail?.Amount,
      };
    });

    // Step 3: Send emails (outside transaction)
    for (const mate of maildata) {
      if (mate.reading == null || mate.amount == null) {
        // Cleanup if any bill detail is invalid
        await prisma.bill.delete({ where: { id: newBill.id } });
        return NextResponse.json(
          { error: "Missing reading or amount for some user" },
          { status: 400 }
        );
      }

      try {
        await sendBillEmail(mate.email, mate.name, mate.amount, mate.reading);
      } catch (emailErr) {
        console.error(`Failed to send email to ${mate.email}:`, emailErr);
        await prisma.bill.delete({ where: { id: newBill.id } });
        return NextResponse.json(
          { error: `Failed to send email to ${mate.email}` },
          { status: 500 }
        );
      }
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

    if (user.role !== "OWNER") {
      return NextResponse.json({ message: "Access denied" }, { status: 403 });
    }

    const bills = await prisma.bill.findMany({
      where: { ownerId: user.id },
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
