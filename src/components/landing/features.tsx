import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Home, Map, HeartPulse, Footprints, Trophy, ShieldAlert } from "lucide-react";

const features = [
  {
    icon: Home,
    title: "Real-Time Dashboard",
    description: "View current AQI and pollutant levels for your location at a glance.",
  },
  {
    icon: ShieldAlert,
    title: "AI Hazard Zones",
    description: "Get alerts for high-pollution areas and find cleaner routes.",
  },
  {
    icon: HeartPulse,
    title: "Personalized Health Advice",
    description: "Receive AI-driven tips based on your health profile and air quality.",
  },
  {
    icon: Footprints,
    title: "Carbon Footprint Calculator",
    description: "Estimate your daily environmental impact and learn how to reduce it.",
  },
  {
    icon: Trophy,
    title: "Eco-Challenges",
    description: "Join community challenges, earn points, and make a positive impact.",
  },
  {
    icon: Map,
    title: "Pollution Mapping",
    description: "Visualize air quality data across your city to stay informed.",
  },
];

export function Features() {
  return (
    <section id="features" className="py-20 lg:py-28 bg-muted/50">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-3xl lg:text-4xl font-bold font-headline">Everything You Need for a Healthier Environment</h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Saaf Hawa provides a powerful suite of tools to help you understand and improve your relationship with the environment.
          </p>
        </div>
        <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <Card key={index} className="bg-card hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary mb-4">
                  <feature.icon className="h-6 w-6" />
                </div>
                <CardTitle>{feature.title}</CardTitle>
                <CardDescription>{feature.description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
