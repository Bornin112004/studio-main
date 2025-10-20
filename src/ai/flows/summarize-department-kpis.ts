'use server';

/**
 * @fileOverview AI flow for summarizing department KPI performance.
 *
 * - summarizeDepartmentKpis - A function that generates a summary of strengths and weaknesses.
 * - SummarizeDepartmentKpisInput - The input type for the function.
 * - SummarizeDepartmentKpisOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import type { Kpi } from '@/lib/types';

const KpiSchema = z.object({
  id: z.string(),
  title: z.string(),
  value: z.string(),
  change: z.string(),
  changeType: z.enum(['increase', 'decrease']),
  status: z.enum(['on-track', 'at-risk', 'off-track']),
  description: z.string(),
  icon: z.string(),
  chartType: z.enum(['line', 'bar']),
  roles: z.array(z.string()).optional(),
});

const SummarizeDepartmentKpisInputSchema = z.object({
  departmentName: z.string().describe('The name of the department (e.g., Marketing, Engineering).'),
  kpis: z.array(KpiSchema).describe('The list of Key Performance Indicators for the department.'),
});
export type SummarizeDepartmentKpisInput = z.infer<typeof SummarizeDepartmentKpisInputSchema>;

const SummarizeDepartmentKpisOutputSchema = z.object({
  strengths: z.string().describe('A paragraph summarizing the key strengths based on the provided KPIs.'),
  weaknesses: z.string().describe('A paragraph summarizing the key weaknesses or areas for improvement based on the provided KPIs.'),
});
export type SummarizeDepartmentKpisOutput = z.infer<typeof SummarizeDepartmentKpisOutputSchema>;


export async function summarizeDepartmentKpis(input: SummarizeDepartmentKpisInput): Promise<SummarizeDepartmentKpisOutput> {
  return summarizeDepartmentKpisFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeDepartmentKpisPrompt',
  input: { schema: SummarizeDepartmentKpisInputSchema },
  output: { schema: SummarizeDepartmentKpisOutputSchema },
  prompt: `You are an expert business analyst. You will be given a department name and a list of its Key Performance Indicators (KPIs) in JSON format.

Your task is to analyze these KPIs and provide a concise summary of the department's performance, highlighting its main strengths and weaknesses.

- For strengths, look for KPIs that are "on-track" with positive trends.
- For weaknesses, look for KPIs that are "at-risk" or "off-track".

Keep the summary brief and to the point.

Department: {{{departmentName}}}

KPIs:
{{{json kpis}}}
`,
});


const summarizeDepartmentKpisFlow = ai.defineFlow(
  {
    name: 'summarizeDepartmentKpisFlow',
    inputSchema: SummarizeDepartmentKpisInputSchema,
    outputSchema: SummarizeDepartmentKpisOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
