import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/authOptions';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }
    
    const userId = parseInt(session.user.id);
    
    // Get the user's OAuth status
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        emailProvider: true,
        // Don't return the full tokens for security, just check if they exist
        emailAccessToken: Boolean,
        emailRefreshToken: Boolean,
        emailTokenExpiry: true,
        emailAuthorized: true
      }
    });
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    // Process for safe display
    const displayUser = {
      ...user,
      emailAccessToken: user.emailAccessToken ? 'Token exists' : null,
      emailRefreshToken: user.emailRefreshToken ? 'Token exists' : null,
      emailAuthorized: !!user.emailAuthorized,
      emailTokenExpiry: user.emailTokenExpiry ? user.emailTokenExpiry.toISOString() : null,
      hasValidOAuth: !!(
        user.emailProvider && 
        user.emailAccessToken && 
        user.emailRefreshToken &&
        user.emailAuthorized
      )
    };
    
    return NextResponse.json({
      status: 'success',
      user: displayUser
    });
  } catch (error) {
    console.error('Error checking OAuth status:', error);
    return NextResponse.json(
      { error: 'Server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 