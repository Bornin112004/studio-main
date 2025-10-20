import { cookies } from "next/headers";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const spreadsheetId = searchParams.get("spreadsheetId");
    const range = searchParams.get("range");

    if (!spreadsheetId || !range) {
      return Response.json(
        { error: "Missing spreadsheetId or range" },
        { status: 400 }
      );
    }

    const cookieStore = await cookies();
    const accessToken = cookieStore.get('google_access_token')?.value;

    if (!accessToken) {
      return Response.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    const response = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Google Sheets API error:", errorText);
      return Response.json(
        { error: "Failed to fetch from Google Sheets", details: errorText },
        { status: response.status }
      );
    }

    const data = await response.json();

    console.log("=== Google Sheets API Response ===");
    console.log("Response keys:", Object.keys(data));
    console.log("Has values:", !!data.values);
    console.log("Values is array:", Array.isArray(data.values));

    // Ensure the response has the correct structure
    if (!data.values || !Array.isArray(data.values)) {
      return Response.json(
        { 
          error: "Invalid response from Google Sheets", 
          values: [] 
        },
        { status: 500 }
      );
    }

    // Return the data with values array
    return Response.json({
      values: data.values,
      range: data.range,
      majorDimension: data.majorDimension
    });

  } catch (error) {
    console.error("Error in google-sheets API:", error);
    return Response.json(
      { error: "Internal server error", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
