import { NextRequest, NextResponse } from 'next/server';
import { storeEmailOAuthTokens } from '@/lib/emailService';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');
    const state = searchParams.get('state'); // Contains the user ID
    const error = searchParams.get('error');
    
    // Handle error from Google
    if (error) {
      console.error('OAuth error:', error);
      return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/dashboard/profile?emailAuth=error`);
    }
    
    // Ensure we have required params
    if (!code || !state) {
      return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/dashboard/profile?emailAuth=missing`);
    }
    
    // Parse the user ID
    const userId = parseInt(state, 10);
    console.log("OAuth callback for user ID:", userId);
    
    if (isNaN(userId)) {
      return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/dashboard/profile?emailAuth=invalid`);
    }
    
    // Verify user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true }
    });
    
    if (!user) {
      console.error("User not found for ID:", userId);
      return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/dashboard/profile?emailAuth=user_not_found`);
    }
    
    console.log("Found user for OAuth:", user.email);
    
    // Exchange the code for tokens
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID || '',
        client_secret: process.env.GOOGLE_CLIENT_SECRET || '',
        redirect_uri: `${process.env.NEXTAUTH_URL}/api/email-auth/callback`,
        grant_type: 'authorization_code'
      })
    });
    
    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.json();
      console.error('Token exchange error:', errorData);
      return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/dashboard/profile?emailAuth=token_error`);
    }
    
    const tokenData = await tokenResponse.json();
    console.log("Received OAuth tokens:", {
      access_token: tokenData.access_token ? "exists" : "missing",
      refresh_token: tokenData.refresh_token ? "exists" : "missing",
      expires_in: tokenData.expires_in
    });
    
    if (!tokenData.access_token || !tokenData.refresh_token) {
      console.error("Missing tokens in response:", tokenData);
      return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/dashboard/profile?emailAuth=incomplete_tokens`);
    }
    
    // Store the tokens
    await storeEmailOAuthTokens(userId, {
      accessToken: tokenData.access_token,
      refreshToken: tokenData.refresh_token,
      expiryDate: new Date(Date.now() + tokenData.expires_in * 1000),
      provider: 'gmail'
    });
    
    // Redirect to profile page with success parameter
    return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/dashboard/profile?emailAuth=success`);
  } catch (error) {
    console.error('Error handling OAuth callback:', error);
    return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/dashboard/profile?emailAuth=server_error`);
  }
} 