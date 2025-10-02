"use client"

import { AqiSummaryCard } from "@/components/dashboard/aqi-summary-card";
import { PollutantGrid } from "@/components/dashboard/pollutant-grid";
import { PageHeader } from "@/components/page-header";
import { mockAqiData } from "@/lib/data";
import { AqiInsightCard } from "@/components/dashboard/aqi-insight-card";
import { Suspense, useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { getAirQualityInsight, AirQualityInsightOutput } from "@/ai/flows/air-quality-insights";


function InsightCardSkeleton() {
  return <Skeleton className="h-24 w-full" />;
}

export default function DashboardPage() {
  const [insight, setInsight] = useState<AirQualityInsightOutput | null>(null);
  const [loadingInsight, setLoadingInsight] = useState(true);

  useEffect(() => {
    async function fetchInsight() {
      try {
        setLoadingInsight(true);
        // In a real app, you'd fetch the previous week's AQI from a database.
        const previousWeekAqi = 225;
        const insightData = await getAirQualityInsight({
          location: mockAqiData.location,
          currentAqi: mockAqiData.aqi,
          previousAqi: previousWeekAqi,
        });
        setInsight(insightData);
      } catch (error) {
        console.error("Failed to fetch air quality insight:", error);
        // Optionally set an error state to show in the UI
      } finally {
        setLoadingInsight(false);
      }
    }
    fetchInsight();
  }, []);


  return (
    <div className="space-y-8">
      <PageHeader
        title="Dashboard"
        description={`Real-time air quality for ${mockAqiData.location}.`}
      />
      <Suspense fallback={<InsightCardSkeleton />}>
        {loadingInsight ? <InsightCardSkeleton /> : (insight && <AqiInsightCard insightData={insight} />)}
      </Suspense>
      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <AqiSummaryCard data={mockAqiData} />
        </div>
        <div className="lg:col-span-2">
          <h2 className="text-lg font-semibold mb-4">Pollutant Breakdown</h2>
          <PollutantGrid data={mockAqiData} />
        </div>
      </div>
    </div>
  );
}
