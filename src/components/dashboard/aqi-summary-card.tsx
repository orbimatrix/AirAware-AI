import { Card, CardContent } from "@/components/ui/card";
import { AqiData } from "@/lib/types";
import { cn } from "@/lib/utils";

type AqiSummaryCardProps = {
  data: AqiData;
};

export function AqiSummaryCard({ data }: AqiSummaryCardProps) {
  return (
    <Card className="relative overflow-hidden bg-primary/10">
      <CardContent className="flex flex-col items-center justify-center p-6 text-center">
        <div
          className={cn(
            "absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/10 opacity-50",
            "transition-all duration-500"
          )}
        />
        <div className="relative z-10">
          <p className="text-sm font-medium text-muted-foreground">
            {data.location}
          </p>
          <div className="my-4">
            <span className="text-7xl font-bold tracking-tighter text-foreground">
              {data.aqi}
            </span>
            <span className="ml-1 text-lg font-medium text-muted-foreground">
              AQI
            </span>
          </div>
          <p
            className={cn(
              "text-2xl font-semibold font-headline",
              data.statusClassName
            )}
          >
            {data.status}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
