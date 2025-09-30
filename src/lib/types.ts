import type { LucideIcon } from "lucide-react";

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

export type LeaderboardUser = {
  rank: number;
  name: string;
  score: number;
  avatarUrl: string;
  avatarFallback: string;
};
