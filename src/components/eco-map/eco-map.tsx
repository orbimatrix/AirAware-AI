"use client";

import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { useEcoReports } from "@/hooks/use-eco-reports";
import { Skeleton } from "../ui/skeleton";
import * as LucideIcons from "lucide-react";
import { cn } from "@/lib/utils";

const severityColorMap = {
    Low: "bg-green-500/80",
    Medium: "bg-yellow-500/80",
    High: "bg-red-500/80",
};

function MapSkeleton() {
    return <Skeleton className="aspect-[4/3] w-full" />
}

export function EcoMap() {
  const { reports, loading } = useEcoReports();
  const mapImage = PlaceHolderImages.find((p) => p.id === "hazardMap");

  // Calculate pixel positions based on lat/lng.
  // This is a simple approximation and may need refinement for a real map.
  const getPosition = (lat: number, lng: number) => {
    const mapLatStart = 31.6; // Approx top lat of Lahore
    const mapLatEnd = 31.3;   // Approx bottom lat of Lahore
    const mapLngStart = 74.1; // Approx left lng of Lahore
    const mapLngEnd = 74.5;   // Approx right lng of Lahore

    const top = ((mapLatStart - lat) / (mapLatStart - mapLatEnd)) * 100;
    const left = ((lng - mapLngStart) / (mapLngEnd - mapLngStart)) * 100;
    
    return { top: `${top}%`, left: `${left}%` };
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Crowdsourced Reports</CardTitle>
        <CardDescription>Hover over a pin to see community reports. Updates in real-time.</CardDescription>
      </CardHeader>
      <CardContent className="p-2">
        {loading ? <MapSkeleton /> : (
            <TooltipProvider>
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
                    {reports.map((report) => {
                        const position = getPosition(report.position.lat, report.position.lng);
                        const Icon = LucideIcons[report.iconName as keyof typeof LucideIcons] || LucideIcons.AlertCircle;
                        const colorClass = severityColorMap[report.severity] || "bg-gray-500/80";
                        return (
                            <Tooltip key={report.id}>
                                <TooltipTrigger asChild>
                                    <div
                                        className={cn("absolute w-8 h-8 rounded-full border-2 border-white flex items-center justify-center cursor-pointer hover:scale-110 transition-transform", colorClass)}
                                        style={{ top: position.top, left: position.left, transform: 'translate(-50%, -50%)' }}
                                    >
                                        <Icon className="h-4 w-4 text-white" />
                                    </div>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p className="font-bold">{report.type}</p>
                                    <p>{report.description}</p>
                                    <p className="text-xs text-muted-foreground mt-1">Severity: {report.severity}</p>
                                </TooltipContent>
                            </Tooltip>
                        )
                    })}
                </div>
            </TooltipProvider>
        )}
      </CardContent>
    </Card>
  );
}
