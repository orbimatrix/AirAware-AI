import type { LucideIcon } from "lucide-react";
import { z } from "zod";
import { FieldValue } from "firebase/firestore";

export type Pollutant = {
  name: string;
  value: number;
  unit: string;
  Icon: LucideIcon;
};

export type AqiData = {
  location: string;
  aqi: number;
  status: string;
  statusClassName: string;
  pollutants: Pollutant[];
};


export type Challenge = {
  id: string;
  title: string;
  description:string;
  points: number;
  icon: LucideIcon;
};

export type Badge = {
  id: string;
  name: string;
  description: string;
  icon: LucideIcon;
  pointsToUnlock: number;
}

export type LeaderboardUser = {
  rank: number;
  name: string;
  score: number;
  avatarUrl: string;
  avatarFallback: string;
};

export const ReportSeverityEnum = z.enum(['Low', 'Medium', 'High']);

export type EcoReport = {
  id: string;
  type: 'Trash' | 'Pollution' | 'Other';
  description: string;
  position: {
    lat: number;
    lng: number;
  };
  iconName: string;
  severity: z.infer<typeof ReportSeverityEnum>;
  createdAt?: FieldValue;
};

export type NewReport = Omit<EcoReport, 'id'>;

export const HealthRecsInputSchema = z.object({
  aqi: z.number().describe('The current Air Quality Index (AQI) value.'),
  age: z.number().optional().describe('The age of the user.'),
  healthConditions: z
    .array(z.string())
    .optional()
    .describe(
      'A list of pre-existing health conditions (e.g., "Asthma", "Heart Disease").'
    ),
});
export type HealthRecsInput = z.infer<typeof HealthRecsInputSchema>;

export const HealthRecsOutputSchema = z.object({
  overallRecommendation: z
    .string()
    .describe(
      'A primary, actionable recommendation based on the overall risk.'
    ),
  detailedAdvice: z
    .array(
      z.object({
        title: z.string().describe('The title for the piece of advice.'),
        description: z
          .string()
          .describe('A detailed paragraph explaining the advice.'),
      })
    )
    .describe('An array of 3 to 4 specific, detailed pieces of advice.'),
});
export type HealthRecsOutput = z.infer<typeof HealthRecsOutputSchema>;
