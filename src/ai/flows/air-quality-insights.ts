
'use server';

/**
 * @fileOverview Generates an AI-powered insight comparing current and previous air quality.
 *
 * - getAirQualityInsight - A function that returns a textual insight based on AQI change.
 * - AirQualityInsightInput - The input type for the getAirQualityInsight function.
 * - AirQualityInsightOutput - The return type for the getAirQualityInsight function.
 */

import {z} from 'zod';

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
    // Handle edge cases
    if (input.previousAqi <= 0 || input.currentAqi <= 0) {
        return {
            insight: `Air quality data is being monitored for ${input.location}. Stay tuned for weekly insights!`
        };
    }

    const diff = input.currentAqi - input.previousAqi;
    const percentage = Math.abs(Math.round((diff / input.previousAqi) * 100));

    // Cap extreme percentages to avoid misleading information
    const cappedPercentage = Math.min(percentage, 1000); // Cap at 1000% to avoid ridiculous numbers

    let insight = `This week, the air quality in ${input.location} has remained stable. Keep up the great work!`;

    if (diff < 0) {
        const improvement = cappedPercentage > 100 ?
            `has improved significantly` :
            `has improved by ${cappedPercentage}%`;
        insight = `Great news! Air quality in ${input.location} ${improvement} this week.`;
    } else if (diff > 0) {
        if (cappedPercentage >= 100) {
            insight = `Air quality in ${input.location} has declined significantly this week. Small actions can make a big difference.`;
        } else {
            insight = `Air quality in ${input.location} has seen a ${cappedPercentage}% decline this week. Small actions can make a big difference.`;
        }
    }

    return { insight };
}
