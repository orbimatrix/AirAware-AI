
'use server';

/**
 * @fileOverview An AI agent for generating personalized health recommendations based on air quality.
 *
 * - personalizedHealthRecommendations - A function that returns health advice.
 * - HealthRecsInput - The input type for the function.
 * - HealthRecsOutput - The return type for the function.
 */

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


function getAqiCategory(aqi: number) {
    if (aqi <= 50) return 'Good';
    if (aqi <= 100) return 'Moderate';
    if (aqi <= 150) return 'Unhealthy for Sensitive Groups';
    if (aqi <= 200) return 'Unhealthy';
    if (aqi <= 300) return 'Very Unhealthy';
    return 'Hazardous';
}

function isSensitive(input: HealthRecsInput): boolean {
    if (input.age && (input.age < 12 || input.age > 65)) {
        return true;
    }
    if (input.healthConditions && input.healthConditions.length > 0) {
        return true;
    }
    return false;
}

export async function personalizedHealthRecommendations(
  input: HealthRecsInput
): Promise<HealthRecsOutput> {

  const aqiCategory = getAqiCategory(input.aqi);
  const userIsSensitive = isSensitive(input);

  let overallRecommendation = "";
  const detailedAdvice : {title: string, description: string}[] = [];

  switch (aqiCategory) {
    case 'Good':
      overallRecommendation = "It's a great day for outdoor activities! The air quality is excellent.";
      detailedAdvice.push(
          { title: "Enjoy the Fresh Air", description: "Take the opportunity to go for a walk, run, or have a picnic outside." },
          { title: "Ventilate Your Home", description: "Open your windows to let in fresh, clean air and improve indoor air quality." }
      );
      break;
    case 'Moderate':
      overallRecommendation = "Air quality is acceptable. Unusually sensitive individuals should consider reducing prolonged or heavy exertion outdoors.";
       detailedAdvice.push(
          { title: "Monitor Symptoms", description: "If you're in a sensitive group, pay attention to any symptoms like coughing or shortness of breath." },
          { title: "General Population", description: "For most people, it's still a good day to be active outside." }
      );
      break;
    case 'Unhealthy for Sensitive Groups':
        if(userIsSensitive) {
            overallRecommendation = "Air quality is unhealthy for you. Limit prolonged outdoor exertion and stay indoors if possible.";
            detailedAdvice.push(
                { title: "Wear a Mask", description: "If you must go outside, wear a well-fitting N95 or KN95 mask to filter pollutants." },
                { title: "Use Air Purifiers", description: "Run an air purifier with a HEPA filter at home to keep indoor air clean." }
            );
        } else {
            overallRecommendation = "Air quality is generally acceptable, but keep an eye on it if you're feeling sensitive today.";
            detailedAdvice.push(
                { title: "Consider Shorter Outings", description: "You're likely fine, but consider reducing the intensity of long outdoor workouts." }
            );
        }
      break;
    case 'Unhealthy':
      overallRecommendation = "Everyone should reduce heavy outdoor exertion. It's recommended to limit time spent outdoors.";
       detailedAdvice.push(
          { title: "Avoid Strenuous Activities", description: "Postpone activities like running, cycling, or other intense sports outdoors." },
          { title: "Keep Indoor Air Clean", description: "Close windows to avoid bringing outdoor pollution inside. Use air purifiers if available." },
          { title: "Sensitive Groups Beware", description: "Children, the elderly, and people with heart or lung disease should avoid all outdoor physical activity." }
      );
      break;
    case 'Very Unhealthy':
      overallRecommendation = "This is a serious health alert. Everyone should avoid all outdoor exertion.";
      detailedAdvice.push(
          { title: "Stay Indoors", description: "Remain indoors and keep activity levels low. Keep windows and doors closed." },
          { title: "Use HEPA Filters", description: "Run air purifiers on a high setting to create a clean air sanctuary indoors." },
          { title: "Wear a Protective Mask", description: "If you absolutely must go outside, a high-quality N95 or P100 mask is essential." }
      );
      break;
    case 'Hazardous':
      overallRecommendation = "Hazardous air quality warning. Everyone should remain indoors and avoid all physical activity.";
      detailedAdvice.push(
          { title: "Avoid All Outdoor Exposure", description: "This is an emergency condition. Going outside is a significant health risk." },
          { title: "Seal Your Home", description: "Keep your indoor environment as sealed as possible. Re-circulate air with your HVAC system if it has a clean filter." },
          { title: "Follow Official Guidance", description: "Pay attention to alerts and instructions from local health authorities." }
      );
      break;
  }

  return {
    overallRecommendation,
    detailedAdvice,
  };
}
