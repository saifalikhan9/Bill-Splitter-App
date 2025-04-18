import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/authOptions';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    // Get current user session
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const userId = parseInt(session.user.id, 10);
    
    // Revoke tokens by clearing the fields
    await prisma.user.update({
      where: { id: userId },
      data: {
        emailProvider: null,
        emailAccessToken: null,
        emailRefreshToken: null,
        emailTokenExpiry: null,
        emailAuthorized: false
      }
    });
    
    // Optional: Revoke the token with Google
    // This would require an additional API call to Google's revocation endpoint
    
    return NextResponse.json({ 
      success: true, 
      message: 'Email authorization revoked successfully' 
    });
  } catch (error) {
    console.error('Error revoking email authorization:', error);
    return NextResponse.json(
      { error: 'Failed to revoke email authorization' },
      { status: 500 }
    );
  }
} 