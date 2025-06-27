// src/ai/flows/navigate-government-schemes.ts
'use server';

/**
 * @fileOverview Explains government agricultural schemes based on user needs, providing eligibility details and application links.
 *
 * - navigateGovernmentSchemes - A function that handles the process of explaining government schemes.
 * - NavigateGovernmentSchemesInput - The input type for the navigateGovernmentSchemes function.
 * - NavigateGovernmentSchemesOutput - The return type for the navigateGovernmentSchemes function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const NavigateGovernmentSchemesInputSchema = z.object({
  userNeed: z.string().describe('The specific need of the user, e.g., subsidies for drip irrigation.'),
});
export type NavigateGovernmentSchemesInput = z.infer<typeof NavigateGovernmentSchemesInputSchema>;

const NavigateGovernmentSchemesOutputSchema = z.object({
  schemeName: z.string().describe('The name of the relevant government scheme.'),
  explanation: z.string().describe('A clear explanation of the scheme.'),
  eligibility: z.string().describe('The eligibility requirements for the scheme.'),
  applicationLink: z.string().describe('A direct link to the application portal for the scheme.'),
});
export type NavigateGovernmentSchemesOutput = z.infer<typeof NavigateGovernmentSchemesOutputSchema>;

export async function navigateGovernmentSchemes(
  input: NavigateGovernmentSchemesInput
): Promise<NavigateGovernmentSchemesOutput> {
  return navigateGovernmentSchemesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'navigateGovernmentSchemesPrompt',
  input: {schema: NavigateGovernmentSchemesInputSchema},
  output: {schema: NavigateGovernmentSchemesOutputSchema},
  prompt: `You are an AI assistant that helps farmers navigate government schemes.

  A farmer has the following need: {{{userNeed}}}

  Explain a relevant government scheme in simple terms, list eligibility requirements, and provide a direct link to the application portal.
  Make sure to fill out all the fields in the output schema.
  Make sure to find a relevant scheme and application portal.
  Even if you don't find a relevant government scheme, you must fill out all the fields in the output schema, and explain why you couldn't find the scheme.
  `,
});

const navigateGovernmentSchemesFlow = ai.defineFlow(
  {
    name: 'navigateGovernmentSchemesFlow',
    inputSchema: NavigateGovernmentSchemesInputSchema,
    outputSchema: NavigateGovernmentSchemesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
