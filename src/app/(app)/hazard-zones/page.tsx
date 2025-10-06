import { HazardMapClient } from "@/components/hazard-zones/HazardMapClient";
import { PageHeader } from "@/components/page-header";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata = {
  title: "Hazard Zones",
};

function HazardMapSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-[600px] w-full" />
    </div>
  )
}

export default function HazardZonesPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Real-Time Hazard Map"
        description="Live map showing real-time environmental hazards like wildfires. Data sourced from NASA FIRMS."
      />
      <Suspense fallback={<HazardMapSkeleton />}>
        <HazardMapClient />
      </Suspense>
    </div>
  );
}
