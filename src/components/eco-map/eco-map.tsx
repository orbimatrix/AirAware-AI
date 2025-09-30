import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { mockEcoReports } from "@/lib/data";

export function EcoMap() {
  const mapImage = PlaceHolderImages.find((p) => p.id === "hazardMap");

  return (
    <Card>
      <CardHeader>
        <CardTitle>Crowdsourced Reports</CardTitle>
        <CardDescription>Hover over a pin to see community reports.</CardDescription>
      </CardHeader>
      <CardContent className="p-2">
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
                {mockEcoReports.map((report) => (
                <Tooltip key={report.id}>
                    <TooltipTrigger asChild>
                        <div
                            className="absolute w-8 h-8 rounded-full bg-accent/80 border-2 border-white flex items-center justify-center cursor-pointer hover:scale-110 transition-transform"
                            style={{ top: report.position.top, left: report.position.left, transform: 'translate(-50%, -50%)' }}
                        >
                            <report.icon className="h-4 w-4 text-accent-foreground" />
                        </div>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p className="font-bold">{report.type}</p>
                        <p>{report.description}</p>
                    </TooltipContent>
                </Tooltip>
                ))}
            </div>
        </TooltipProvider>
      </CardContent>
    </Card>
  );
}
