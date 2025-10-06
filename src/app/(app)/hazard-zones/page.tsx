import { HazardMapClient } from "@/components/hazard-zones/HazardMapClient";
import { PageHeader } from "@/components/page-header";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info } from "lucide-react";

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
      <Alert>
        <Info className="h-4 w-4" />
        <AlertTitle>API Key Required</AlertTitle>
        <AlertDescription>
          This feature requires a NASA FIRMS API key. Please add your key as `NEXT_PUBLIC_NASA_API_KEY` to your environment variables to view wildfire data.
        </AlertDescription>
      </Alert>
      <Suspense fallback={<HazardMapSkeleton />}>
        <HazardMapClient />
      </Suspense>
    </div>
  );
}
