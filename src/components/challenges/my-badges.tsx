import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { mockBadges, mockLeaderboard } from "@/lib/data";

export function MyBadges() {
  const currentUser = mockLeaderboard.find(user => user.name === 'You');
  const earnedBadges = mockBadges.filter(badge => currentUser?.earnedBadges?.includes(badge.id));

  if (earnedBadges.length === 0) {
    return (
        <Card className="flex items-center justify-center h-32 border-2 border-dashed">
            <p className="text-muted-foreground">Complete challenges to earn badges!</p>
        </Card>
    )
  }

  return (
    <Card>
        <CardContent className="p-6">
            <TooltipProvider>
                <div className="flex flex-wrap gap-4">
                {earnedBadges.map(badge => (
                    <Tooltip key={badge.id}>
                    <TooltipTrigger asChild>
                        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-accent/20 text-accent border-2 border-accent/30 hover:bg-accent/30 cursor-pointer transition-colors">
                            <badge.icon className="h-10 w-10" />
                        </div>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p className="font-bold">{badge.name}</p>
                        <p>{badge.description}</p>
                    </TooltipContent>
                    </Tooltip>
                ))}
                </div>
            </TooltipProvider>
      </CardContent>
    </Card>
  );
}
