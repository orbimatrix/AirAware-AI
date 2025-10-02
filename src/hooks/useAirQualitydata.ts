// src/hooks/useAirQualityData.ts or src/data.ts
import { useState, useEffect } from 'react';

interface AirQualityData {
  source: string;
  location: { id: number; name: string; coordinates: { latitude: number; longitude: number } };
  measurements: any[]; // Define a more specific type based on OpenAQ response
  aqi: {
    overall: number;
    dominantPollutant: string | null;
    byPollutant: any; // Define a more specific type
    method: string;
  };
  rawLocationLatest: any; // Define a more specific type
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
        const response = await fetch(`/api/openaq?lat=${lat}&lon=${lon}`);
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch air quality data');
        }
        const result: AirQualityData = await response.json();
        setData(result);
      } catch (err) {
        setError(String(err));
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
