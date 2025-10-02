import type { AqiData, Challenge, LeaderboardUser, Badge } from "@/lib/types";
import { Wind, Gauge, Droplets, Mountain, Leaf, Tractor, Trees, Award, Star, Shield, Footprints, Gem, PackageX, Carrot, Apple, Wrench, ShowerHead } from "lucide-react";

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
    description: "Use public transport or carpool for a day.",
    points: 30,
    icon: Tractor,
  },
  {
    id: "2",
    title: "Tree Hugger",
    description: "Plant a tree or a houseplant.",
    points: 100,
    icon: Trees,
  },
  {
    id: "3",
    title: "Waste Warrior",
    description: "Ensure all recyclable items are properly sorted for a week.",
    points: 40,
    icon: Leaf,
  },
  {
    id: "4",
    title: "Energy Saver",
    description: "Turn off all non-essential lights and unplug electronics for a day.",
    points: 25,
    icon: Mountain,
  },
  {
    id: "5",
    title: "Track Your Footprint",
    description: "Calculate your carbon footprint to understand your impact.",
    points: 20,
    icon: Footprints,
  },
  {
    id: "6",
    title: "No Single-Use",
    description: "Go a full day without using any single-use plastic bottles or bags.",
    points: 35,
    icon: PackageX,
  },
  {
    id: "7",
    title: "Meatless Meal",
    description: "Eat one fully vegetarian or vegan meal.",
    points: 20,
    icon: Carrot,
  },
  {
    id: "8",
    title: "Shop Local",
    description: "Buy one item of produce that was grown locally.",
    points: 15,
    icon: Apple,
  },
  {
    id: "9",
    title: "Fix It, Don't Ditch It",
    description: "Repair one broken item instead of replacing it.",
    points: 50,
    icon: Wrench,
  },
  {
    id: "10",
    title: "Water Wise",
    description: "Take a shower that is 5 minutes or less.",
    points: 15,
    icon: ShowerHead,
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
