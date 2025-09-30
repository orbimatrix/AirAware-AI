"use server";

import {
  calculateCarbonFootprint,
  CarbonFootprintCalculatorOutput,
} from "@/ai/flows/carbon-footprint-calculator";
import { z } from "zod";

const formSchema = z.object({
  transport: z.coerce.number(),
  energy: z.coerce.number(),
  diet: z.coerce.number(),
  consumption: z.coerce.number(),
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
    transport: formData.get("transport"),
    energy: formData.get("energy"),
    diet: formData.get("diet"),
    consumption: formData.get("consumption"),
  });

  if (!parsed.success) {
    return { data: null, error: parsed.error.errors.map((e) => e.message).join(", ") };
  }

  try {
    const result = await calculateCarbonFootprint(parsed.data);
    return { data: result, error: null };
  } catch (e) {
    console.error(e);
    return { data: null, error: "Failed to calculate footprint. Please try again." };
  }
}
