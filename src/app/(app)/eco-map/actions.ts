'use server';

import {
  classifyReportSeverity,
  ReportSeverityClassifierOutput,
  ReportSeverityEnum,
} from '@/ai/flows/report-severity-classifier';
import { z } from 'zod';

const formSchema = z.object({
  reportType: z.string({ required_error: 'Please select a report type.' }),
  description: z
    .string()
    .min(10, 'Description must be at least 10 characters.')
    .max(200, 'Description is too long.'),
});

type ReportState = {
  data: ReportSeverityClassifierOutput | null;
  error: string | null;
};

export async function submitReport(
  prevState: ReportState,
  formData: FormData
): Promise<ReportState> {
  const parsed = formSchema.safeParse({
    reportType: formData.get('reportType'),
    description: formData.get('description'),
  });

  if (!parsed.success) {
    return {
      data: null,
      error: parsed.error.errors.map((e) => e.message).join(', '),
    };
  }

  try {
    const result = await classifyReportSeverity(parsed.data);
    return { data: result, error: null };
  } catch (e) {
    console.error(e);
    return {
      data: null,
      error: 'Failed to classify report severity. Please try again.',
    };
  }
}
