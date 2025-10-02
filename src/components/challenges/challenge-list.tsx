
"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { mockChallenges } from "@/lib/data";
import { useUserScore } from "@/hooks/use-user-score";
import { useUserChallenges } from "@/hooks/use-user-challenges";
import { useToast } from "@/hooks/use-toast";
import { Check, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Textarea } from "../ui/textarea";
import { Label } from "../ui/label";
import type { Challenge } from "@/lib/types";

export function ChallengeList() {
  const { addScore } = useUserScore();
  const { acceptedChallenges, acceptChallenge } = useUserChallenges();
  const { toast } = useToast();
  const [openDialogs, setOpenDialogs] = useState<Record<string, boolean>>({});
  const [completionNote, setCompletionNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleOpenChange = (challengeId: string, isOpen: boolean) => {
    setOpenDialogs(prev => ({ ...prev, [challengeId]: isOpen }));
    if (!isOpen) {
      setCompletionNote(""); // Reset note when dialog closes
      setIsSubmitting(false);
    }
  };

  const handleConfirmCompletion = (challenge: Challenge) => {
    if (completionNote.trim().length < 10) {
        toast({
            title: "Description too short",
            description: "Please briefly describe how you completed the challenge (min. 10 characters).",
            variant: "destructive",
        });
        return;
    }

    setIsSubmitting(true);

    // Simulate a short delay for UX
    setTimeout(() => {
        acceptChallenge(challenge.id, completionNote);
        addScore(challenge.points);
        toast({
        title: "Challenge Completed!",
        description: `You've earned ${challenge.points} points. Great job!`,
        });
        setIsSubmitting(false);
        handleOpenChange(challenge.id, false);
    }, 500);
  };

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {mockChallenges.map((challenge) => {
        const isAccepted = acceptedChallenges.some(c => c.id === challenge.id);
        return (
          <Dialog key={challenge.id} open={openDialogs[challenge.id] || false} onOpenChange={(isOpen) => handleOpenChange(challenge.id, isOpen)}>
            <Card className="flex flex-col">
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
                {isAccepted ? (
                   <Button disabled>
                        <Check className="mr-2 h-4 w-4" />
                        Completed
                    </Button>
                ) : (
                    <DialogTrigger asChild>
                        <Button>
                            Accept Challenge
                        </Button>
                    </DialogTrigger>
                )}
              </CardFooter>
            </Card>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Confirm Challenge Completion</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <p>To complete the <span className="font-semibold text-primary">{challenge.title}</span> challenge, please confirm your action by briefly describing what you did.</p>
                    <div className="space-y-2">
                        <Label htmlFor={`completion-note-${challenge.id}`}>Your note:</Label>
                        <Textarea 
                            id={`completion-note-${challenge.id}`}
                            placeholder="e.g., I planted a lemon tree in my community garden."
                            value={completionNote}
                            onChange={(e) => setCompletionNote(e.target.value)}
                        />
                    </div>
                </div>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="outline">Cancel</Button>
                    </DialogClose>
                    <Button onClick={() => handleConfirmCompletion(challenge)} disabled={isSubmitting}>
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Confirm & Claim {challenge.points} Points
                    </Button>
                </DialogFooter>
            </DialogContent>
          </Dialog>
        )
      })}
    </div>
  );
}
