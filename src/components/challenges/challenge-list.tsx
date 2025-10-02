"use client";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { mockChallenges } from "@/lib/data";
import { useUserScore } from "@/hooks/use-user-score";
import { useUserChallenges } from "@/hooks/use-user-challenges";
import { useToast } from "@/hooks/use-toast";
import { Check } from "lucide-react";

export function ChallengeList() {
  const { addScore } = useUserScore();
  const { acceptedChallenges, acceptChallenge } = useUserChallenges();
  const { toast } = useToast();

  const handleAcceptChallenge = (challengeId: string, points: number) => {
    acceptChallenge(challengeId);
    addScore(points);
    toast({
      title: "Challenge Accepted!",
      description: `You've earned ${points} points. Great job!`,
    });
  };

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {mockChallenges.map((challenge) => {
        const isAccepted = acceptedChallenges.includes(challenge.id);
        return (
          <Card key={challenge.id} className="flex flex-col">
            <CardHeader className="flex-row items-start gap-4 space-y-0">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <challenge.icon className="h-6 w-6" />
              </div>
              <div>
                <CardTitle>{challenge.title}</CardTitle>
                <CardDescription>{challenge.description}</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="flex-grow"></CardContent>
            <CardFooter className="flex justify-between items-center">
              <div className="font-bold text-accent">
                  {challenge.points} Points
              </div>
              <Button 
                onClick={() => handleAcceptChallenge(challenge.id, challenge.points)}
                disabled={isAccepted}
              >
                {isAccepted ? <Check className="mr-2 h-4 w-4" /> : null}
                {isAccepted ? 'Accepted' : 'Accept Challenge'}
              </Button>
            </CardFooter>
          </Card>
        )
      })}
    </div>
  );
}
