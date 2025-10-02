'use server';

/**
 * @fileOverview An AI-powered carbon footprint calculator.
 *
 * - calculateCarbonFootprint - A function that calculates the weekly carbon footprint.
 * - CarbonFootprintCalculatorInput - The input type for the calculateCarbonFootprint function.
 * - CarbonFootprintCalculatorOutput - The return type for the calculateCarbonFootprint function.
 */

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
    const { transport, energy, diet, consumption } = input;
    
    // Simplified calculation logic based on the original prompt
    const transportEmission = (transport / 50) * 20;
    const energyEmission = (energy / 50) * 10;
    const dietEmission = (diet / 50) * 2.5;
    const consumptionEmission = (consumption / 50) * 5;
    
    const dailyTotal = transportEmission + energyEmission + dietEmission + consumptionEmission;
    const weeklyFootprint = dailyTotal * 7;

    const tips = [
        "Switching to LED light bulbs can significantly reduce your energy consumption.",
        "Consider meat-free days; reducing meat intake is one of the quickest ways to lower your diet-related footprint.",
        "Opt for public transport, cycling, or walking when possible to cut down on travel emissions.",
    ];

    return {
        weeklyFootprint: weeklyFootprint,
        tips: tips,
    };
}
