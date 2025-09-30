'use server';
/**
 * @fileOverview This file defines a Genkit flow for providing personalized health recommendations based on air quality index (AQI) and user health profile.
 *
 * - personalizedHealthRecommendations - A function that takes AQI data and user health profile as input and returns personalized health recommendations.
 * - PersonalizedHealthRecommendationsInput - The input type for the personalizedHealthRecommendations function.
 * - PersonalizedHealthRecommendationsOutput - The return type for the personalizedHealthRecommendations function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PersonalizedHealthRecommendationsInputSchema = z.object({
  aqi: z.number().describe('The current Air Quality Index (AQI) value.'),
  healthProfile: z
    .object({
      respiratoryIssues: z
        .boolean()
        .describe('Whether the user has respiratory issues or not.'),
      age: z.number().describe('The age of the user.'),
      otherConditions: z.string().optional().describe('Any other relevant health conditions of the user.'),
    })
    .describe('The health profile of the user.'),
  location: z.string().describe('The current location of the user.'),
});
export type PersonalizedHealthRecommendationsInput = z.infer<
  typeof PersonalizedHealthRecommendationsInputSchema
>;

const PersonalizedHealthRecommendationsOutputSchema = z.object({
  recommendation: z.string().describe('Personalized health recommendation based on AQI and health profile.'),
  shouldAlert: z.boolean().describe('Whether the user should be alerted based on the environment conditions.'),
});
export type PersonalizedHealthRecommendationsOutput = z.infer<
  typeof PersonalizedHealthRecommendationsOutputSchema
>;

export async function personalizedHealthRecommendations(
  input: PersonalizedHealthRecommendationsInput
): Promise<PersonalizedHealthRecommendationsOutput> {
  return personalizedHealthRecommendationsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'personalizedHealthRecommendationsPrompt',
  input: {schema: PersonalizedHealthRecommendationsInputSchema},
  output: {schema: PersonalizedHealthRecommendationsOutputSchema},
  prompt: `You are an AI assistant designed to provide personalized health recommendations based on the current Air Quality Index (AQI), the user's health profile and their location. 

  AQI: {{{aqi}}}
  Location: {{{location}}}
  Health Profile: Respiratory Issues: {{{healthProfile.respiratoryIssues}}}, Age: {{{healthProfile.age}}}, Other Conditions: {{{healthProfile.otherConditions}}}

  Based on the AQI, location and the user's health profile, provide a concise and actionable health recommendation. Also, based on these conditions, determine if the user should be alerted.

  Example Recommendations:
  - If the AQI is high and the user has respiratory issues, recommend limiting outdoor activities and wearing a mask.
  - If the AQI is moderate and the user is healthy, recommend enjoying outdoor activities with caution.
  - If the AQI is low, recommend enjoying outdoor activities.
  - For children and the elderly, always err on the side of caution.
`,
});

const personalizedHealthRecommendationsFlow = ai.defineFlow(
  {
    name: 'personalizedHealthRecommendationsFlow',
    inputSchema: PersonalizedHealthRecommendationsInputSchema,
    outputSchema: PersonalizedHealthRecommendationsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
