"use server";

import {
  personalizedHealthRecommendations,
  PersonalizedHealthRecommendationsOutput,
} from "@/ai/flows/personalized-health-recommendations";
import { z } from "zod";
import { mockAqiData } from "@/lib/data";

const formSchema = z.object({
  age: z.coerce.number().min(0, "Age cannot be negative").max(120, "Age seems too high"),
  respiratoryIssues: z.boolean(),
  otherConditions: z.string().max(200, "Please keep conditions brief").optional(),
});

type RecommendationState = {
  data: PersonalizedHealthRecommendationsOutput | null;
  error: string | null;
};

export async function getHealthRecommendation(
  prevState: RecommendationState,
  formData: FormData
): Promise<RecommendationState> {
  const parsed = formSchema.safeParse({
    age: formData.get("age"),
    respiratoryIssues: formData.get("respiratoryIssues") === "on",
    otherConditions: formData.get("otherConditions"),
  });

  if (!parsed.success) {
    return { data: null, error: parsed.error.errors.map((e) => e.message).join(", ") };
  }

  try {
    const result = await personalizedHealthRecommendations({
      aqi: mockAqiData.aqi,
      location: mockAqiData.location,
      healthProfile: {
        age: parsed.data.age,
        respiratoryIssues: parsed.data.respiratoryIssues,
        otherConditions: parsed.data.otherConditions,
      },
    });

    return { data: result, error: null };
  } catch (e: any) {
    console.error(e);
    return { data: null, error: "Failed to get recommendations. Please try again." };
  }
}
