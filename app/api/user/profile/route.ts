import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sessionAuth } from "@/lib/sessionAuth";
import { userProfileType } from "@/lib/types"; // Adjust the import path as necessary

// GET user profile
export async function GET() {
  try {
    const { user, status } = await sessionAuth();

    if (status === "unauthenticated" || !user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const userData : userProfileType | null = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });

    if (!userData) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ user: userData }, { status: 200 });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return NextResponse.json(
      { message: "Failed to fetch user profile" },
      { status: 500 }
    );
  }
}

// Update user profile
export async function PUT(req: Request) {
  try {
    const { user, status } = await sessionAuth();

    if (status === "unauthenticated" || !user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { name  } = await req.json() as { name: string|null };

    // Validate input
    if (!name || !name.trim()) {
      return NextResponse.json(
        { message: "Name is required" },
        { status: 400 }
      );
    }

    // Update user
    const updatedUser : userProfileType | null = await prisma.user.update({
      where: { id: user.id },
      data: { name },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });

    return NextResponse.json(
      {
        message: "Profile updated successfully",
        user: updatedUser,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating user profile:", error);
    return NextResponse.json(
      { message: "Failed to update profile" },
      { status: 500 }
    );
  }
}
