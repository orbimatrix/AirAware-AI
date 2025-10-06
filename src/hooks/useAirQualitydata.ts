
// src/hooks/useAirQualityData.ts
import { useState, useEffect } from 'react';

// According to Open-Meteo response structure
interface AirQualityData {
  aqi: number;
  components: {
    co?: number;
    no2?: number;
    o3?: number;
    so2?: number;
    pm2_5?: number;
    pm10?: number;
  };
  dt: number;
}

interface UseAirQualityDataResult {
  data: AirQualityData | null;
  loading: boolean;
  error: string | null;
}

export function useAirQualityData(lat: number | null, lon: number | null): UseAirQualityDataResult {
  const [data, setData] = useState<AirQualityData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!lat || !lon) {
      setData(null);
      setError(null);
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/air-quality?lat=${lat}&lon=${lon}`);
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch air quality data');
        }
        const result = await response.json();
        if (result.list && result.list.length > 0) {
            const apiData = result.list[0];
            setData({
                aqi: apiData.main.aqi ?? 0,
                components: apiData.components ?? {},
                dt: apiData.dt ?? 0
            });
        } else {
            throw new Error("No air quality data found for the location.")
        }
      } catch (err: any) {
        setError(err.message || 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Optional: Implement periodic refetching
    const intervalId = setInterval(fetchData, 5 * 60 * 1000); // Refetch every 5 minutes
    return () => clearInterval(intervalId); // Clean up interval on unmount

  }, [lat, lon]); // Refetch when lat or lon changes

  return { data, loading, error };
}
