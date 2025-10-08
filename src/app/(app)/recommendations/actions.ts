'use server';

import {
  personalizedHealthRecommendations,
} from '@/ai/flows/personalized-health-recommendations';
import { HealthRecsOutput } from '@/lib/types';
import { z } from 'zod';

const HealthRecsFormSchema = z.object({
  aqi: z.coerce.number(),
  age: z.coerce.number().optional(),
  healthConditions: z.array(z.string()).optional(),
});

type HealthRecsState = {
  data: HealthRecsOutput | null;
  error: string | null;
  submitted: boolean;
};

export async function getHealthRecommendations(
  prevState: HealthRecsState,
  formData: FormData
): Promise<HealthRecsState> {
  const rawData = {
    aqi: formData.get('aqi'),
    age: formData.get('age') || undefined,
    healthConditions: formData.getAll('healthConditions'),
  };

  const parsed = HealthRecsFormSchema.safeParse(rawData);

  if (!parsed.success) {
    return {
      data: null,
      error: parsed.error.errors.map((e) => e.message).join(', '),
      submitted: false,
    };
  }

  try {
    const result = await personalizedHealthRecommendations(parsed.data);
    return { data: result, error: null, submitted: true };
  } catch (e: any) {
    console.error(e);
    return {
      data: null,
      error: e.message || 'Failed to generate recommendations.',
      submitted: true,
    };
  }
}
