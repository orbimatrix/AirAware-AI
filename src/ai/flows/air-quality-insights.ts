'use server';

/**
 * @fileOverview Generates an AI-powered insight comparing current and previous air quality.
 *
 * - getAirQualityInsight - A function that returns a textual insight based on AQI change.
 * - AirQualityInsightInput - The input type for the getAirQualityInsight function.
 * - AirQualityInsightOutput - The return type for the getAirQualityInsight function.
 */

import {ai} from '@/ai/genkit';
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
    return airQualityInsightFlow(input);
}


const prompt = ai.definePrompt({
    name: 'airQualityInsightPrompt',
    input: {schema: AirQualityInsightInputSchema},
    output: {schema: AirQualityInsightOutputSchema},
    prompt: `You are an environmental analyst AI. Your task is to provide a single, clear, and encouraging sentence that summarizes the change in air quality for a city over the past week.

    Current AQI for {{{location}}}: {{{currentAqi}}}
    Previous week's AQI for {{{location}}}: {{{previousAqi}}}

    - Calculate the percentage change: ((currentAqi - previousAqi) / previousAqi) * 100.
    - If AQI has decreased, it's an improvement. Frame it positively (e.g., "Air quality improved by X%...").
    - If AQI has increased, it's a decline. Frame it as a gentle call to action (e.g., "Air quality has declined by X%... Let's work together...").
    - If AQI is unchanged, state that it's stable.
    - Keep the insight to one sentence. Be positive and motivational where possible.

    Examples:
    - "Great news! Air quality in {{{location}}} has improved by over 15% this week."
    - "Air quality in {{{location}}} has seen a 10% decline this week. Small actions can make a big difference."
    - "This week, the air quality in {{{location}}} has remained stable. Keep up the great work!"

    Generate the insight based on the provided data.
    `,
});

const airQualityInsightFlow = ai.defineFlow(
    {
        name: 'airQualityInsightFlow',
        inputSchema: AirQualityInsightInputSchema,
        outputSchema: AirQualityInsightOutputSchema,
    },
    async (input) => {
        const {output} = await prompt(input);
        return output!;
    }
);
