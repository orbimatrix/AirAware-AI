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
        title: "Breathe Easy: Practical Steps to Reduce Air Pollution",
        summary: "Air pollution is a pressing issue in urban areas like Lahore, but collective action can create a significant impact. From your daily commute to household habits, discover how your choices can contribute to cleaner air for everyone.",
        keyTakeaways: [
            "Embrace Green Commuting: Opt for walking, cycling, or public transport. Carpooling for work or school runs significantly cuts down on vehicle emissions, a primary source of urban PM2.5 pollution.",
            "Conserve Energy at Home: Reduce electricity usage by switching to LED bulbs, unplugging electronics when not in use, and using energy-efficient appliances. Lower energy demand means fewer emissions from power plants.",
            "Stop Open Burning: Avoid burning household trash, leaves, or agricultural waste. This practice releases a cocktail of harmful pollutants, including dioxins and particulate matter, directly into the air you breathe.",
            "Support Clean Air Initiatives: Advocate for and support local policies that promote renewable energy, better public transport, and stricter industrial emission standards. Your voice can drive large-scale change."
        ]
    },
    "Sustainable Living": {
        title: "A Greener Tomorrow: Simple Swaps for a Sustainable Life",
        summary: "Sustainable living is about making conscious choices to reduce your personal environmental footprint. It's a journey of small, manageable changes that add up to a large, positive impact on the planet.",
        keyTakeaways: [
            "Mind Your Waste: Practice the 3 R's—Reduce, Reuse, Recycle. Minimize single-use plastics by carrying reusable bottles, bags, and containers. Compost kitchen scraps to reduce landfill waste and enrich soil.",
            "Eat Sustainably: Reduce your consumption of red meat, as livestock farming has a high environmental footprint. Prioritize locally-sourced, seasonal produce to reduce food miles and support local economies.",
            "Shop Consciously: Before buying new, ask if you can borrow, repair, or buy second-hand. When you do buy, choose products from companies with transparent and ethical supply chains and minimal packaging.",
            "Conserve Water: Simple acts like fixing leaky faucets, taking shorter showers, and only running full loads of laundry can save hundreds of liters of water each month, preserving this vital resource."
        ]
    },
    "Climate Change": {
        title: "Our Planet, Our Future: Understanding and Acting on Climate Change",
        summary: "Climate change, driven by human activities, is altering our world's ecosystems and weather patterns. Understanding the science is the first step to becoming an effective part of the global solution.",
        keyTakeaways: [
            "Know The Source: The primary driver of climate change is the emission of greenhouse gases (like CO2) from burning fossil fuels for energy, industry, and transportation.",
            "Global Impact, Local Effects: Rising global temperatures lead to more extreme weather events, including heatwaves, floods, and droughts, which disproportionately affect vulnerable regions like Pakistan.",
            "The Power of Sinks: Natural carbon sinks like forests and oceans are crucial for absorbing CO2. Protecting and restoring these ecosystems, through reforestation and conservation, is as important as cutting emissions.",
            "Individual Action Matters: Your carbon footprint is your personal contribution. By reducing energy consumption, adopting a plant-rich diet, and advocating for renewable energy, you directly contribute to the solution."
        ]
    }
}


export async function getEducationalContent(
    input: EducationalContentInput
): Promise<EducationalContentOutput> {
    return mockContent[input.topic];
}
