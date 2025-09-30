'use server';

import {
  classifyReportSeverity
} from '@/ai/flows/report-severity-classifier';
import { db, type NewReport } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { z } from 'zod';
import { ReportSeverityEnum } from '@/lib/types';

const formSchema = z.object({
  reportType: z.string({ required_error: 'Please select a report type.' }),
  description: z
    .string()
    .min(10, 'Description must be at least 10 characters.')
    .max(200, 'Description is too long.'),
  latitude: z.coerce.number(),
  longitude: z.coerce.number(),
});

type ReportState = {
  success: boolean;
  error: string | null;
};

export async function submitReport(
  prevState: ReportState,
  formData: FormData
): Promise<ReportState> {
  const parsed = formSchema.safeParse({
    reportType: formData.get('reportType'),
    description: formData.get('description'),
    latitude: formData.get('latitude'),
    longitude: formData.get('longitude'),
  });

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.errors.map((e) => e.message).join(', '),
    };
  }

  try {
    // 1. Classify severity with AI
    const classification = await classifyReportSeverity({
        reportType: parsed.data.reportType,
        description: parsed.data.description,
    });

    // 2. Prepare data for Firestore
    const newReport: NewReport = {
        type: parsed.data.reportType as 'Trash' | 'Pollution' | 'Other',
        description: parsed.data.description,
        position: {
            lat: parsed.data.latitude,
            lng: parsed.data.longitude,
        },
        severity: classification.severity,
        iconName: parsed.data.reportType === 'Trash' ? 'Trash2' : 'Factory',
        createdAt: serverTimestamp(),
    };

    // 3. Save to Firestore
    const reportsCollection = collection(db, 'reports');
    await addDoc(reportsCollection, newReport);

    return { success: true, error: null };
  } catch (e) {
    console.error(e);
    return {
      success: false,
      error: 'Failed to submit report. Please try again.',
    };
  }
}
