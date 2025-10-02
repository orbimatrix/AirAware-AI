
'use client';

import { Card, CardContent } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { mockBadges } from "@/lib/data";
import { useUserScore } from "@/hooks/use-user-score";
import { cn } from "@/lib/utils";

export function MyBadges() {
  const { score } = useUserScore();
  
  return (
    <Card>
        <CardContent className="p-6">
            <TooltipProvider>
                <div className="flex flex-wrap gap-4">
                {mockBadges.map(badge => {
                    const isUnlocked = score >= badge.pointsToUnlock;
                    return (
                        <Tooltip key={badge.id}>
                        <TooltipTrigger asChild>
                            <div className={cn(
                                "flex h-20 w-20 items-center justify-center rounded-full border-2 transition-all duration-300",
                                isUnlocked 
                                    ? "bg-accent/20 text-accent border-accent/30 hover:bg-accent/30 cursor-pointer"
                                    : "bg-muted/50 text-muted-foreground border-dashed"
                            )}>
                                <badge.icon className="h-10 w-10" />
                            </div>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p className="font-bold">{badge.name}</p>
                            <p>{badge.description}</p>
                            {!isUnlocked && <p className="text-xs text-muted-foreground">Unlock at {badge.pointsToUnlock} points</p>}
                        </TooltipContent>
                        </Tooltip>
                    )
                })}
                </div>
            </TooltipProvider>
      </CardContent>
    </Card>
  );
}
