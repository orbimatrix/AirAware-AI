
"use client";

import { AqiSummaryCard } from "@/components/dashboard/aqi-summary-card";
import { PollutantGrid } from "@/components/dashboard/pollutant-grid";
import { PageHeader } from "@/components/page-header";
import { AqiInsightCard } from "@/components/dashboard/aqi-insight-card";
import { Suspense, useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { getAirQualityInsight, AirQualityInsightOutput } from "@/ai/flows/air-quality-insights";
import { useAirQualityData } from "@/hooks/useAirQualitydata";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AqiData } from "@/lib/types";
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
    if (aqi <= 1) return { status: "Good", className: "text-green-600" };
    if (aqi <= 2) return { status: "Fair", className: "text-yellow-600" };
    if (aqi <= 3) return { status: "Moderate", className: "text-orange-600" };
    if (aqi <= 4) return { status: "Poor", className: "text-red-600" };
    return { status: "Very Poor", className: "text-purple-600" };
}

export default function DashboardPage() {
  const [insight, setInsight] = useState<AirQualityInsightOutput | null>(null);
  const [loadingInsight, setLoadingInsight] = useState(true);
  const [location, setLocation] = useState<{ lat: number; lon: number, name: string } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);

  const { data: aqData, loading: loadingAq, error: errorAq } = useAirQualityData(location?.lat ?? null, location?.lon ?? null);

  const fetchCityName = async (lat: number, lon: number) => {
    try {
        const response = await fetch(`/api/reverse-geo?lat=${lat}&lon=${lon}`);
        if (!response.ok) {
            throw new Error("Failed to fetch city name");
        }
        const data = await response.json();
        const cityName = data[0]?.name || 'Unknown Location';
        setLocation({ lat, lon, name: cityName });
    } catch (error) {
        console.error("Reverse geocoding error:", error);
        // Fallback to "your current location" if city lookup fails
        setLocation({ lat, lon, name: 'your current location' });
    }
  }

  const handleGetLocation = () => {
    setLocationError(null);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          fetchCityName(position.coords.latitude, position.coords.longitude);
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
      if (!aqData?.aqi) return;
      try {
        setLoadingInsight(true);

        // Try to get previous AQI from localStorage first
        const storageKey = `aqi_previous_${Math.round(location?.lat ?? 0)}_${Math.round(location?.lon ?? 0)}`;
        const storedPreviousAqi = localStorage.getItem(storageKey);
        let previousWeekAqi: number;

        if (storedPreviousAqi) {
          previousWeekAqi = parseFloat(storedPreviousAqi);
        } else {
          // Fallback: Use a reasonable default based on current AQI level
          // This prevents extreme percentage calculations
          if (aqData.aqi <= 50) {
            previousWeekAqi = Math.max(aqData.aqi * 0.9, 10); // Slight improvement from good level
          } else if (aqData.aqi <= 100) {
            previousWeekAqi = aqData.aqi * 0.85; // Moderate improvement
          } else if (aqData.aqi <= 150) {
            previousWeekAqi = aqData.aqi * 0.8; // Significant improvement
          } else {
            previousWeekAqi = aqData.aqi * 0.7; // Major improvement for poor AQI
          }
        }

        const insightData = await getAirQualityInsight({
          location: location?.name ?? 'your city',
          currentAqi: aqData.aqi,
          previousAqi: previousWeekAqi,
        });

        setInsight(insightData);

        // Store current AQI for next week comparison (after a delay to avoid immediate overwrite)
        setTimeout(() => {
          localStorage.setItem(storageKey, aqData.aqi.toString());
        }, 2000);

      } catch (error) {
        console.error("Failed to fetch air quality insight:", error);
      } finally {
        setLoadingInsight(false);
      }
    }
    fetchInsight();
  }, [aqData, location]);

  const transformedData: AqiData | null = aqData ? {
    location: location?.name ?? 'Your Location',
    aqi: aqData.aqi,
    status: getAqiStatus(aqData.aqi).status,
    statusClassName: getAqiStatus(aqData.aqi).className,
    pollutants: [
      { name: "PM2.5", value: Number(aqData.components.pm2_5?.toFixed(2)) ?? 0, unit: "μg/m³", Icon: Gauge },
      { name: "PM10", value: Number(aqData.components.pm10?.toFixed(2)) ?? 0, unit: "μg/m³", Icon: Gauge },
      { name: "O₃", value: Number(aqData.components.o3?.toFixed(2)) ?? 0, unit: "μg/m³", Icon: Wind },
      { name: "NO₂", value: Number(aqData.components.no2?.toFixed(2)) ?? 0, unit: "μg/m³", Icon: Wind },
      { name: "CO", value: Number(aqData.components.co?.toFixed(2)) ?? 0, unit: "μg/m³", Icon: Droplets },
      { name: "SO₂", value: Number(aqData.components.so2?.toFixed(2)) ?? 0, unit: "μg/m³", Icon: Droplets },
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
  
  const description = location 
    ? `Real-time air quality for ${location.name} (Lat: ${location.lat.toFixed(4)}, Lon: ${location.lon.toFixed(4)})`
    : "Real-time air quality for your location.";

  return (
    <div className="space-y-8">
      <PageHeader
        title="Dashboard"
        description={description}
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
