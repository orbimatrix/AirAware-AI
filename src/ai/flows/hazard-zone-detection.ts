'use server';

/**
 * @fileOverview A hazard zone detection AI agent.
 *
 * - detectHazardZones - A function that handles the hazard zone detection process.
 * - DetectHazardZonesInput - The input type for the detectHazardZones function.
 * - DetectHazardZonesOutput - The return type for the detectHazardZones function.
 */

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
  const isHazard = true; // Mock response
  const recommendation = isHazard
    ? "Your current area has high pollution levels. Consider moving to Gulberg, which has better air quality right now."
    : "Your current location has safe air quality. Enjoy your activities!";

  return {
    isHazardZone: isHazard,
    recommendation: recommendation,
  };
}
