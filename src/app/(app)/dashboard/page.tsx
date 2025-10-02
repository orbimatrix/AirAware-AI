import { AqiSummaryCard } from "@/components/dashboard/aqi-summary-card";
import { PollutantGrid } from "@/components/dashboard/pollutant-grid";
import { PageHeader } from "@/components/page-header";
import { mockAqiData } from "@/lib/data";
import { AqiInsightCard } from "@/components/dashboard/aqi-insight-card";
import { Suspense, useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { useAirQualityData } from "@/hooks/useAirQualitydata";


function InsightCardSkeleton() {
  return <Skeleton className="h-24 w-full" />;
}

export default function DashboardPage() {

  const [userLocation, setUserLocation] = useState<{ lat: number; lon: number } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);

  // Get user location on component mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lon: position.coords.longitude,
          });
        },
        (error) => {
          console.error('Error getting user location:', error);
          setLocationError('Unable to retrieve your location. Please enable location services.');
        }
      );
    } else {
      setLocationError('Geolocation is not supported by your browser.');
    }
  }, []); // Empty dependency array ensures this runs only once on mount

  // Fetch air quality data using the custom hook
  const { data: aqiData, loading: aqiLoading, error: aqiError } = useAirQualityData(userLocation?.lat ?? null, userLocation?.lon ?? null);

  // Determine the description for the header
  const headerDescription = aqiData ? `Real-time air quality for ${aqiData.location.name}.` :
                          aqiLoading ? 'Fetching real-time air quality data...' :
                          locationError ? locationError :
                          'Waiting for location access to fetch air quality data.';
//   return (
//     <div className="space-y-8">
//       <PageHeader
//         title="Dashboard"
//         description={`Real-time air quality for ${mockAqiData.location}.`}
//       />
//       <Suspense fallback={<InsightCardSkeleton />}>
//         <AqiInsightCard />
//       </Suspense>
//       <div className="grid gap-8 lg:grid-cols-3">
//         <div className="lg:col-span-1">
//           <AqiSummaryCard data={mockAqiData} />
//         </div>
//         <div className="lg:col-span-2">
//           <h2 className="text-lg font-semibold mb-4">Pollutant Breakdown</h2>
//           <PollutantGrid data={mockAqiData} />
//         </div>
//       </div>
//     </div>
//   );
// }
return (
  <div className="space-y-8">
    <PageHeader
      title="Dashboard"
      description={headerDescription}
    />

    {/* Handle Loading and Error states for AQI Data */}
    {locationError && <div className="text-red-500">{locationError}</div>}
    {aqiError && <div className="text-red-500">Error fetching air quality data: {aqiError}</div>}

    {(aqiLoading || !aqiData) && !locationError && !aqiError && (
      // Show skeletons or a loading message while fetching
      <>
        <InsightCardSkeleton />
        <div className="grid gap-8 lg:grid-cols-3">
           <div className="lg:col-span-1">
             {/* You might want a skeleton for AqiSummaryCard too */}
             Loading Summary...
           </div>
           <div className="lg:col-span-2">
             <h2 className="text-lg font-semibold mb-4">Pollutant Breakdown</h2>
             {/* You might want a skeleton for PollutantGrid too */}
             Loading Pollutants...
           </div>
         </div>
      </>
    )}

    {/* Render data when available */}
    {aqiData && (
      <>
        <Suspense fallback={<InsightCardSkeleton />}>
          {/* Pass relevant data to AqiInsightCard */}
          <AqiInsightCard aqiData={aqiData} /> {/* You'll need to update AqiInsightCard to accept aqiData prop */}
        </Suspense>
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-1">
            {/* Pass data to AqiSummaryCard */}
            <AqiSummaryCard data={aqiData} /> {/* Update AqiSummaryCard to accept this data structure */}
          </div>
          <div className="lg:col-span-2">
            <h2 className="text-lg font-semibold mb-4">Pollutant Breakdown</h2>
            {/* Pass data to PollutantGrid */}
            <PollutantGrid data={aqiData} /> {/* Update PollutantGrid to accept this data structure */}
          </div>
        </div>
      </>
    )}
  </div>
);
}
