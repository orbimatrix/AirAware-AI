'use server';
/**
 * @fileOverview This file defines a Genkit flow for providing personalized health recommendations based on air quality index (AQI) and user health profile.
 *
 * - personalizedHealthRecommendations - A function that takes AQI data and user health profile as input and returns personalized health recommendations.
 * - PersonalizedHealthRecommendationsInput - The input type for the personalizedHealthRecommendations function.
 * - PersonalizedHealthRecommendationsOutput - The return type for the personalizedHealthRecommendations function.
 */

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
  
  const { aqi, healthProfile } = input;
  let recommendation = "Air quality is good. It's a great day for outdoor activities!";
  let shouldAlert = false;

  if (aqi > 150) {
    if (healthProfile.respiratoryIssues || healthProfile.age > 60 || healthProfile.age < 5) {
      recommendation = "Air quality is unhealthy. Given your health profile, it's strongly advised to stay indoors, use an air purifier if possible, and wear a mask if you must go out.";
      shouldAlert = true;
    } else {
      recommendation = "Air quality is unhealthy. Limit prolonged outdoor exertion and consider wearing a mask if you're outside for a long time.";
      shouldAlert = true;
    }
  } else if (aqi > 100) {
    if (healthProfile.respiratoryIssues) {
      recommendation = "Air quality is unhealthy for sensitive groups. You might want to reduce outdoor activities today.";
      shouldAlert = true;
    } else {
      recommendation = "Air quality is moderate. It's generally okay for outdoor activities, but sensitive individuals should be cautious.";
      shouldAlert = false;
    }
  }

  return { recommendation, shouldAlert };
}
