import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sessionAuth } from "@/lib/sessionAuth";
import { compare, hash } from "bcrypt";

export async function PUT(req: Request) {
  try {
    const { user, status } = await sessionAuth();
    
    if (status === "unauthenticated" || !user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    
    const { currentPassword, newPassword } = await req.json();
    
    // Validate input
    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { message: "Current password and new password are required" },
        { status: 400 }
      );
    }
    
    // Get current user with password
    const userData = await prisma.user.findUnique({
      where: { id: Number(user.id) },
      select: {
        id: true,
        password: true,
      },
    });
    
    if (!userData) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }
    
    // Verify current password
    const isPasswordValid = await compare(currentPassword, userData.password);
    
    if (!isPasswordValid) {
      return NextResponse.json(
        { message: "Current password is incorrect" },
        { status: 400 }
      );
    }
    
    // Hash the new password
    const hashedPassword = await hash(newPassword, 12);
    
    // Update user with new password
    await prisma.user.update({
      where: { id: Number(user.id) },
      data: { password: hashedPassword },
    });
    
    return NextResponse.json(
      { message: "Password updated successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating password:", error);
    return NextResponse.json(
      { message: "Failed to update password" },
      { status: 500 }
    );
  }
} 