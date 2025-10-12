'use client';
import { useState, useEffect } from 'react';
import { HealthLogForm } from './health-log-form';
import { HealthLogList } from './health-log-list';
import { useHealthLog } from '@/hooks/use-health-log';
import { useAirQualityData } from '@/hooks/useAirQualitydata';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '../ui/card';
import { Skeleton } from '../ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { AlertCircle } from 'lucide-react';

export function HealthJournal() {
  const { log, addEntry } = useHealthLog();
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

  const renderContent = () => {
    if (!location && !locationError) {
      return (
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Getting Location</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Requesting your location to fetch current air quality...</p>
            <Skeleton className="h-4 w-full mt-4" />
          </CardContent>
        </Card>
      );
    }
  
    if (locationError) {
      return (
        <Alert variant="destructive" className="lg:col-span-3">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Location Error</AlertTitle>
          <AlertDescription>{locationError} <Button variant="link" onClick={handleGetLocation}>Try again</Button></AlertDescription>
        </Alert>
      );
    }

    if (loadingAq) {
        return (
            <>
                <div className="lg:col-span-1">
                    <Card>
                        <CardHeader>
                            <Skeleton className="h-6 w-3/4" />
                            <Skeleton className="h-4 w-full" />
                        </CardHeader>
                        <CardContent><Skeleton className="h-24 w-full" /></CardContent>
                        <CardFooter><Skeleton className="h-10 w-full" /></CardFooter>
                    </Card>
                </div>
                 <div className="lg:col-span-2">
                    <Card>
                        <CardHeader>
                            <Skeleton className="h-6 w-1/2" />
                            <Skeleton className="h-4 w-3/4" />
                        </CardHeader>
                        <CardContent><Skeleton className="h-48 w-full" /></CardContent>
                    </Card>
                </div>
            </>
        )
    }

    if (errorAq) {
        return (
            <Alert variant="destructive" className="lg:col-span-3">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Air Quality Error</AlertTitle>
                <AlertDescription>{errorAq}</AlertDescription>
            </Alert>
        )
    }

    const currentAqi = Math.round(aqData?.aqi || 0);

    return (
      <>
        <div className="lg:col-span-1">
          <HealthLogForm onAddEntry={addEntry} currentAqi={currentAqi} />
        </div>
        <div className="lg:col-span-2">
          <HealthLogList log={log} />
        </div>
      </>
    );
  };


  return (
    <div className="grid gap-12 lg:grid-cols-3">
      {renderContent()}
    </div>
  );
}
