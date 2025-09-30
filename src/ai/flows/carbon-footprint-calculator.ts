'use server';

/**
 * @fileOverview An AI-powered carbon footprint calculator.
 *
 * - calculateCarbonFootprint - A function that calculates the weekly carbon footprint.
 * - CarbonFootprintCalculatorInput - The input type for the calculateCarbonFootprint function.
 * - CarbonFootprintCalculatorOutput - The return type for the calculateCarbonFootprint function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CarbonFootprintCalculatorInputSchema = z.object({
  transport: z.number().describe('A score from 0-100 representing daily commute & travel habits.'),
  energy: z.number().describe('A score from 0-100 representing home energy usage.'),
  diet: z.number().describe('A score from 0-100 representing dietary habits (e.g., meat consumption).'),
  consumption: z.number().describe('A score from 0-100 representing shopping & consumption habits.'),
});
export type CarbonFootprintCalculatorInput = z.infer<typeof CarbonFootprintCalculatorInputSchema>;

const CarbonFootprintCalculatorOutputSchema = z.object({
  weeklyFootprint: z
    .number()
    .describe('The estimated weekly carbon footprint in kg CO₂ equivalent.'),
  tips: z
    .array(z.string())
    .describe('An array of 2-3 personalized tips to reduce the carbon footprint.'),
});
export type CarbonFootprintCalculatorOutput = z.infer<typeof CarbonFootprintCalculatorOutputSchema>;


export async function calculateCarbonFootprint(
    input: CarbonFootprintCalculatorInput
): Promise<CarbonFootprintCalculatorOutput> {
    return carbonFootprintCalculatorFlow(input);
}


const prompt = ai.definePrompt({
    name: 'carbonFootprintPrompt',
    input: {schema: CarbonFootprintCalculatorInputSchema},
    output: {schema: CarbonFootprintCalculatorOutputSchema},
    prompt: `You are an expert environmental scientist. Your task is to estimate a user's weekly carbon footprint based on scores they provide for their lifestyle habits and give them personalized tips.

    The user provides scores from 0 to 100 for four categories:
    - Transport: 0 is rarely using vehicles, 100 is daily long commutes in a personal car.
    - Energy: 0 is minimal energy use (e.g., solar panels, energy-efficient appliances), 100 is high usage.
    - Diet: 0 is vegan, 50 is occasional meat, 100 is daily meat consumption.
    - Consumption: 0 is minimalist, 100 is a frequent shopper.

    Based on these scores, calculate an estimated weekly carbon footprint in kg of CO₂ equivalent. Use the following weights as a baseline for a score of 50/100 to represent an average person's DAILY emissions, then extrapolate to a weekly total.
    - Transport (daily): 0.4 kg CO2 per score point. (e.g., score 50 = 20kg/day)
    - Energy (daily): 0.2 kg CO2 per score point. (e.g., score 50 = 10kg/day)
    - Diet (daily): A score of 50 represents about 2.5 kg CO2/day. Scale accordingly.
    - Consumption (daily): 0.1 kg CO2 per score point. (e.g., score 50 = 5kg/day)

    User Input:
    - Transport Score: {{{transport}}}
    - Energy Score: {{{energy}}}
    - Diet Score: {{{diet}}}
    - Consumption Score: {{{consumption}}}

    First, calculate the daily total based on the scores and weights.
    Second, multiply the daily total by 7 to get the weekly footprint.

    Finally, provide 2-3 concise, actionable, and personalized tips for the user to reduce their footprint, focusing on their highest-scoring categories.

    Output the final weekly footprint and the tips in the specified JSON format.
    `,
});

const carbonFootprintCalculatorFlow = ai.defineFlow(
    {
        name: 'carbonFootprintCalculatorFlow',
        inputSchema: CarbonFootprintCalculatorInputSchema,
        outputSchema: CarbonFootprintCalculatorOutputSchema,
    },
    async (input) => {
        const {output} = await prompt(input);
        return output!;
    }
);
