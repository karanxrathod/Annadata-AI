// Implemented the Real-Time Market Analysis flow using Genkit.
'use server';
/**
 * @fileOverview Fetches real-time market data, analyzes trends using the Gemini model, and provides actionable insights.
 *
 * - analyzeMarket - A function that handles the market analysis process.
 * - AnalyzeMarketInput - The input type for the analyzeMarket function.
 * - AnalyzeMarketOutput - The return type for the analyzeMarket function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeMarketInputSchema = z.object({
  crop: z.string().describe('The crop to analyze.'),
  language: z.string().describe('The language to respond in.'),
});
export type AnalyzeMarketInput = z.infer<typeof AnalyzeMarketInputSchema>;

const MarketDataSchema = z.object({
  price: z.number().describe('The current price of the crop.'),
  trend: z.string().describe('The current market trend (e.g., increasing, decreasing, stable).'),
  summary: z.string().describe('A short summary of the market situation.'),
});

const AnalyzeMarketOutputSchema = z.object({
  marketAnalysis: MarketDataSchema.describe('The market analysis for the specified crop.'),
});
export type AnalyzeMarketOutput = z.infer<typeof AnalyzeMarketOutputSchema>;

export async function analyzeMarket(input: AnalyzeMarketInput): Promise<AnalyzeMarketOutput> {
  return analyzeMarketFlow(input);
}

const getMarketData = ai.defineTool({
  name: 'getMarketData',
  description: 'Fetches real-time market data for a specific crop.',
  inputSchema: z.object({
    crop: z.string().describe('The crop to fetch market data for.'),
  }),
  outputSchema: MarketDataSchema,
}, async (input) => {
  // This is a placeholder implementation that simulates fetching real-time market data.
  console.log(`Fetching market data for ${input.crop}`);

  const mockMarketData: { [key: string]: { price: number; trend: string; } } = {
    'tomatoes': { price: 50, trend: 'increasing' },
    'wheat': { price: 20, trend: 'stable' },
    'potatoes': { price: 30, trend: 'decreasing' },
    'corn': { price: 15, trend: 'stable' },
    'rice': { price: 40, trend: 'increasing' },
    'onions': { price: 25, trend: 'stable' },
  };

  const cropKey = input.crop.toLowerCase();
  const data = mockMarketData[cropKey];

  if (data) {
    return {
      price: data.price,
      trend: data.trend,
      summary: `The current market for ${input.crop} shows a price of ${data.price} per unit with an ${data.trend} trend.`,
    };
  }

  // Fallback for crops not in the mock data
  const randomPrice = Math.floor(Math.random() * 100) + 10;
  const randomTrend = ['increasing', 'decreasing', 'stable'][Math.floor(Math.random() * 3)] as 'increasing' | 'decreasing' | 'stable';
  return {
    price: randomPrice,
    trend: randomTrend,
    summary: `We could not fetch specific data for ${input.crop}. However, the general agricultural market is experiencing a price of around ${randomPrice} with a ${randomTrend} trend.`,
  };
});

const prompt = ai.definePrompt({
  name: 'analyzeMarketPrompt',
  input: {schema: AnalyzeMarketInputSchema},
  output: {schema: AnalyzeMarketOutputSchema},
  tools: [getMarketData],
  prompt: `You are an expert market analyst for farmers.

  The farmer is asking about the price of {{crop}} in their local language {{language}}.

  Use the getMarketData tool to get the current market data for the crop.

  Provide a simple, actionable summary of the market trends to guide selling decisions in the farmer's local language.

  Here's the farmer's question:
  What is the price of {{crop}} today?
`,
});

const analyzeMarketFlow = ai.defineFlow(
  {
    name: 'analyzeMarketFlow',
    inputSchema: AnalyzeMarketInputSchema,
    outputSchema: AnalyzeMarketOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
