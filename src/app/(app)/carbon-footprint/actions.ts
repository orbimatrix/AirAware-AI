"use server";

import {
  calculateCarbonFootprint,
  CarbonFootprintCalculatorOutput,
} from "@/ai/flows/carbon-footprint-calculator";
import { z } from "zod";

const CarbonFootprintCalculatorInputSchema = z.object({
  householdSize: z.coerce.number().min(1),
  electricityKwh: z.coerce.number().min(0),
  naturalGasM3: z.coerce.number().min(0),
  heatingOilL: z.coerce.number().min(0),
  carKm: z.coerce.number().min(0),
  carFuelType: z.enum(['petrol', 'diesel', 'electric']),
  carFuelEconomy: z.coerce.number().min(0),
  flightsShort: z.coerce.number().min(0),
  flightsLong: z.coerce.number().min(0),
  diet: z.enum(['vegan', 'vegetarian', 'pescatarian', 'omnivore', 'omnivore_high_meat']),
  wasteKg: z.coerce.number().min(0),
});

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
