"use server";

import { suggestKpi as suggestKpiFlow, type SuggestKpiInput } from "@/ai/flows/suggest-kpi";
import { summarizeDepartmentKpis as summarizeKpisFlow, type SummarizeDepartmentKpisInput } from "@/ai/flows/summarize-department-kpis";
import { analyzeDepartmentPerformance as analyzePerformanceFlow, type AnalyzeDepartmentPerformanceInput } from "@/ai/flows/analyze-department-performance";
import { z } from "zod";
import * as XLSX from "xlsx";
import { cookies } from "next/headers";

const SuggestKpiActionSchema = z.object({
  role: z.string().min(2, { message: "Role must be at least 2 characters." }),
  industry: z.string().min(2, { message: "Industry must be at least 2 characters." }),
});

export async function suggestKpiAction(values: SuggestKpiInput) {
  const validatedValues = SuggestKpiActionSchema.safeParse(values);

  if (!validatedValues.success) {
    return { error: "Invalid input." };
  }

  try {
    const result = await suggestKpiFlow(validatedValues.data);
    return { data: result.suggestedKpis };
  } catch (error) {
    console.error("Error suggesting KPIs:", error);
    return { error: "Failed to generate KPI suggestions. Please try again." };
  }
}

export async function getDepartmentSummaryAction(values: SummarizeDepartmentKpisInput) {
    try {
        const result = await summarizeKpisFlow(values);
        return { data: result };
    } catch (error) {
        console.error("Error summarizing department KPIs:", error);
        return { error: "Failed to generate department summary. Please try again." };
    }
}

export async function analyzeDepartmentPerformanceAction(values: AnalyzeDepartmentPerformanceInput) {
    try {
        const result = await analyzePerformanceFlow(values);
        return { data: result };
    } catch (error) {
        console.error("Error analyzing department performance:", error);
        return { error: "Failed to generate performance analysis. Please try again." };
    }
}


const UploadKpiDataActionSchema = z.object({
  fileData: z.string(),
});

export async function uploadKpiDataAction(values: { fileData: string }) {
  const validatedValues = UploadKpiDataActionSchema.safeParse(values);

  if (!validatedValues.success) {
    return { error: "Invalid file data." };
  }

  try {
    const base64Data = validatedValues.data.fileData.split(',')[1];
    const buffer = Buffer.from(base64Data, 'base64');
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const json = XLSX.utils.sheet_to_json(worksheet);

    console.log("Parsed Excel data:", json);
    
    // In a real implementation, you would now process this JSON data
    // and update your database or application state.
    // For now, we are just logging it to the console.

    return { data: `Successfully parsed ${json.length} rows.` };
  } catch (error) {
    console.error("Error processing file:", error);
    return { error: "Failed to parse the uploaded file. Please ensure it is a valid Excel or CSV file." };
  }
}

const GoogleSheetDataActionSchema = z.object({
  spreadsheetId: z.string().min(1, 'Spreadsheet ID is required.'),
  sheetName: z.string().min(1, 'Sheet name is required.'),
  dataRange: z.string().min(1, 'Data range is required.'),
});

export async function getGoogleSheetDataAction(values: {
  spreadsheetId: string;
  sheetName: string;
  dataRange: string;
}) {
  const validatedValues = GoogleSheetDataActionSchema.safeParse(values);

  if (!validatedValues.success) {
    return { error: "Invalid input. All fields are required." };
  }

  const cookieStore = await cookies();
  const accessToken = cookieStore.get('google_access_token')?.value;

  if (!accessToken) {
    return { error: "Not authenticated. Please connect your Google account." };
  }

  // Normalize inputs
  const spreadsheetId = validatedValues.data.spreadsheetId.trim();
  const sheetName = validatedValues.data.sheetName.trim();
  const dataRange = validatedValues.data.dataRange.trim();

  // Build a safe A1 range. If the user already provided a full A1 notation including '!'
  // we respect it; otherwise, we compose '<sheet>!<range>' and quote the sheet name.
  const formatSheetName = (name: string) => {
    // If name contains spaces or special characters, wrap in single quotes and escape internal quotes
    const needsQuoting = /[^A-Za-z0-9_.]/.test(name);
    if (!needsQuoting) return name;
    const escaped = name.replace(/'/g, "''");
    return `'${escaped}'`;
  };

  const buildRange = (sheet: string, range: string) => {
    if (range.includes('!')) return range; // full A1 provided
    return `${formatSheetName(sheet)}!${range}`;
  };

  const initialRange = buildRange(sheetName, dataRange);

  try {
    // Try multiple candidate ranges for robustness
    const candidates: string[] = [];
    const quoted = formatSheetName(sheetName);
    if (dataRange.includes('!')) {
      candidates.push(dataRange);
    } else {
      candidates.push(`${quoted}!${dataRange}`);
      // If quoting changed the name, also try unquoted
      if (quoted !== sheetName) {
        candidates.push(`${sheetName}!${dataRange}`);
      } else {
        // Even if not needed, also try explicitly quoted as a fallback
        const escaped = sheetName.replace(/'/g, "''");
        candidates.push(`'${escaped}'!${dataRange}`);
      }
    }

    const tried: string[] = [];
    for (const candidate of candidates) {
      const encodedRange = encodeURIComponent(candidate);
      const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodedRange}`;
      const response = await fetch(url, { headers: { Authorization: `Bearer ${accessToken}` } });
      
      tried.push(candidate);
      
      if (response.ok) {
        const data = await response.json();
        console.log("=== Server-side fetch successful ===");
        console.log("Data keys:", Object.keys(data));
        console.log("Values:", data.values);
        
        // Return the values array directly
        return { data: data.values };
      }
      
      const data = await response.json();
      const msg: string | undefined = data?.error?.message;
      
      if (!(response.status === 400 && typeof msg === 'string' && msg.startsWith('Unable to parse range'))) {
        // Other errors (like 403) return immediately with details
        if (response.status === 403) {
          if (msg?.includes('Google Sheets API has not been used in project')) {
            return { error: 'Access Denied (403): The Google Sheets API is not enabled for your project. Please visit the Google Cloud Console to enable it.' };
          }
          return { error: "Access Denied (403): You do not have permission to access this Google Sheet. Please ensure the authenticated account has 'Viewer' access to the document and that the Google Sheets API is enabled in your GCP project." };
        }
        let error = msg || 'An unknown error occurred with the Google Sheets API.';
        return { error };
      }
    }

    // If we got here, all candidate ranges failed with parse errors. Fetch sheet metadata to help user.
    const metaUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}?fields=sheets(properties/title)`;
    const metaRes = await fetch(metaUrl, { headers: { Authorization: `Bearer ${accessToken}` } });
    let available: string[] = [];
    try {
      const meta = await metaRes.json();
      available = (meta?.sheets ?? []).map((s: any) => s?.properties?.title).filter(Boolean);
    } catch {}

    const help = [
      'Unable to parse the provided range. Please check:',
      "1) The Sheet Name exists in the spreadsheet.",
      "2) The Data Range uses A1 notation like A1:K50 (or provide the full 'Sheet!A1:K50').",
      "3) If the sheet name has spaces/special characters, it must be quoted like 'My Sheet'!A1:K50.",
      available.length ? `Available sheets detected: ${available.join(', ')}` : undefined,
      `Tried ranges: ${tried.join(' | ')}`,
    ].filter(Boolean).join(' ');

    return { error: help };
  } catch (error) {
    console.error("Error fetching Google Sheet data:", error);
    return { error: "Failed to fetch data from Google Sheets." };
  }
}
