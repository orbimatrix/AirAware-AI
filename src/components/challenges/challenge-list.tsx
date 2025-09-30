import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { mockChallenges } from "@/lib/data";

export function ChallengeList() {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      {mockChallenges.map((challenge) => (
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
            <Button>Accept Challenge</Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
