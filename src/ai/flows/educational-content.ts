'use server';

/**
 * @fileOverview An AI agent for generating educational content on environmental topics.
 *
 * - getEducationalContent - A function that returns a curated article on a given topic.
 * - EducationalContentInput - The input type for the getEducationalContent function.
 * - EducationalContentOutput - The return type for the getEducationalContent function.
 */

import {z} from 'genkit';

const EducationalContentInputSchema = z.object({
  topic: z.enum(['Climate Change', 'Pollution Reduction', 'Sustainable Living']).describe('The environmental topic for the educational content.'),
});
export type EducationalContentInput = z.infer<typeof EducationalContentInputSchema>;

const EducationalContentOutputSchema = z.object({
  title: z.string().describe("The catchy, engaging title of the article."),
  summary: z.string().describe("A concise 2-3 sentence summary of the topic."),
  keyTakeaways: z.array(z.string()).describe("A list of 3-4 bullet points with actionable tips or key facts."),
});
export type EducationalContentOutput = z.infer<typeof EducationalContentOutputSchema>;

const mockContent: Record<string, EducationalContentOutput> = {
    "Pollution Reduction": {
        title: "Breathe Easy: A Guide to Reducing Your Pollution Footprint",
        summary: "Air pollution, particularly in urban centers like Lahore, poses significant health risks from invisible threats like PM2.5. However, collective and individual actions in transport, home energy, and waste management can drastically improve air quality, leading to better health and a cleaner environment for all.",
        keyTakeaways: [
            "Upgrade Your Commute: Vehicle emissions are a primary source of urban pollution. Prioritize walking, cycling, or public transport. If driving is necessary, carpool and ensure your vehicle is well-maintained to minimize exhaust fumes. Adopting Euro 5 and 6 fuel standards is a key national strategy.",
            "Conserve Energy at Home: The energy you use has a source, often fossil fuels. Reduce demand by switching to energy-efficient LED bulbs and appliances, improving insulation, and unplugging electronics. This lowers emissions from power plants.",
            "Eliminate Burning of Waste: Burning trash, leaves, or agricultural residue is a major source of harmful PM2.5 and toxic gases. Compost organic materials, recycle what you can, and dispose of the rest responsibly through municipal services.",
            "Improve Indoor Air Quality: Outdoor pollution easily seeps indoors. Use air purifiers with HEPA filters, ensure good ventilation, and grow air-purifying plants like Snake Plants and Spider Plants to create a healthier indoor environment.",
            "Choose Low-VOC Products: Many household items like paints, cleaning supplies, and air fresheners release Volatile Organic Compounds (VOCs) that are harmful to your health. Opt for natural or low-VOC alternatives whenever possible.",
            "Advocate for Systemic Change: Individual actions are powerful, but systemic change is crucial. Support policies that promote renewable energy, expand green public spaces, enforce industrial emission standards, and invest in modern public transportation."
        ]
    },
    "Sustainable Living": {
        title: "Live Lighter: Practical Steps for a Sustainable Lifestyle",
        summary: "Sustainable living is about aligning your daily choices with the health of the planet. It’s a conscious journey to reduce your consumption, minimize waste, and lower your carbon footprint, creating a more resilient and equitable world for future generations.",
        keyTakeaways: [
            "Embrace the '5 Rs' of Waste: Go beyond 'Reduce, Reuse, Recycle'. Add 'Refuse' (saying no to single-use items like straws and plastic bags) and 'Rot' (composting organic waste) to fundamentally change your relationship with disposables.",
            "Eat for the Planet: Reduce your consumption of red meat and dairy, as they have the highest environmental footprint. Prioritize local, seasonal produce to cut down on 'food miles' and support your local farming community and economy.",
            "Rethink Your Wardrobe: The 'fast fashion' industry is a major polluter. Choose quality over quantity, repair clothes instead of discarding them, buy second-hand, and support brands that use sustainable materials and ethical manufacturing practices.",
            "Conserve Every Drop of Water: Water is a finite resource. Install low-flow fixtures, fix leaks promptly, take shorter showers, and collect rainwater for gardening. These small habits collectively save thousands of liters annually.",
            "Vote with Your Wallet: Support businesses that are transparent about their supply chains and committed to sustainability. Your purchasing power can pressure more companies to adopt environmentally friendly practices.",
            "Decarbonize Your Finances: Investigate if your bank or pension fund invests in fossil fuels. Consider switching to financial institutions that prioritize and finance green, renewable energy projects and sustainable industries."
        ]
    },
    "Climate Change": {
        title: "Our Climate, Our Future: From Understanding to Action",
        summary: "Climate change, primarily driven by the human-induced increase in greenhouse gases, is causing unprecedented shifts in global weather patterns and ecosystems. Grasping the science behind it empowers us to take meaningful action to mitigate its effects and adapt to a new reality.",
        keyTakeaways: [
            "The Greenhouse Effect is Real: Burning fossil fuels (coal, oil, and gas) for energy and transportation releases gases like Carbon Dioxide (CO2) and Methane, which trap heat in the atmosphere, leading to a gradual rise in global temperatures.",
            "Impacts are Here and Now: Climate change isn't a distant threat. It's visible in the form of more frequent and intense heatwaves, extreme rainfall and flooding, prolonged droughts, and rising sea levels, disproportionately affecting vulnerable regions like Pakistan.",
            "The Critical 1.5°C Goal: The international community, through the Paris Agreement, aims to limit global warming to 1.5°C above pre-industrial levels to avoid the most catastrophic impacts. This requires rapid, deep, and immediate cuts in global emissions.",
            "Renewable Energy is the Key: The single most impactful solution is transitioning from fossil fuels to renewable energy sources like solar, wind, and hydropower. Supporting this transition through policy and investment is paramount.",
            "Nature is Our Ally: Protecting and restoring natural 'carbon sinks' like forests, wetlands, and oceans is vital. Reforestation and conservation efforts can absorb vast amounts of CO2 from the atmosphere, helping to balance the climate.",
            "Your Carbon Footprint Matters: Every individual's choices contribute to the collective whole. Reducing your energy use, adopting a plant-rich diet, minimizing air travel, and advocating for strong climate policies are all powerful ways to be part of the solution."
        ]
    }
}


export async function getEducationalContent(
    input: EducationalContentInput
): Promise<EducationalContentOutput> {
    return mockContent[input.topic];
}
