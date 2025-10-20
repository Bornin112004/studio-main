"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { uploadKpiDataAction, getGoogleSheetDataAction } from "@/lib/actions";
import { UploadCloud, ExternalLink, Download } from "lucide-react";
import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useKpiData } from "@/context/kpi-data-context";
import { DebugDataViewer } from "@/components/debug-data-viewer";

export default function IntegrationsPage() {
  const { toast } = useToast();
  const { loadKpiData } = useKpiData();
  const [isUploading, setIsUploading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [googleProjectId, setGoogleProjectId] = useState<string | null>(null);

  const [spreadsheetId, setSpreadsheetId] = useState('');
  const [sheetName, setSheetName] = useState('');
  const [dataRange, setDataRange] = useState('');
  const [isFetching, setIsFetching] = useState(false);
  const [fetchedData, setFetchedData] = useState<any>(null);

  const authPopup = useRef<Window | null>(null);

  useEffect(() => {
    // On mount, check if we are already connected via a cookie
    if (document.cookie.includes('google_access_token')) {
      setIsConnected(true);
    }
    
    // Extract Google Project ID from Client ID for helpful links
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (clientId) {
      const parts = clientId.split('-');
      if (parts.length > 1) {
        setGoogleProjectId(parts[0]);
      }
    }

    // Set up BroadcastChannel to listen for auth success/error from the popup
    const channel = new BroadcastChannel('google-auth');
    const handleAuthMessage = (event: MessageEvent) => {
      if (authPopup.current) {
          authPopup.current.close();
      }
      if (event.data?.status === 'success') {
        setIsConnected(true);
        setConnectionError(null);
        toast({
          title: "Success!",
          description: "Successfully connected to Google Sheets.",
        });
      } else if (event.data?.status === 'error') {
         const error = event.data.error || 'An unknown error occurred during authentication.';
         setConnectionError(error);
         toast({
            variant: "destructive",
            title: "Connection Failed",
            description: error,
            duration: 10000,
        });
      }
    };
    
    channel.addEventListener('message', handleAuthMessage);

    // Clean up the listener and channel when the component unmounts
    return () => {
      channel.removeEventListener('message', handleAuthMessage);
      channel.close();
    };

  }, [toast]);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    
    const reader = new FileReader();
    reader.onload = async (e) => {
      const data = e.target?.result;
      if (typeof data === 'string') {
        const result = await uploadKpiDataAction({ fileData: data });
        if (result.error) {
          toast({
            variant: "destructive",
            title: "Upload Failed",
            description: result.error,
          });
        } else {
          toast({
            title: "Upload Successful",
            description: "Your KPI data has been processed and logged to the server console.",
          });
        }
      }
      setIsUploading(false);
    };
    reader.readAsDataURL(file);
    event.target.value = "";
  };
  
  const handleFetchData = async () => {
    if (!spreadsheetId || !dataRange) {
      alert("Please enter both Spreadsheet ID and Range");
      return;
    }

    setIsFetching(true);
    setFetchedData(null);
    
    const result = await getGoogleSheetDataAction({
      spreadsheetId,
      sheetName,
      dataRange,
    });
    
    setIsFetching(false);

    // result is already the parsed object, not a Response
    if (result.error) {
      toast({
        variant: "destructive",
        title: "Fetch Failed",
        description: (
          <div className="space-y-2">
            <p>{result.error}</p>
            {result.error.includes("API is not enabled") && googleProjectId && (
              <Button asChild variant="secondary" size="sm" className="mt-2">
                <a href={`https://console.cloud.google.com/apis/library/sheets.googleapis.com?project=${googleProjectId}`} target="_blank" rel="noopener noreferrer">
                  Enable Google Sheets API
                  <ExternalLink className="ml-2 h-4 w-4" />
                </a>
              </Button>
            )}
          </div>
        ),
        duration: 10000,
      });
    } else if (result.data) {
      console.log("Fetched data from action:", result.data);
      setFetchedData(result.data); // Store for debugging
      
      // Load data into global context - result.data is already the array
      const loadResult = loadKpiData(result.data);
      
      if (loadResult.success) {
        toast({
          title: "Success!",
          description: loadResult.message,
        });
      } else {
        toast({
          variant: "destructive",
          title: "Data Processing Failed",
          description: loadResult.message,
          duration: 10000,
        });
      }
    }
  };

  const handleConnect = () => {
    setConnectionError(null);
    const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (!googleClientId) {
      setConnectionError("Google Client ID is not configured. Please set the NEXT_PUBLIC_GOOGLE_CLIENT_ID environment variable.");
      return;
    }

    const redirectUri = `${window.location.origin}/api/auth/callback/google`;
    const scope = "https://www.googleapis.com/auth/spreadsheets.readonly";

    const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");
    url.searchParams.set("client_id", googleClientId);
    url.searchParams.set("redirect_uri", redirectUri);
    url.searchParams.set("response_type", "code");
    url.searchParams.set("scope", scope);
    url.searchParams.set("access_type", "offline");
    url.searchParams.set("prompt", "consent");
    
    authPopup.current = window.open(
      url.toString(),
      "google-oauth-popup",
      "width=500,height=600,resizable,scrollbars=yes,status=1"
    );
  };


  return (
    <div className="flex min-h-0 flex-1 flex-col">
       <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-sm md:px-6">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-semibold">Integrations</h1>
        </div>
      </header>
      <main className="flex-1 space-y-6 p-4 md:p-6">
        {connectionError && (
          <Alert variant="destructive">
            <AlertTitle>Connection Error</AlertTitle>
            <AlertDescription>
              <p>We couldn't connect to your Google account. This is usually due to a misconfiguration in your Google Cloud project.</p>
              <p className="mt-2 font-mono text-xs"><strong>Error from Google:</strong> {connectionError}</p>
               {connectionError.includes("access_denied") && googleProjectId && (
                <div className="mt-2 text-xs">
                  <p>This error can happen if your Google Cloud project is in "Testing" mode and your email has not been added as a test user.</p>
                   <Button asChild variant="secondary" size="sm" className="mt-2">
                    <a href={`https://console.cloud.google.com/apis/credentials/consent?project=${googleProjectId}`} target="_blank" rel="noopener noreferrer">
                      Add Test Users
                      <ExternalLink className="ml-2 h-4 w-4" />
                    </a>
                  </Button>
                </div>
              )}
              {connectionError.includes("redirect_uri_mismatch") && (
                <Button asChild variant="link" className="p-0 h-auto mt-2 text-sm">
                    <Link href="/dashboard/integrations/fix-google-connection">Click here for a step-by-step guide to fix this issue.</Link>
                </Button>
              )}
            </AlertDescription>
          </Alert>
        )}
        <Card>
          <CardHeader>
            <CardTitle>Manual Data Upload</CardTitle>
            <CardDescription>
              Use this option to update your dashboard by uploading an Excel or CSV file. Download the template to see the required format.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
             <div className="flex w-full max-w-sm flex-col space-y-2 sm:flex-row sm:items-center sm:space-x-2 sm:space-y-0">
                <label htmlFor="kpi-file-upload" className="w-full">
                    <Button asChild variant="outline" className="w-full cursor-pointer">
                    <div>
                        <UploadCloud className="mr-2" />
                        <span>{isUploading ? "Uploading..." : "Upload an Excel or CSV file"}</span>
                    </div>
                    </Button>
                    <Input
                    id="kpi-file-upload"
                    type="file"
                    accept=".xlsx, .xls, .csv"
                    onChange={handleFileChange}
                    disabled={isUploading}
                    className="sr-only"
                    />
                </label>
        <Button asChild variant="secondary" className="w-full sm:w-auto">
          <a href="/kpi_data_template.csv" download>
                        <Download className="mr-2" />
            <span>Download CSV Template</span>
                    </a>
                </Button>
            </div>
             <p className="mt-2 text-xs text-muted-foreground">
              Your file will be parsed to update your KPI dashboards. Currently, the data is logged to the server console for verification.
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Google Sheets Integration</CardTitle>
            <CardDescription>Connect your Google account to automatically import data from Google Sheets.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
              <div className="flex flex-col gap-4 rounded-lg border p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                        <div data-ai-hint="google sheets logo" className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="24px" height="24px"><path fill="#169154" d="M29,6H19c-1.7,0-3,1.3-3,3v30c0,1.7,1.3,3,3,3h10c1.7,0,3-1.3,3-3V9C32,7.3,30.7,6,29,6z"/><path fill="#00e575" d="M19,39h10c1.7,0,3-1.3,3-3V9c0-1.7-1.3-3-3-3h-2v36h-8V6h-2c-1.7,0-3,1.3-3,3v30C16,37.7,17.3,39,19,39z"/><path fill="#b0bec5" d="M21,6h6v3h-6z"/><path fill="#fff" d="M24.5,25h-5c-0.3,0-0.5-0.2-0.5-0.5v-5c0-0.3,0.2-0.5,0.5-0.5h5c0.3,0,0.5,0.2,0.5,0.5v5C25,24.8,24.8,25,24.5,25z M20,24h4v-4h-4V24z"/><path fill="#fff" d="M24.5,32h-5c-0.3,0-0.5-0.2-0.5-0.5v-5c0-0.3,0.2-0.5,0.5-0.5h5c0.3,0,0.5,0.2,0.5,0.5v5C25,31.8,24.8,32,24.5,32z M20,31h4v-4h-4V31z"/><path fill="#fff" d="M30,17H18v-3h12V17z"/></svg>
                        </div>
                        <div>
                            <p className="font-semibold">Google Sheets</p>
                            <p className="text-sm text-muted-foreground">{isConnected ? 'Connected' : 'Not Connected'}</p>
                        </div>
                    </div>
                    {!isConnected && (
                      <Button variant="outline" onClick={handleConnect}>Connect</Button>
                    )}
                  </div>
                  {isConnected && (
                    <div className="space-y-4 pt-4 border-t">
                      <p className="text-sm text-muted-foreground">
                        Enter the details of the Google Sheet you want to import data from.
                      </p>
                      <div className="space-y-2">
                        <Label htmlFor="spreadsheet-id">Spreadsheet ID</Label>
                        <Input id="spreadsheet-id" placeholder="e.g., 1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms" value={spreadsheetId} onChange={(e) => setSpreadsheetId(e.target.value)} />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="sheet-name">Sheet Name</Label>
                          <Input id="sheet-name" placeholder="e.g., Sheet1" value={sheetName} onChange={(e) => setSheetName(e.target.value)}/>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="data-range">Data Range</Label>
                          <Input id="data-range" placeholder="e.g., A1:K15" value={dataRange} onChange={(e) => setDataRange(e.target.value)}/>
                        </div>
                      </div>
                      <Button onClick={handleFetchData} disabled={isFetching || !spreadsheetId || !sheetName || !dataRange}>
                        {isFetching ? 'Fetching...' : 'Fetch Data'}
                      </Button>
                    </div>
                  )}
              </div>
          </CardContent>
        </Card>
        {fetchedData && <DebugDataViewer data={fetchedData} />}
      </main>
    </div>
  );
}

