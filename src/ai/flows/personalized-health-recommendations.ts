
'use server';

/**
 * @fileOverview An AI agent for generating personalized health recommendations based on air quality.
 *
 * - personalizedHealthRecommendations - A function that returns health advice.
 * - HealthRecsInput - The input type for the function.
 * - HealthRecsOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';

export const HealthRecsInputSchema = z.object({
  aqi: z.number().describe('The current Air Quality Index (AQI) value.'),
  age: z.number().optional().describe('The age of the user.'),
  healthConditions: z
    .array(z.string())
    .optional()
    .describe(
      'A list of pre-existing health conditions (e.g., "Asthma", "Heart Disease").'
    ),
});
export type HealthRecsInput = z.infer<typeof HealthRecsInputSchema>;

export const HealthRecsOutputSchema = z.object({
  overallRecommendation: z
    .string()
    .describe(
      'A primary, actionable recommendation based on the overall risk.'
    ),
  detailedAdvice: z
    .array(
      z.object({
        title: z.string().describe('The title for the piece of advice.'),
        description: z
          .string()
          .describe('A detailed paragraph explaining the advice.'),
      })
    )
    .describe('An array of 3 to 4 specific, detailed pieces of advice.'),
});
export type HealthRecsOutput = z.infer<typeof HealthRecsOutputSchema>;

export async function personalizedHealthRecommendations(
  input: HealthRecsInput
): Promise<HealthRecsOutput> {
  return recommendationsFlow(input);
}

const recommendationsFlow = ai.defineFlow(
  {
    name: 'personalizedHealthRecommendations',
    inputSchema: HealthRecsInputSchema,
    outputSchema: HealthRecsOutputSchema,
  },
  async (input) => {
    const prompt = `You are a public health expert specializing in environmental health. Your task is to provide clear, actionable health recommendations for a user in Pakistan based on the current Air Quality Index (AQI) and their personal health profile.

    **Context:**
    - Current AQI: ${input.aqi}
    - User Age: ${input.age || 'Not provided'}
    - Pre-existing Conditions: ${
      input.healthConditions?.join(', ') || 'None provided'
    }

    **Your Response MUST be in JSON format and adhere to the output schema.**

    **Analysis and Logic:**
    1.  **Determine AQI Category:**
        - 0-50: Good
        - 51-100: Moderate
        - 101-150: Unhealthy for Sensitive Groups
        - 151-200: Unhealthy
        - 201-300: Very Unhealthy
        - 301+: Hazardous

    2.  **Assess User Sensitivity:**
        - "Sensitive Groups" include children (under 12), elderly (over 65), and anyone with conditions like Asthma, COPD, Heart Disease.
        - If age or health conditions fall into this category, the user is 'sensitive'. Otherwise, they are 'general population'.

    3.  **Generate Recommendations:**
        - **overallRecommendation:** Create a single, primary piece of advice. This should be the most important action the user should take.
        - **detailedAdvice:** Provide 3-4 specific, detailed tips. Tailor the advice based on the AQI level and user sensitivity. For example, at "Unhealthy for Sensitive Groups", a sensitive user gets a strong warning, while the general population gets a milder one. At "Unhealthy", everyone should take precautions.

    **Example Tone:**
    - Be reassuring but clear about risks.
    - Focus on practical, actionable steps (e.g., "Wear a well-fitting N95 mask," "Use an air purifier with a HEPA filter," "Avoid strenuous outdoor activity").
    - For "Good" AQI, be encouraging (e.g., "It's a great day for outdoor activities!").

    Now, generate the response for the given user context.`;

    const llmResponse = await ai.generate({
      prompt: prompt,
      model: 'googleai/gemini-2.5-flash-preview',
      output: {
        format: 'json',
        schema: HealthRecsOutputSchema,
      },
    });

    const output = llmResponse.output();
    if (!output) {
      throw new Error('Failed to generate health recommendations.');
    }
    return output;
  }
);
