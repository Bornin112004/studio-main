'use server';

/**
 * @fileOverview AI-driven KPI suggestion flow.
 *
 * - suggestKpi - A function that suggests KPIs based on role and industry.
 * - SuggestKpiInput - The input type for the suggestKpi function.
 * - SuggestKpiOutput - The return type for the suggestKpi function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestKpiInputSchema = z.object({
  role: z.string().describe('The role of the user (e.g., CEO, Manager, Employee).'),
  industry: z.string().describe('The industry of the user (e.g., Technology, Finance, Healthcare).'),
});
export type SuggestKpiInput = z.infer<typeof SuggestKpiInputSchema>;

const SuggestKpiOutputSchema = z.object({
  suggestedKpis: z.array(
    z.string().describe('A list of suggested KPIs relevant to the user.')
  ).describe('Suggested KPIs for the user based on their role and industry.'),
});
export type SuggestKpiOutput = z.infer<typeof SuggestKpiOutputSchema>;

export async function suggestKpi(input: SuggestKpiInput): Promise<SuggestKpiOutput> {
  return suggestKpiFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestKpiPrompt',
  input: {schema: SuggestKpiInputSchema},
  output: {schema: SuggestKpiOutputSchema},
  prompt: `You are an expert in Key Performance Indicators (KPIs). Given the role and industry of a user, you will suggest a list of relevant KPIs.

Role: {{{role}}}
Industry: {{{industry}}}

Suggest 5 relevant KPIs.`,
});

const suggestKpiFlow = ai.defineFlow(
  {
    name: 'suggestKpiFlow',
    inputSchema: SuggestKpiInputSchema,
    outputSchema: SuggestKpiOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
