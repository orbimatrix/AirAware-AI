"use client";

import { AqiSummaryCard } from "@/components/dashboard/aqi-summary-card";
import { PollutantGrid } from "@/components/dashboard/pollutant-grid";
import { PageHeader } from "@/components/page-header";
import { mockAqiData } from "@/lib/data";
import { AqiInsightCard } from "@/components/dashboard/aqi-insight-card";
import { Suspense, useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { getAirQualityInsight, AirQualityInsightOutput } from "@/ai/flows/air-quality-insights";
import { useAirQualityData } from "@/hooks/useAirQualitydata";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AqiData, Pollutant } from "@/lib/types";
import { Wind, Gauge, Droplets } from "lucide-react";


function InsightCardSkeleton() {
  return <Skeleton className="h-24 w-full" />;
}

function DashboardSkeleton() {
    return (
        <div className="space-y-8">
            <Skeleton className="h-10 w-1/2" />
            <Skeleton className="h-24 w-full" />
            <div className="grid gap-8 lg:grid-cols-3">
                <div className="lg:col-span-1">
                    <Skeleton className="h-48 w-full" />
                </div>
                <div className="lg:col-span-2">
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        <Skeleton className="h-24 w-full" />
                        <Skeleton className="h-24 w-full" />
                        <Skeleton className="h-24 w-full" />
                        <Skeleton className="h-24 w-full" />
                        <Skeleton className="h-24 w-full" />
                        <Skeleton className="h-24 w-full" />
                    </div>
                </div>
            </div>
        </div>
    )
}

function getAqiStatus(aqi: number) {
    if (aqi <= 50) return { status: "Good", className: "text-green-600" };
    if (aqi <= 100) return { status: "Moderate", className: "text-yellow-600" };
    if (aqi <= 150) return { status: "Unhealthy for Sensitive Groups", className: "text-orange-600" };
    if (aqi <= 200) return { status: "Unhealthy", className: "text-red-600" };
    if (aqi <= 300) return { status: "Very Unhealthy", className: "text-purple-600" };
    return { status: "Hazardous", className: "text-maroon-600" };
}

export default function DashboardPage() {
  const [insight, setInsight] = useState<AirQualityInsightOutput | null>(null);
  const [loadingInsight, setLoadingInsight] = useState(true);
  const [location, setLocation] = useState<{ lat: number; lon: number } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);

  const { data: aqData, loading: loadingAq, error: errorAq } = useAirQualityData(location?.lat ?? null, location?.lon ?? null);

  const handleGetLocation = () => {
    setLocationError(null);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lon: position.coords.longitude,
          });
        },
        (error) => {
          setLocationError(`Error: ${error.message}. Please enable location services.`);
        }
      );
    } else {
      setLocationError("Geolocation is not supported by this browser.");
    }
  };

  useEffect(() => {
    handleGetLocation();
  }, []);

  useEffect(() => {
    async function fetchInsight() {
      if (!aqData?.aqi.overall) return;
      try {
        setLoadingInsight(true);
        // In a real app, you'd fetch the previous week's AQI from a database.
        const previousWeekAqi = 225;
        const insightData = await getAirQualityInsight({
          location: aqData.location.name,
          currentAqi: aqData.aqi.overall,
          previousAqi: previousWeekAqi,
        });
        setInsight(insightData);
      } catch (error) {
        console.error("Failed to fetch air quality insight:", error);
      } finally {
        setLoadingInsight(false);
      }
    }
    fetchInsight();
  }, [aqData]);

  const transformedData: AqiData | null = aqData ? {
    location: aqData.location.name,
    aqi: aqData.aqi.overall,
    status: getAqiStatus(aqData.aqi.overall).status,
    statusClassName: getAqiStatus(aqData.aqi.overall).className,
    pollutants: [
      { name: "PM2.5", value: aqData.measurements.pm25?.toFixed(2) ?? 0, unit: "μg/m³", Icon: Gauge },
      { name: "PM10", value: aqData.measurements.pm10?.toFixed(2) ?? 0, unit: "μg/m³", Icon: Gauge },
      { name: "O₃", value: aqData.measurements.o3?.toFixed(2) ?? 0, unit: "ppb", Icon: Wind },
      { name: "NO₂", value: aqData.measurements.no2?.toFixed(2) ?? 0, unit: "ppb", Icon: Wind },
      { name: "CO", value: aqData.measurements.co?.toFixed(2) ?? 0, unit: "ppm", Icon: Droplets },
      { name: "SO₂", value: aqData.measurements.so2?.toFixed(2) ?? 0, unit: "ppb", Icon: Droplets },
    ].filter(p => p.value > 0),
  } : null;

  if (!location && !locationError) {
      return (
        <div className="flex items-center justify-center h-64">
            <p>Getting your location...</p>
        </div>
      )
  }
  
  if (locationError) {
    return (
        <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Location Error</AlertTitle>
            <AlertDescription>{locationError} <Button variant="link" onClick={handleGetLocation}>Try again</Button></AlertDescription>
        </Alert>
    )
  }

  if (loadingAq && !aqData) {
      return <DashboardSkeleton />;
  }

  if (errorAq) {
      return (
        <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Air Quality Error</AlertTitle>
            <AlertDescription>{errorAq}</AlertDescription>
        </Alert>
      )
  }


  if (!transformedData) {
    return (
        <div className="flex items-center justify-center h-64">
            <p>No air quality data available for your location.</p>
        </div>
      )
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="Dashboard"
        description={`Real-time air quality for ${transformedData.location}.`}
      />
      <Suspense fallback={<InsightCardSkeleton />}>
        {loadingInsight ? <InsightCardSkeleton /> : (insight && <AqiInsightCard insightData={insight} />)}
      </Suspense>
      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <AqiSummaryCard data={transformedData} />
        </div>
        <div className="lg:col-span-2">
          <h2 className="text-lg font-semibold mb-4">Pollutant Breakdown</h2>
          <PollutantGrid data={transformedData} />
        </div>
      </div>
    </div>
  );
}
