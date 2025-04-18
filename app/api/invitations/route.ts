import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hash } from "bcrypt";
import { sessionAuth } from "@/lib/sessionAuth";
import crypto from "crypto";

// POST - Create a new invitation for a flatmate
export async function POST(req: Request) {
  try {
    const { user, status } = await sessionAuth();
    
    // Check authentication
    if (status === "unauthenticated" || !user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    
    // Only owners can create invitations
    if (user.role !== "OWNER") {
      return NextResponse.json({ message: "Only owners can create invitations" }, { status: 403 });
    }
    
    const { name, email } = await req.json();
    
    // Validate input
    if (!name || !email) {
      return NextResponse.json({ message: "Name and email are required" }, { status: 400 });
    }
    
    // Check if user with this email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });
    
    if (existingUser) {
      return NextResponse.json({ message: "User with this email already exists" }, { status: 409 });
    }
    
    // Generate a unique token
    const token = crypto.randomBytes(32).toString('hex');
    
    // Set expiration (48 hours from now)
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 48);
    
    // Create the invitation
    const invitation = await prisma.flatmateInvitation.create({
      data: {
        name,
        email,
        token,
        expiresAt,
        ownerId: Number(user.id),
      },
    });
    
    return NextResponse.json({ 
      message: "Invitation created successfully",
      invitationToken: token,
      // Include invitation link that can be shared with the flatmate
      invitationLink: `${process.env.NEXT_PUBLIC_APP_URL}/accept-invitation?token=${token}`,
    }, { status: 201 });
    
  } catch (error) {
    console.error("Error creating invitation:", error);
    return NextResponse.json({ message: "Failed to create invitation" }, { status: 500 });
  }
}

// GET - Get all invitations for the current owner
export async function GET() {
  try {
    const { user, status } = await sessionAuth();
    
    // Check authentication
    if (status === "unauthenticated" || !user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    
    // Only owners can view invitations
    if (user.role !== "OWNER") {
      return NextResponse.json({ message: "Only owners can view invitations" }, { status: 403 });
    }
    
    const invitations = await prisma.flatmateInvitation.findMany({
      where: {
        ownerId: Number(user.id),
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    
    return NextResponse.json({ invitations }, { status: 200 });
    
  } catch (error) {
    console.error("Error fetching invitations:", error);
    return NextResponse.json({ message: "Failed to fetch invitations" }, { status: 500 });
  }
} 