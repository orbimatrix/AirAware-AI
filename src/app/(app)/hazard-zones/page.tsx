import { HazardMap } from "@/components/hazard-zones/hazard-map";
import { PageHeader } from "@/components/page-header";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata = {
  title: "Hazard Zones",
};

function HazardMapSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-20 w-full" />
      <Skeleton className="aspect-[4/3] w-full" />
    </div>
  )
}

export default function HazardZonesPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Hazard Zones"
        description="AI-detected high-pollution areas in your vicinity."
      />
      <Suspense fallback={<HazardMapSkeleton />}>
        <HazardMap />
      </Suspense>
    </div>
  );
}
