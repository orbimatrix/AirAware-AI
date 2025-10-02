"use server";

import {
  calculateCarbonFootprint,
  CarbonFootprintCalculatorInputSchema,
  CarbonFootprintCalculatorOutput,
} from "@/ai/flows/carbon-footprint-calculator";

type FootprintState = {
  data: CarbonFootprintCalculatorOutput | null;
  error: string | null;
};

export async function getWeeklyFootprint(
  prevState: FootprintState,
  formData: FormData
): Promise<FootprintState> {
  const rawData = Object.fromEntries(formData.entries());

  const parsed = CarbonFootprintCalculatorInputSchema.safeParse(rawData);

  if (!parsed.success) {
    return { data: null, error: parsed.error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join(", ") };
  }

  try {
    const result = await calculateCarbonFootprint(parsed.data);
    return { data: result, error: null };
  } catch (e: any) {
    console.error(e);
    return { data: null, error: e.message || "Failed to calculate footprint. Please try again." };
  }
}
