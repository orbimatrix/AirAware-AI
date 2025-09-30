'use server';

/**
 * @fileOverview A hazard zone detection AI agent.
 *
 * - detectHazardZones - A function that handles the hazard zone detection process.
 * - DetectHazardZonesInput - The input type for the detectHazardZones function.
 * - DetectHazardZonesOutput - The return type for the detectHazardZones function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DetectHazardZonesInputSchema = z.object({
  location: z
    .string()
    .describe("The user's current location (e.g., 'Lahore, Pakistan')."),
  airQualityData: z
    .string()
    .describe(
      'Real-time air quality data including PM2.5, PM10, CO2, NO2, and O3 levels.'
    ),
  nearbyAreas: z
    .string()
    .describe('A list of nearby areas and their respective air quality data.'),
});
export type DetectHazardZonesInput = z.infer<typeof DetectHazardZonesInputSchema>;

const DetectHazardZonesOutputSchema = z.object({
  isHazardZone: z
    .boolean()
    .describe(
      'Whether the user is currently in a hazard zone based on air quality data.'
    ),
  recommendation: z
    .string()
    .describe(
      'A recommendation for the user, including an alternative area if the current location is a hazard zone.'
    ),
});
export type DetectHazardZonesOutput = z.infer<typeof DetectHazardZonesOutputSchema>;

export async function detectHazardZones(input: DetectHazardZonesInput): Promise<DetectHazardZonesOutput> {
  return detectHazardZonesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'detectHazardZonesPrompt',
  input: {schema: DetectHazardZonesInputSchema},
  output: {schema: DetectHazardZonesOutputSchema},
  prompt: `You are an AI assistant designed to identify hazard zones based on air quality data and provide recommendations.

  Determine if the user's current location is a hazard zone based on the provided air quality data. A hazard zone is defined as an area with air quality exceeding safe limits for PM2.5, PM10, CO2, NO2, and O3.

  If the current location is a hazard zone, recommend an alternative, less polluted area from the list of nearby areas. If the current location is not a hazard zone, inform the user that their current location is safe.

  Current Location: {{{location}}}
  Air Quality Data: {{{airQualityData}}}
  Nearby Areas: {{{nearbyAreas}}}

  Consider these factors when determining if an area is a hazard zone:
  - PM2.5 levels above 50 μg/m³
  - PM10 levels above 100 μg/m³
  - CO2 levels above 1000 ppm
  - NO2 levels above 40 ppb
  - O3 levels above 70 ppb

  Output the results in JSON format.
  `,
});

const detectHazardZonesFlow = ai.defineFlow(
  {
    name: 'detectHazardZonesFlow',
    inputSchema: DetectHazardZonesInputSchema,
    outputSchema: DetectHazardZonesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
