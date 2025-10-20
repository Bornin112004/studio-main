
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const error = searchParams.get('error');

  const generateScriptResponse = (status: 'success' | 'error', data: Record<string, any>) => {
    const script = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Authenticating...</title>
      </head>
      <body>
        <script>
          try {
            const channel = new BroadcastChannel('google-auth');
            const message = ${JSON.stringify({ status, ...data })};
            channel.postMessage(message);
          } catch (e) {
            console.error('Error posting message to BroadcastChannel:', e);
          } finally {
            window.close();
          }
        </script>
        <p>Please close this window to continue.</p>
      </body>
      </html>
    `;
    return new NextResponse(script, { headers: { 'Content-Type': 'text/html' } });
  };
  
  if (error) {
    const errorDescription = searchParams.get('error_description') || 'An unknown error occurred during authentication.';
    return generateScriptResponse('error', { error: errorDescription });
  }

  const redirectUri = `${origin}/api/auth/callback/google`;
  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!googleClientId || !googleClientSecret) {
    const errorMessage = "Server configuration error: Google credentials missing.";
    return generateScriptResponse('error', { error: errorMessage });
  }

  if (code) {
    try {
      const tokenUrl = 'https://oauth2.googleapis.com/token';
      const body = new URLSearchParams({
        code,
        client_id: googleClientId,
        client_secret: googleClientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      });

      const response = await fetch(tokenUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: body.toString(),
      });

      const tokens = await response.json();

      if (!response.ok) {
        throw new Error(tokens.error_description || 'Failed to fetch access token from Google.');
      }
      
      if (tokens.access_token) {
        cookies().set('google_access_token', tokens.access_token, {
          httpOnly: true,
          secure: process.env.NODE_ENV !== 'development',
          maxAge: tokens.expires_in || 3600,
          path: '/',
        });
      }
      
      if (tokens.refresh_token) {
        cookies().set('google_refresh_token', tokens.refresh_token, {
          httpOnly: true,
          secure: process.env.NODE_ENV !== 'development',
          maxAge: 30 * 24 * 60 * 60, // 30 days
          path: '/',
        });
      }

      return generateScriptResponse('success', {});

    } catch (e: any) {
      const errorMessage = e.message || 'Error in Google auth callback.';
      return generateScriptResponse('error', { error: errorMessage });
    }
  } else {
    const errorDescription = 'Authorization code not received from Google.';
    return generateScriptResponse('error', { error: errorDescription });
  }
}
