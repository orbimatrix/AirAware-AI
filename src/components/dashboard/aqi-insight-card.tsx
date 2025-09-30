import { getAirQualityInsight } from "@/ai/flows/air-quality-insights";
import { mockAqiData } from "@/lib/data";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Sparkles } from "lucide-react";

export async function AqiInsightCard() {
  // In a real app, you'd fetch the previous week's AQI from a database.
  const previousWeekAqi = 225;

  const insightData = await getAirQualityInsight({
    location: mockAqiData.location,
    currentAqi: mockAqiData.aqi,
    previousAqi: previousWeekAqi,
  });

  return (
    <Alert className="bg-primary/10 border-primary/20 text-foreground">
      <Sparkles className="h-5 w-5 text-primary" />
      <AlertTitle className="font-bold text-primary">This Week's Insight</AlertTitle>
      <AlertDescription>
        {insightData.insight}
      </AlertDescription>
    </Alert>
  );
}
