'use server';

/**
 * @fileOverview An AI-powered severity classifier for environmental reports.
 *
 * - classifyReportSeverity - A function that classifies the severity of a user-submitted report.
 * - ReportSeverityClassifierInput - The input type for the classifyReportSeverity function.
 * - ReportSeverityClassifierOutput - The return type for the classifyReportSeverity function.
 */

import {ai} from '@/ai/genkit';
import { ReportSeverityEnum } from '@/lib/types';
import {z} from 'genkit';

const ReportSeverityClassifierInputSchema = z.object({
  reportType: z.string().describe("The type of issue reported by the user (e.g., 'Illegal Trash Dumping', 'Visible Air/Water Pollution')."),
  description: z.string().describe("The user's description of the issue."),
});
export type ReportSeverityClassifierInput = z.infer<typeof ReportSeverityClassifierInputSchema>;

const ReportSeverityClassifierOutputSchema = z.object({
  severity: ReportSeverityEnum.describe("The classified severity of the report: 'Low', 'Medium', or 'High'."),
  reasoning: z.string().describe("A brief explanation for why the severity was classified as such."),
});
export type ReportSeverityClassifierOutput = z.infer<typeof ReportSeverityClassifierOutputSchema>;


export async function classifyReportSeverity(
    input: ReportSeverityClassifierInput
): Promise<ReportSeverityClassifierOutput> {
    return reportSeverityClassifierFlow(input);
}


const prompt = ai.definePrompt({
    name: 'reportSeverityPrompt',
    input: {schema: ReportSeverityClassifierInputSchema},
    output: {schema: ReportSeverityClassifierOutputSchema},
    prompt: `You are an environmental impact assessor. Your task is to classify the severity of a user-submitted environmental report.

    The user provides the type of report and a description. Based on this information, you must classify the severity as 'Low', 'Medium', or 'High'.

    - **Low Severity**: Minor issues, localized impact, not an immediate danger (e.g., an overflowing public trash can, small amounts of litter).
    - **Medium Severity**: Significant but localized issue, potential for environmental harm if not addressed (e.g., a pile of illegally dumped trash, noticeable but contained smoke from a vehicle).
    - **High Severity**: Widespread, immediate, or hazardous impact on the environment or public health (e.g., large-scale illegal dumping, visible chemical-like pollution in water, thick black smoke from a factory chimney).

    User Input:
    - Report Type: {{{reportType}}}
    - Description: {{{description}}}

    Analyze the user's input and determine the severity. Provide a brief, one-sentence reasoning for your classification.
    For example, if the description is "Factory emitting black smoke all day," the severity should be High because it suggests significant air pollution affecting a large area.

    Output the severity and your reasoning in the specified JSON format.
    `,
});

const reportSeverityClassifierFlow = ai.defineFlow(
    {
        name: 'reportSeverityClassifierFlow',
        inputSchema: ReportSeverityClassifierInputSchema,
        outputSchema: ReportSeverityClassifierOutputSchema,
    },
    async (input) => {
        const {output} = await prompt(input);
        return output!;
    }
);
