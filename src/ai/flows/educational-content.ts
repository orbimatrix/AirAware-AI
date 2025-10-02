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
        title: "Simple Steps to Cleaner Air in Your City",
        summary: "Air pollution is a major concern, but small, collective actions can lead to significant improvements. Discover how you can contribute to a healthier environment right from your doorstep.",
        keyTakeaways: [
            "Opt for public transport, cycling, or walking to reduce traffic emissions.",
            "Conserve energy at home; less power consumption means fewer emissions from power plants.",
            "Avoid burning trash, as it releases harmful pollutants directly into the air.",
            "Support local businesses that prioritize sustainable practices.",
        ]
    },
    "Sustainable Living": {
        title: "Live Green: Easy Swaps for a Sustainable Lifestyle",
        summary: "Sustainable living is about making conscious choices that reduce your environmental impact. It's easier than you think to start making a difference today.",
        keyTakeaways: [
            "Use reusable bags, water bottles, and coffee cups to minimize plastic waste.",
            "Reduce food waste by planning meals and composting scraps.",
            "Choose products with minimal packaging to decrease landfill burden.",
            "Repair items instead of replacing them to save resources and money.",
        ]
    },
    "Climate Change": {
        title: "Understanding Climate Change and Your Role",
        summary: "Climate change is a global challenge, but individual and community actions are crucial. Learn the basics and how you can be part of the solution.",
        keyTakeaways: [
            "Global temperatures are rising due to increased greenhouse gases from human activities.",
            "Conserving energy and reducing your carbon footprint are the most effective personal actions.",
            "Protecting and planting trees helps absorb CO2, a key greenhouse gas.",
            "Advocating for renewable energy sources can drive large-scale change.",
        ]
    }
}


export async function getEducationalContent(
    input: EducationalContentInput
): Promise<EducationalContentOutput> {
    return mockContent[input.topic];
}
