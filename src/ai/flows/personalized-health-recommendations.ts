'use server';
/**
 * @fileOverview This file defines a Genkit flow for providing personalized health recommendations based on air quality index (AQI) and user health profile.
 *
 * - personalizedHealthRecommendations - A function that takes AQI data and user health profile as input and returns personalized health recommendations.
 * - PersonalizedHealthRecommendationsInput - The input type for the personalizedHealthRecommendations function.
 * - PersonalizedHealthRecommendationsOutput - The return type for the personalizedHealthRecommendations function.
 */

import {z} from 'genkit';
import {ai} from '@/ai/genkit';

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
  recommendation: z.string().describe('Personalized health recommendation based on AQI and health profile. The recommendation should be concise, empathetic, and actionable.'),
  shouldAlert: z.boolean().describe('Whether the user should be alerted based on the environment conditions.'),
});
export type PersonalizedHealthRecommendationsOutput = z.infer<
  typeof PersonalizedHealthRecommendationsOutputSchema
>;

const healthPrompt = ai.definePrompt(
    {
        name: 'healthRecommendationPrompt',
        input: { schema: PersonalizedHealthRecommendationsInputSchema },
        output: { schema: PersonalizedHealthRecommendationsOutputSchema },
        prompt: `You are an empathetic health AI assistant for the Saaf Hawa app, focused on the Pakistani community. 
        Your goal is to provide a clear, concise, and actionable health recommendation based on the user's location, current air quality (AQI), and their health profile.
        
        Current Conditions:
        - Location: {{{location}}}
        - Air Quality Index (AQI): {{{aqi}}}
        
        User's Health Profile:
        - Age: {{{healthProfile.age}}}
        - Has Respiratory Issues (e.g., Asthma): {{{healthProfile.respiratoryIssues}}}
        - Other Conditions: {{{healthProfile.otherConditions}}}

        Task:
        1.  Analyze the AQI and the user's health profile.
        2.  Determine if the situation warrants a special alert (set 'shouldAlert' to true if the AQI is over 100 and the user is in a sensitive group, or if the AQI is over 150 for anyone).
        3.  Generate a single, empathetic, and highly actionable recommendation. Frame it as advice. Use simple language.
        
        AQI Guide:
        - 0-50 (Good): No risk.
        - 51-100 (Moderate): Minor risk for very sensitive people.
        - 101-150 (Unhealthy for Sensitive Groups): Significant risk for people with respiratory issues, children, and the elderly.
        - 151-200 (Unhealthy): General public will experience health effects.
        - 201+ (Very Unhealthy/Hazardous): Serious risk for everyone.
        
        Example Output (for a sensitive user with high AQI):
        {
            "recommendation": "The air quality in Lahore is currently unhealthy. Given your asthma, it would be best to stay indoors today and keep windows closed. If you need to go out, please wear a mask.",
            "shouldAlert": true
        }`,
    }
);


export async function personalizedHealthRecommendations(
  input: PersonalizedHealthRecommendationsInput
): Promise<PersonalizedHealthRecommendationsOutput> {
    const {output} = await healthPrompt(input);
    return output!;
}
