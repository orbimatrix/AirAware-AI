import type { LucideIcon } from "lucide-react";
import { z } from "zod";
import { FieldValue } from "firebase/firestore";

export type Pollutant = {
  name: string;
  value: number;
  unit: string;
  Icon: LucideIcon;
};

// export type AqiData = {
//   location: string;
//   aqi: number;
//   status: string;
//   statusClassName: string;
//   pollutants: Pollutant[];
// };

export interface PollutantMeasurement {
  name: string;
  value: number;
  unit: string;
}

export interface AqiBreakdown {
    name: string; // Pollutant name (e.g., "pm25")
    aqi: number;
}

export interface AqiLocation {
    id: number;
    name: string;
    coordinates: {
        latitude: number;
        longitude: number;
    };
}

export interface AqiData {
  source: string;
  location: AqiLocation;
  measurements: PollutantMeasurement[];
  aqi: {
    overall: number;
    dominantPollutant: string | null;
    byPollutant: AqiBreakdown[];
    method: string;
  };
  // These are calculated on the frontend based on aqi.overall
  status: string;
  statusClassName: string;

  // Keep this if your components expect it, otherwise remove it
  // pollutantsts?: any[];
}

// This type represents the raw data from your API route
export interface AirQualityData {
  source: string;
  location: AqiLocation;
  measurements: PollutantMeasurement[];
  aqi: {
    overall: number;
    dominantPollutant: string | null;
    byPollutant: AqiBreakdown[];
    method: string;
  };
  rawLocationLatest: any; // Assuming this is still part of your API response
}


export type Challenge = {
  id: string;
  title: string;
  description: string;
  points: number;
  icon: LucideIcon;
};

export type Badge = {
  id: string;
  name: string;
  description: string;
  icon: LucideIcon;
}

export type LeaderboardUser = {
  rank: number;
  name: string;
  score: number;
  avatarUrl: string;
  avatarFallback: string;
  earnedBadges?: string[]; // Array of badge IDs
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
