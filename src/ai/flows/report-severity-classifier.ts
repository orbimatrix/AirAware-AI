
'use server';

/**
 * @fileOverview An AI-powered severity classifier for environmental reports.
 *
 * - classifyReportSeverity - A function that classifies the severity of a user-submitted report.
 * - ReportSeverityClassifierInput - The input type for the classifyReportSeverity function.
 * - ReportSeverityClassifierOutput - The return type for the classifyReportSeverity function.
 */

import { ReportSeverityEnum } from '@/lib/types';
import {z} from 'zod';

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
    let severity: z.infer<typeof ReportSeverityEnum> = 'Low';
    let reasoning = "This is a minor issue with localized impact.";

    if (input.description.toLowerCase().includes('large') || input.reportType === 'Pollution') {
        severity = 'Medium';
        reasoning = "This appears to be a significant but localized issue.";
    }

    if (input.description.toLowerCase().includes('factory') || input.description.toLowerCase().includes('chemical')) {
        severity = 'High';
        reasoning = "This suggests a potentially hazardous impact on public health.";
    }

    return {
        severity,
        reasoning,
    };
}
