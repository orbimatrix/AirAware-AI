import type { AqiData, Challenge, LeaderboardUser, Badge, EcoReport } from "@/lib/types";
import { Wind, Gauge, Droplets, Mountain, Leaf, Tractor, Trees, Award, Star, Shield, Trash2, Factory } from "lucide-react";

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
  { id: "b1", name: "First Steps", description: "Complete your first challenge.", icon: Star },
  { id: "b2", name: "Eco-Warrior", description: "Complete 5 challenges.", icon: Shield },
  { id: "b3", name: "Community Hero", description: "Reach the top 3 on the leaderboard.", icon: Award },
];

export const mockLeaderboard: LeaderboardUser[] = [
  { rank: 1, name: "Ayesha Khan", score: 2500, avatarUrl: "https://picsum.photos/seed/user2/40/40", avatarFallback: "AK", earnedBadges: ["b1", "b2", "b3"] },
  { rank: 2, name: "Bilal Ahmed", score: 2350, avatarUrl: "https://picsum.photos/seed/user3/40/40", avatarFallback: "BA", earnedBadges: ["b1", "b2"] },
  { rank: 3, name: "Fatima Ali", score: 2200, avatarUrl: "https://picsum.photos/seed/user4/40/40", avatarFallback: "FA", earnedBadges: ["b1", "b2"] },
  { rank: 4, name: "You", score: 2150, avatarUrl: "https://picsum.photos/seed/user1/40/40", avatarFallback: "UP", earnedBadges: ["b1"] },
  { rank: 5, name: "Usman Tariq", score: 1900, avatarUrl: "https://picsum.photos/seed/user5/40/40", avatarFallback: "UT", earnedBadges: ["b1"] },
];

export const mockEcoReports: EcoReport[] = [
    { id: "r1", type: "Trash", description: "Illegal trash dumping near the canal.", position: { top: "30%", left: "35%" }, icon: Trash2 },
    { id: "r2", type: "Pollution", description: "Factory emitting black smoke.", position: { top: "55%", left: "65%" }, icon: Factory },
    { id: "r3", type: "Trash", description: "Overflowing public bins.", position: { top: "70%", left: "25%" }, icon: Trash2 },
];
