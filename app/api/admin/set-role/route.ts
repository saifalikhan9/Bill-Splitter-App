import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/authOptions';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    // Get current user session
    const session = await getServerSession(authOptions);
    
    // Only admins or owners can set roles
    if (!session?.user?.id || session.user.role !== 'OWNER') {
      return NextResponse.json(
        { error: 'Unauthorized - only owners can set roles' },
        { status: 401 }
      );
    }
    
    // Get user ID and role from request body
    const data = await request.json();
    const { userId, role } = data;
    
    if (!userId || !role || !['OWNER', 'FLATMATE'].includes(role)) {
      return NextResponse.json(
        { error: 'Invalid request - userId and valid role required' },
        { status: 400 }
      );
    }
    
    // Update the user's role
    const updatedUser = await prisma.user.update({
      where: { id: parseInt(userId, 10) },
      data: { role }
    });
    
    return NextResponse.json({ 
      success: true, 
      message: `User role updated to ${role}`,
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role
      } 
    });
  } catch (error) {
    console.error('Error updating user role:', error);
    return NextResponse.json(
      { error: 'Failed to update user role' },
      { status: 500 }
    );
  }
} 