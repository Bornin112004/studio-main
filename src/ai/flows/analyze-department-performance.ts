'use server';

/**
 * @fileOverview AI flow for analyzing department KPI performance and suggesting improvements.
 *
 * - analyzeDepartmentPerformance - A function that generates root cause analysis and suggestions.
 * - AnalyzeDepartmentPerformanceInput - The input type for the function.
 * - AnalyzeDepartmentPerformanceOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

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

const AnalyzeDepartmentPerformanceInputSchema = z.object({
  departmentName: z.string().describe('The name of the department (e.g., Marketing, Engineering).'),
  kpis: z.array(KpiSchema).describe('The list of Key Performance Indicators for the department.'),
});
export type AnalyzeDepartmentPerformanceInput = z.infer<typeof AnalyzeDepartmentPerformanceInputSchema>;

const AnalysisResultSchema = z.object({
    kpiTitle: z.string().describe('The title of the underperforming KPI.'),
    rootCause: z.string().describe('A likely root cause for the underperformance.'),
    suggestions: z.array(z.string()).describe('A list of 2-3 actionable suggestions for improvement.'),
});

const AnalyzeDepartmentPerformanceOutputSchema = z.object({
  analysis: z.array(AnalysisResultSchema).describe('An array of analyses for each underperforming KPI.'),
});
export type AnalyzeDepartmentPerformanceOutput = z.infer<typeof AnalyzeDepartmentPerformanceOutputSchema>;


export async function analyzeDepartmentPerformance(input: AnalyzeDepartmentPerformanceInput): Promise<AnalyzeDepartmentPerformanceOutput> {
  return analyzeDepartmentPerformanceFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeDepartmentPerformancePrompt',
  input: { schema: AnalyzeDepartmentPerformanceInputSchema },
  output: { schema: AnalyzeDepartmentPerformanceOutputSchema },
  prompt: `You are a world-class business consultant specializing in performance management. You will be given a department name and a list of its Key Performance Indicators (KPIs) in JSON format.

Your task is to identify all KPIs that are "at-risk" or "off-track". For each of these underperforming KPIs, provide a concise analysis including:
1.  A likely potential root cause for the poor performance.
2.  A list of 2-3 concrete and actionable suggestions for how the team can improve the metric.

If all KPIs are "on-track", return an empty array for the analysis.

Focus only on the KPIs that are not "on-track".

Department: {{{departmentName}}}

KPIs:
{{{json kpis}}}
`,
});


const analyzeDepartmentPerformanceFlow = ai.defineFlow(
  {
    name: 'analyzeDepartmentPerformanceFlow',
    inputSchema: AnalyzeDepartmentPerformanceInputSchema,
    outputSchema: AnalyzeDepartmentPerformanceOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
