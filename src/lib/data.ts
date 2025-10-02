import type { AqiData, Challenge, LeaderboardUser, Badge } from "@/lib/types";
import { Wind, Gauge, Droplets, Mountain, Leaf, Tractor, Trees, Award, Star, Shield, Footprints, Gem } from "lucide-react";

export const mockAqiData: AqiData = {
  location: "Lahore, Pakistan",
  aqi: 180,
  status: "Unhealthy",
  statusClassName: "text-red-600",
  pollutants: [
    { name: "PM2.5", value: 180, unit: "μg/m³", Icon: Gauge },
    { name: "PM10", value: 250, unit: "μg/m³", Icon: Gauge },
    { name: "O₃", value: 75, unit: "ppb", Icon: Wind },
    { name: "NO₂", value: 45, unit: "ppb", Icon: Wind },
    { name: "CO", value: 9, unit: "ppm", Icon: Droplets },
    { name: "SO₂", value: 12, unit: "ppb", Icon: Droplets },
  ],
};

export const mockChallenges: Challenge[] = [
  {
    id: "1",
    title: "Green Commuter",
    description: "Use public transport or carpool for 5 days in a row.",
    points: 50,
    icon: Tractor,
  },
  {
    id: "2",
    title: "Tree Hugger",
    description: "Plant a tree in your community or donate to a tree-planting organization.",
    points: 100,
    icon: Trees,
  },
  {
    id: "5",
    title: "Track Your Footprint",
    description: "Calculate your carbon footprint to understand your impact.",
    points: 20,
    icon: Footprints,
  },
  {
    id: "3",
    title: "Waste Warrior",
    description: "Reduce your household waste by 25% for one week.",
    points: 75,
    icon: Leaf,
  },
  {
    id: "4",
    title: "Energy Saver",
    description: "Reduce your electricity consumption by 10% for a month.",
    points: 150,
    icon: Mountain,
  },
];

export const mockBadges: Badge[] = [
  { id: "b1", name: "Eco-Novice", description: "Earned at 50 points. Welcome to the movement!", icon: Star, pointsToUnlock: 50 },
  { id: "b2", name: "Planet Protector", description: "Earned at 200 points. You're making a real difference!", icon: Shield, pointsToUnlock: 200 },
  { id: "b3", name: "Green Guru", description: "Earned at 500 points. A true champion for the Earth!", icon: Award, pointsToUnlock: 500 },
  { id: "b4", name: "Climate Champion", description: "Earned at 1000 points. Your impact is legendary!", icon: Gem, pointsToUnlock: 1000 },
];

export const mockLeaderboard: LeaderboardUser[] = [
  { rank: 1, name: "Ayesha Khan", score: 520, avatarUrl: "https://picsum.photos/seed/user2/40/40", avatarFallback: "AK" },
  { rank: 2, name: "Bilal Ahmed", score: 480, avatarUrl: "https://picsum.photos/seed/user3/40/40", avatarFallback: "BA" },
  { rank: 3, name: "Fatima Ali", score: 350, avatarUrl: "https://picsum.photos/seed/user4/40/40", avatarFallback: "FA" },
  { rank: 4, name: "You", score: 0, avatarUrl: "https://picsum.photos/seed/user1/40/40", avatarFallback: "UP" },
  { rank: 5, name: "Usman Tariq", score: 150, avatarUrl: "https://picsum.photos/seed/user5/40/40", avatarFallback: "UT" },
];
