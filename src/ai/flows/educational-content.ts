'use server';

/**
 * @fileOverview An AI agent for generating educational content on environmental topics.
 *
 * - getEducationalContent - A function that returns a curated article on a given topic.
 * - EducationalContentInput - The input type for the getEducationalContent function.
 * - EducationalContentOutput - The return type for the getEducationalContent function.
 */

import {ai} from '@/ai/genkit';
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


export async function getEducationalContent(
    input: EducationalContentInput
): Promise<EducationalContentOutput> {
    return educationalContentFlow(input);
}


const prompt = ai.definePrompt({
    name: 'educationalContentPrompt',
    input: {schema: EducationalContentInputSchema},
    output: {schema: EducationalContentOutputSchema},
    prompt: `You are an expert environmental educator with a talent for making complex topics easy to understand and engaging for a general audience in Pakistan.

    Your task is to generate a short educational article on the given topic: {{{topic}}}.

    The content should be:
    - Clear, concise, and accessible.
    - Relevant to a Pakistani context where possible.
    - Positive and empowering, focusing on solutions and individual actions.

    Please generate the following:
    1. A short, catchy title for the article.
    2. A 2-3 sentence summary that grabs the reader's attention.
    3. A list of 3-4 key takeaways as bullet points. These should be practical tips or surprising facts.

    Generate the content in the specified JSON format.
    `,
});

const educationalContentFlow = ai.defineFlow(
    {
        name: 'educationalContentFlow',
        inputSchema: EducationalContentInputSchema,
        outputSchema: EducationalContentOutputSchema,
    },
    async (input) => {
        const {output} = await prompt(input);
        return output!;
    }
);
