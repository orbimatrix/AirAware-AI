import { AqiSummaryCard } from "@/components/dashboard/aqi-summary-card";
import { PollutantGrid } from "@/components/dashboard/pollutant-grid";
import { PageHeader } from "@/components/page-header";
import { mockAqiData } from "@/lib/data";
import { Separator } from "@/components/ui/separator";

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Dashboard"
        description={`Real-time air quality for ${mockAqiData.location}.`}
      />
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
