'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Copy, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function FixGoogleConnectionPage() {
  const [redirectUri, setRedirectUri] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setRedirectUri(`${window.location.origin}/api/auth/callback/google`);
    }
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText(redirectUri);
    toast({
      title: 'Copied!',
      description: 'The redirect URI has been copied to your clipboard.',
    });
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
       <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-sm md:px-6">
        <Button asChild variant="outline" size="icon" className="h-8 w-8">
            <Link href="/dashboard/integrations">
                <ArrowLeft className="h-4 w-4" />
                <span className="sr-only">Back to Integrations</span>
            </Link>
        </Button>
        <h1 className="text-xl font-semibold">Connection Troubleshooting Guide</h1>
      </header>
      <main className="flex flex-1 items-center justify-center p-4">
        <Card className="w-full max-w-2xl">
          <CardHeader>
            <CardTitle>Step 1: Set Your Authorized Redirect URI</CardTitle>
            <CardDescription>
              The most common cause of Google connection errors is a mismatched redirect URI. Your Google Cloud project must know the exact URL to send you back to after authentication.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Copy the URI below and add it to your project's credentials page in the Google Cloud Console under "Authorized redirect URIs".
            </p>
            <div className="flex w-full items-center space-x-2">
              <div className="grid flex-1 gap-2">
                <Label htmlFor="redirect-uri" className="sr-only">
                  Redirect URI
                </Label>
                <Input id="redirect-uri" value={redirectUri} readOnly />
              </div>
              <Button type="button" size="icon" onClick={handleCopy} disabled={!redirectUri}>
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <div className="text-xs text-muted-foreground">
                <p><b>Where to paste this value:</b></p>
                <ol className="list-decimal pl-4 mt-1">
                    <li>Go to the <a href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noopener noreferrer" className="underline">Google Cloud Credentials page</a>.</li>
                    <li>Find your OAuth 2.0 Client ID and click the pencil icon to edit it.</li>
                    <li>Under "Authorized redirect URIs", click "+ ADD URI".</li>
                    <li>Paste the URI you just copied and click "Save".</li>
                </ol>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
