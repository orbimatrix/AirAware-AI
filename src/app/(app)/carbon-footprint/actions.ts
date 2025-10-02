"use server";

import {
  calculateCarbonFootprint,
  CarbonFootprintCalculatorOutput,
} from "@/ai/flows/carbon-footprint-calculator";
import { z } from "zod";

const formSchema = z.object({
  // Household
  householdSize: z.coerce.number().min(1, "Household must have at least 1 person."),
  electricityKwh: z.coerce.number().min(0, "Electricity usage cannot be negative."),
  naturalGasM3: z.coerce.number().min(0, "Natural gas usage cannot be negative."),
  heatingOilL: z.coerce.number().min(0, "Heating oil usage cannot be negative."),

  // Transport
  carKm: z.coerce.number().min(0, "Car distance cannot be negative."),
  carFuelType: z.enum(['petrol', 'diesel', 'electric']),
  carFuelEconomy: z.coerce.number().min(0, "Fuel economy cannot be negative.").optional(),
  flightsShort: z.coerce.number().min(0, "Number of flights cannot be negative."),
  flightsLong: z.coerce.number().min(0, "Number of flights cannot be negative."),
  
  // Diet & Waste
  diet: z.enum(['vegan', 'vegetarian', 'pescatarian', 'omnivore', 'omnivore_high_meat']),
  wasteKg: z.coerce.number().min(0, "Waste amount cannot be negative."),
});

type FootprintState = {
  data: CarbonFootprintCalculatorOutput | null;
  error: string | null;
};

export async function getWeeklyFootprint(
  prevState: FootprintState,
  formData: FormData
): Promise<FootprintState> {
  const parsed = formSchema.safeParse({
    householdSize: formData.get("householdSize"),
    electricityKwh: formData.get("electricityKwh"),
    naturalGasM3: formData.get("naturalGasM3"),
    heatingOilL: formData.get("heatingOilL"),
    carKm: formData.get("carKm"),
    carFuelType: formData.get("carFuelType"),
    carFuelEconomy: formData.get("carFuelEconomy") || 0,
    flightsShort: formData.get("flightsShort"),
    flightsLong: formData.get("flightsLong"),
    diet: formData.get("diet"),
    wasteKg: formData.get("wasteKg"),
  });

  if (!parsed.success) {
    return { data: null, error: parsed.error.errors.map((e) => e.message).join(", ") };
  }

  try {
    const result = await calculateCarbonFootprint(parsed.data);
    return { data: result, error: null };
  } catch (e: any) {
    console.error(e);
    return { data: null, error: e.message || "Failed to calculate footprint. Please try again." };
  }
}
