'use server';

/**
 * @fileOverview An AI-powered carbon footprint calculator.
 *
 * - calculateCarbonFootprint - A function that calculates the annual carbon footprint.
 * - CarbonFootprintCalculatorInput - The input type for the calculateCarbonFootprint function.
 * - CarbonFootprintCalculatorOutput - The return type for the calculateCarbonFootprint function.
 */

import {z} from 'genkit';

export type CarbonFootprintCalculatorInput = z.infer<z.ZodObject<{
  householdSize: z.ZodNumber;
  electricityKwh: z.ZodNumber;
  naturalGasM3: z.ZodNumber;
  heatingOilL: z.ZodNumber;
  carKm: z.ZodNumber;
  carFuelType: z.ZodEnum<['petrol', 'diesel', 'electric']>;
  carFuelEconomy: z.ZodNumber;
  flightsShort: z.ZodNumber;
  flightsLong: z.ZodNumber;
  diet: z.ZodEnum<['vegan', 'vegetarian', 'pescatarian', 'omnivore', 'omnivore_high_meat']>;
  wasteKg: z.ZodNumber;
}>>;

const CarbonFootprintCalculatorOutputSchema = z.object({
  totalFootprint: z
    .number()
    .describe('The estimated total annual carbon footprint in tonnes of CO₂ equivalent.'),
  breakdown: z.object({
    household: z.number(),
    transport: z.number(),
    diet: z.number(),
    waste: z.number(),
  }),
  tips: z
    .array(z.string())
    .describe('An array of 3 personalized tips to reduce the carbon footprint based on the highest-contributing areas.'),
});
export type CarbonFootprintCalculatorOutput = z.infer<typeof CarbonFootprintCalculatorOutputSchema>;


// Simplified emission factors (in kg CO₂e). In a real app, these would be more complex and region-specific.
// Sources: EPA, GHG Protocol, Our World in Data
const EMISSION_FACTORS = {
  // Scope 2
  electricity: 0.475, // kg CO₂e per kWh (global average)

  // Scope 1
  naturalGas: 2.04,   // kg CO₂e per m³
  heatingOil: 2.96,   // kg CO₂e per litre
  petrol: 2.31,       // kg CO₂e per litre
  diesel: 2.68,       // kg CO₂e per litre

  // Scope 3 - Transport
  flightsShort: 250,  // kg CO₂e per short-haul return flight (< 3 hours)
  flightsLong: 1000,   // kg CO₂e per long-haul return flight (> 3 hours)

  // Scope 3 - Diet
  diet: { // kg CO₂e per year
    vegan: 600,
    vegetarian: 1000,
    pescatarian: 1400,
    omnivore: 1800,
    omnivore_high_meat: 2500,
  },
  
  // Scope 3 - Waste
  waste: 0.6, // kg CO₂e per kg of landfill waste
};


export async function calculateCarbonFootprint(
    input: CarbonFootprintCalculatorInput
): Promise<CarbonFootprintCalculatorOutput> {
    const { householdSize, electricityKwh, naturalGasM3, heatingOilL, carKm, carFuelType, carFuelEconomy, flightsShort, flightsLong, diet, wasteKg } = input;
    
    // 1. Household Emissions (Annual)
    const electricityAnnual = (electricityKwh * 12 * EMISSION_FACTORS.electricity) / householdSize;
    const naturalGasAnnual = (naturalGasM3 * 12 * EMISSION_FACTORS.naturalGas) / householdSize;
    const heatingOilAnnual = (heatingOilL * 12 * EMISSION_FACTORS.heatingOil) / householdSize;
    const householdTotal = electricityAnnual + naturalGasAnnual + heatingOilAnnual;

    // 2. Transport Emissions (Annual)
    let carAnnual = 0;
    if (carKm > 0 && carFuelEconomy > 0) {
        const totalFuelOrEnergy = (carKm * 12) / 100 * carFuelEconomy;
        if (carFuelType === 'petrol') {
            carAnnual = totalFuelOrEnergy * EMISSION_FACTORS.petrol;
        } else if (carFuelType === 'diesel') {
            carAnnual = totalFuelOrEnergy * EMISSION_FACTORS.diesel;
        } else if (carFuelType === 'electric') {
            carAnnual = totalFuelOrEnergy * EMISSION_FACTORS.electricity;
        }
    }
    const flightsAnnual = (flightsShort * EMISSION_FACTORS.flightsShort) + (flightsLong * EMISSION_FACTORS.flightsLong);
    const transportTotal = carAnnual + flightsAnnual;

    // 3. Diet Emissions (Annual)
    const dietAnnual = EMISSION_FACTORS.diet[diet];
    
    // 4. Waste Emissions (Annual)
    const wasteAnnual = wasteKg * 52 * EMISSION_FACTORS.waste;

    // Convert all from kg to tonnes
    const householdTonnes = householdTotal / 1000;
    const transportTonnes = transportTotal / 1000;
    const dietTonnes = dietAnnual / 1000;
    const wasteTonnes = wasteAnnual / 1000;
    
    const totalFootprint = householdTonnes + transportTonnes + dietTonnes + wasteTonnes;

    // Generate tips based on the largest contributor
    const breakdownForTips = { household: householdTonnes, transport: transportTonnes, diet: dietTonnes, waste: wasteTonnes };
    const largestContributor = (Object.keys(breakdownForTips) as (keyof typeof breakdownForTips)[]).reduce((a, b) => breakdownForTips[a] > breakdownForTips[b] ? a : b);

    let tips: string[] = [];
    if (largestContributor === 'household') {
        tips.push("Switch to a renewable energy provider if available, or reduce thermostat settings by 1-2 degrees.");
        if (electricityKwh > 300) tips.push("Unplug electronics when not in use and switch to LED lighting to cut electricity consumption.");
        if (naturalGasM3 > 0) tips.push("Improve home insulation to reduce heating and cooling needs, a major source of gas consumption.");
    } else if (largestContributor === 'transport') {
        if (carKm > 200) tips.push("For short trips, consider walking or cycling instead of driving. Combining errands into one trip also helps.");
        if (flightsLong > 0) tips.push("Long-haul flights have a significant impact. Consider offsetting your flight emissions or choosing alternative travel for your next trip.");
        tips.push("Regularly maintain your vehicle to ensure it runs efficiently, reducing fuel consumption.");
    } else if (largestContributor === 'diet') {
        if (diet.startsWith('omnivore')) tips.push("Reducing red meat consumption is one of the most impactful dietary changes. Try 'Meatless Mondays'.");
        tips.push("Support local and seasonal food producers to reduce emissions from food transportation and storage.");
    } else { // Waste
        if (wasteKg > 3) tips.push("Focus on reducing food waste and composting organics. Avoid single-use plastics by carrying reusable bags and bottles.");
        tips.push("Repair items instead of replacing them, and buy second-hand when possible to reduce manufacturing emissions.");
    }

    return {
        totalFootprint,
        breakdown: {
            household: householdTonnes,
            transport: transportTonnes,
            diet: dietTonnes,
            waste: wasteTonnes,
        },
        tips: tips.slice(0, 3),
    };
}
