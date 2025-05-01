import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hash } from "bcrypt";
import { toast } from "sonner";

export async function POST(req: NextRequest) {
  try {
    const { token, password } = await req.json();
    
    // Validate input
    if (!token || !password) {
      return NextResponse.json(
        { message: "Token and password are required" },
        { status: 400 }
      );
    }
    
    // Find the invitation
    const invitation = await prisma.flatmateInvitation.findUnique({
      where: { token },
      include: { owner: true }
    });
    
    // Check if invitation exists
    if (!invitation) {
      return NextResponse.json(
        { message: "Invalid invitation token" },
        { status: 404 }
      );
    }
    
    // Check if invitation has expired
    if (new Date() > invitation.expiresAt) {
      return NextResponse.json(
        { message: "Invitation has expired" },
        { status: 400 }
      );
    }
    
    // Check if user with this email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: invitation.email },
    });
    
    if (existingUser) {
      return NextResponse.json(
        { message: "User with this email already exists" },
        { status: 409 }
      );
    }
    
    // Hash the password
    const hashedPassword = await hash(password, 12);
    
    // Create the new user
    const user = await prisma.user.create({
      data: {
        name: invitation.name,
        email: invitation.email,
        password: hashedPassword,
        role: "FLATMATE",
        ownerId: invitation.ownerId,
      },
    });
    
    // Delete the invitation after it's been used
    await prisma.flatmateInvitation.delete({
      where: { id: invitation.id },
    });
    toast.success(`Welcome ${user.name} to the family!`);
    return NextResponse.json(
      { 
        message: "Account created successfully",
        redirectTo: "/signin"
      },
      { status: 201 }
    );
    
  } catch (error) {
    console.error("Error accepting invitation:", error);
    return NextResponse.json(
      { message: "Failed to create account" },
      { status: 500 }
    );
  }
}

// GET endpoint to validate a token
export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const token = url.searchParams.get('token');
    
    if (!token) {
      return NextResponse.json(
        { message: "Token is required" },
        { status: 400 }
      );
    }
    
    const invitation = await prisma.flatmateInvitation.findUnique({
      where: { token },
      select: {
        id: true,
        name: true,
        email: true,
        expiresAt: true,
        owner: {
          select: {
            name: true,
          }
        }
      }
    });
    
    if (!invitation) {
      return NextResponse.json(
        { valid: false, message: "Invalid invitation token" },
        { status: 404 }
      );
    }
    
    if (new Date() > invitation.expiresAt) {
      return NextResponse.json(
        { valid: false, message: "Invitation has expired" },
        { status: 400 }
      );
    }
    
    return NextResponse.json({
      valid: true,
      invitation: {
        name: invitation.name,
        email: invitation.email,
        ownerName: invitation.owner.name
      }
    }, { status: 200 });
    
  } catch (error) {
    console.error("Error validating invitation:", error);
    return NextResponse.json(
      { valid: false, message: "Failed to validate invitation" },
      { status: 500 }
    );
  }
} 