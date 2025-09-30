import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Pollutant } from "@/lib/types";
import { cn } from "@/lib/utils";

type PollutantCardProps = {
  pollutant: Pollutant;
};

export function PollutantCard({ pollutant }: PollutantCardProps) {
  return (
    <Card className="flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow duration-300">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{pollutant.name}</CardTitle>
        <pollutant.Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{pollutant.value}</div>
        <p className="text-xs text-muted-foreground">{pollutant.unit}</p>
      </CardContent>
    </Card>
  );
}
