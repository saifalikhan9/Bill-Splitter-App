import { prisma } from "@/lib/prisma";
import { sessionAuth } from "@/lib/sessionAuth";
import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "node:crypto";
import { hash } from "bcrypt";

async function handler(req: NextRequest) {
  try {
    // Validate session
    const { user, status } = await sessionAuth();
    if (status === "unauthenticated" || !user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Verify user role - only owners can create flatmates
    if (user.role !== "OWNER") {
      return NextResponse.json(
        {
          message: "Forbidden: Only owners can create flatmates",
        },
        { status: 403 }
      );
    }

    // Validate request method
    if (req.method !== "POST") {
      return NextResponse.json(
        { message: "Method not allowed" },
        { status: 405 }
      );
    }

    // Parse and validate request body
    const body = await req.json();
    const { email, password, name } = body;

    if (!email || !password || !name) {
      return NextResponse.json({
        message: "All fields (email, password, name) are required.",
        status: 400,
      });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({
        message: "User already exists with this email.",
        status: 409,
      });
    }

    // Generate invitation token
    const invitationLink = randomBytes(16).toString("hex");

    // Create the invitation token
    await prisma.invitationToken.create({
      data: {
        token: invitationLink,
        ownerId: user.id,
      },
    });

    // Hash the password
    const hashedPassword = await hash(password, 12);

    // Create the flatmate user
    const flatmate = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: "FLATMATE",
        ownerId: user.id,
      },
    });

    return NextResponse.json(
      {
        message: "Flatmate created and invitation token generated.",
        flatmate,
        token: invitationLink,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating flatmate:", error);
    return NextResponse.json(
      {
        message: "Internal Server Error",
        error: (error as Error)?.message || error,
      },
      { status: 500 }
    );
  }
}

export { handler as POST };
