import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ShieldAlert } from "lucide-react";
import { detectHazardZones } from "@/ai/flows/hazard-zone-detection";
import { PlaceHolderImages } from "@/lib/placeholder-images";

const hazardPoints = [
  { top: "25%", left: "40%" },
  { top: "60%", left: "70%" },
  { top: "50%", left: "20%" },
];

export async function HazardMap() {
  const hazardData = await detectHazardZones({
    location: "Lahore, Pakistan",
    airQualityData: "PM2.5: 190 μg/m³, PM10: 260 μg/m³, CO2: 1100 ppm, NO2: 50 ppb, O3: 80 ppb",
    nearbyAreas: "Gulberg (PM2.5: 150), DHA (PM2.5: 120), Model Town (PM2.5: 210)",
  });

  const mapImage = PlaceHolderImages.find((p) => p.id === "hazardMap");

  return (
    <div className="space-y-6">
      {hazardData.isHazardZone && (
        <Alert variant="destructive" className="bg-destructive/10 border-destructive/50 text-destructive-foreground">
          <ShieldAlert className="h-5 w-5 !text-destructive" />
          <AlertTitle className="font-bold">Hazard Zone Alert!</AlertTitle>
          <AlertDescription>{hazardData.recommendation}</AlertDescription>
        </Alert>
      )}
      <Card>
        <CardContent className="p-2">
          <div className="relative aspect-[4/3] w-full rounded-md overflow-hidden">
            {mapImage && (
              <Image
                src={mapImage.imageUrl}
                alt={mapImage.description}
                fill
                className="object-cover"
                data-ai-hint={mapImage.imageHint}
              />
            )}
            {hazardPoints.map((point, index) => (
              <div
                key={index}
                className="absolute w-4 h-4 rounded-full bg-red-500/50 border-2 border-white animate-pulse"
                style={{ top: point.top, left: point.left, transform: 'translate(-50%, -50%)' }}
                title="High pollution area"
              />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
