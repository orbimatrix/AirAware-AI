import type { LucideIcon } from "lucide-react";
import { z } from "zod";

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

export type EcoReport = {
  id: string;
  type: 'Trash' | 'Pollution' | 'Other';
  description: string;
  position: {
    top: string;
    left: string;
  };
  icon: LucideIcon;
};

export const ReportSeverityEnum = z.enum(['Low', 'Medium', 'High']);
