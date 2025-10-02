'use server';

/**
 * @fileOverview Generates an AI-powered insight comparing current and previous air quality.
 *
 * - getAirQualityInsight - A function that returns a textual insight based on AQI change.
 * - AirQualityInsightInput - The input type for the getAirQualityInsight function.
 * - AirQualityInsightOutput - The return type for the getAirQualityInsight function.
 */

import {z} from 'genkit';

const AirQualityInsightInputSchema = z.object({
  location: z.string().describe('The city for which the insight is being generated.'),
  currentAqi: z.number().describe('The current Air Quality Index (AQI) value.'),
  previousAqi: z.number().describe('The AQI value from the previous week.'),
});
export type AirQualityInsightInput = z.infer<typeof AirQualityInsightInputSchema>;

const AirQualityInsightOutputSchema = z.object({
    insight: z.string().describe("A single, concise sentence summarizing the air quality change. It should be encouraging and easy to understand for a general audience."),
});
export type AirQualityInsightOutput = z.infer<typeof AirQualityInsightOutputSchema>;


export async function getAirQualityInsight(
    input: AirQualityInsightInput
): Promise<AirQualityInsightOutput> {
    const diff = input.currentAqi - input.previousAqi;
    const percentage = Math.abs(Math.round((diff / input.previousAqi) * 100));

    let insight = `This week, the air quality in ${input.location} has remained stable. Keep up the great work!`;

    if (diff < 0) {
        insight = `Great news! Air quality in ${input.location} has improved by over ${percentage}% this week.`;
    } else if (diff > 0) {
        insight = `Air quality in ${input.location} has seen a ${percentage}% decline this week. Small actions can make a big difference.`;
    }

    return { insight };
}
