import { type AirQualityInsightOutput } from "@/ai/flows/air-quality-insights";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Sparkles } from "lucide-react";

export function AqiInsightCard({ insightData }: { insightData: AirQualityInsightOutput }) {

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
