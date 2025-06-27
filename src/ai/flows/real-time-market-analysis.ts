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
  location: z.string().describe('The market location (mandi) to check.'),
  language: z.string().describe('The language to respond in.'),
});
export type AnalyzeMarketInput = z.infer<typeof AnalyzeMarketInputSchema>;

const AnalyzeMarketOutputSchema = z.object({
  marketAnalysis: z.object({
    price: z.number().describe('The current price of the crop.'),
    priceChange: z.number().describe('The price change in the last 24 hours.'),
    trend: z.string().describe('The current market trend (e.g., increasing, decreasing, stable).'),
    unit: z.string().describe("The unit of measurement."),
    location: z.string().describe("The market location."),
    summary: z.string().describe('A short, actionable summary of the market situation and selling advice in the specified language.'),
  }),
});
export type AnalyzeMarketOutput = z.infer<typeof AnalyzeMarketOutputSchema>;

export async function analyzeMarket(input: AnalyzeMarketInput): Promise<AnalyzeMarketOutput> {
  return analyzeMarketFlow(input);
}

const MarketDataToolSchema = z.object({
    price: z.number().describe('The current price of the crop.'),
    priceChange: z.number().describe('The change in price in the last 24 hours.'),
    trend: z.string().describe('The current market trend (e.g., increasing, decreasing, stable).'),
    unit: z.string().describe("The unit of measurement for the price (e.g., 'quintal', 'kg')."),
    location: z.string().describe('The market location (mandi).')
});


const getMarketData = ai.defineTool({
  name: 'getMarketData',
  description: 'Fetches real-time market data for a specific crop and location. This is the only way to get market data.',
  inputSchema: z.object({
    crop: z.string().describe('The crop to fetch market data for.'),
    location: z.string().describe('The location (mandi) to fetch market data for.'),
  }),
  outputSchema: MarketDataToolSchema,
}, async (input) => {
  console.log(`Fetching market data for ${input.crop} in ${input.location}`);
  
  // This is where you would replace the mock data with a real API call to your backend (e.g., a Firebase Function).
  // For now, we'll use more realistic mock data.
  const mockMarketData: { [key: string]: { price: number; priceChange: number; trend: string; unit: string; location: string;} } = {
    'tomatoes-nashik': { price: 2500, priceChange: 150, trend: 'increasing', unit: 'quintal', location: 'Nashik Mandi' },
    'wheat-delhi': { price: 2200, priceChange: -50, trend: 'decreasing', unit: 'quintal', location: 'Delhi APMC' },
    'soybean-nashik': { price: 4820, priceChange: 50, trend: 'increasing', unit: 'quintal', location: 'Nashik Mandi' },
    'potatoes-pune': { price: 1800, priceChange: 0, trend: 'stable', unit: 'quintal', location: 'Pune Market Yard' },
    'onions-lasalgaon': { price: 1500, priceChange: 200, trend: 'increasing', unit: 'quintal', location: 'Lasalgaon APMC' },
  };
  
  const cropKey = `${input.crop.toLowerCase()}-${input.location.toLowerCase().split(' ')[0]}`;
  const data = mockMarketData[cropKey];

  if (data) {
    return data;
  }

  // Fallback for combinations not in the mock data
  console.log(`No mock data for key: ${cropKey}. Using random data.`);
  const randomPrice = Math.floor(Math.random() * 5000) + 1000;
  const randomPriceChange = Math.floor(Math.random() * 200) - 100;
  const randomTrend = randomPriceChange > 0 ? 'increasing' : randomPriceChange < 0 ? 'decreasing' : 'stable';
  return {
    price: randomPrice,
    priceChange: randomPriceChange,
    trend: randomTrend,
    unit: 'quintal',
    location: `${input.location} Mandi`,
  };
});

const prompt = ai.definePrompt({
  name: 'analyzeMarketPrompt',
  input: {schema: AnalyzeMarketInputSchema},
  output: {schema: AnalyzeMarketOutputSchema},
  tools: [getMarketData],
  prompt: `You are a helpful agricultural market analysis agent for farmers in India. Your goal is to provide clear, simple, and actionable advice.

  A farmer is asking about the price of {{crop}} in {{location}}. Their preferred language for the response is {{language}}.

  1. First, you MUST use the getMarketData tool to get the current market data for the specified crop and location. Do not make up data.
  2. The prices provided by the tool are in Indian Rupees (INR).
  3. Analyze the data you receive from the tool (price, priceChange, trend, unit, location).
  4. Based on your analysis, generate a simple, actionable summary to guide the farmer's selling decisions. This summary MUST be in the farmer's specified language ({{language}}). The summary should mention the price and location and give helpful advice. For example, if the trend is 'increasing', you might advise them to wait a bit before selling. If it's decreasing, you might suggest they sell soon if the price is still good.
  5. Finally, populate all the fields in the output schema with the data from the tool and the summary you generated.
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
    if (!output) {
      throw new Error('The AI failed to generate a valid market analysis.');
    }
    return output;
  }
);
