import { AqiSummaryCard } from "@/components/dashboard/aqi-summary-card";
import { PollutantGrid } from "@/components/dashboard/pollutant-grid";
import { PageHeader } from "@/components/page-header";
import { mockAqiData } from "@/lib/data";
import { AqiInsightCard } from "@/components/dashboard/aqi-insight-card";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";

function InsightCardSkeleton() {
  return <Skeleton className="h-24 w-full" />;
}

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Dashboard"
        description={`Real-time air quality for ${mockAqiData.location}.`}
      />
      <Suspense fallback={<InsightCardSkeleton />}>
        <AqiInsightCard />
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
