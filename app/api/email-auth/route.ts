import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/authOptions';
import { storeEmailOAuthTokens } from '@/lib/emailService';

// Google OAuth2 callback URL
// Must match exactly what's configured in the Google Cloud Console

// Function to generate authorization URL
export async function GET(request: NextRequest) {
  try {
    // Get current user session
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    console.log("Starting OAuth flow for user:", session.user.id);
    
    // Create OAuth2 URL
    // Use the same scope as your regular Google authentication
    const scope = 'https://mail.google.com/ email profile';
    
    // Important: Use the exact same redirect URI format as registered in Google Cloud Console
    // This is likely the same as your NextAuth Google provider callback
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const redirectUri = `${baseUrl}/api/auth/callback/google`;
    
    console.log("Using redirect URI:", redirectUri);
    
    const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
    authUrl.searchParams.append('client_id', process.env.GOOGLE_CLIENT_ID || '');
    authUrl.searchParams.append('redirect_uri', redirectUri);
    authUrl.searchParams.append('response_type', 'code');
    authUrl.searchParams.append('scope', scope);
    authUrl.searchParams.append('access_type', 'offline');
    authUrl.searchParams.append('prompt', 'consent');
    // Pass user ID and a flag to identify this is for email auth
    authUrl.searchParams.append('state', `email-auth:${session.user.id}`);
    
    console.log("Generated auth URL:", authUrl.toString());
    
    // Redirect to Google's authorization page
    return NextResponse.redirect(authUrl.toString());
  } catch (error) {
    console.error('Error generating auth URL:', error);
    return NextResponse.json(
      { error: 'Failed to generate authorization URL' },
      { status: 500 }
    );
  }
} 