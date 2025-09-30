'use client';

import { useFormStatus } from 'react-dom';
import { useActionState, useEffect } from 'react';
import { getHealthRecommendation } from '@/app/(app)/recommendations/actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { HeartPulse, Info, Loader2, Sparkles, Terminal } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
      Get My Recommendation
    </Button>
  );
}

export function HealthForm() {
  const initialState = { data: null, error: null };
  const [state, formAction] = useActionState(getHealthRecommendation, initialState);
  const { toast } = useToast();

  useEffect(() => {
    if (state.data?.shouldAlert) {
      toast({
        title: 'Health Alert!',
        description: state.data.recommendation,
        variant: 'destructive',
        duration: 9000,
      });
    }
  }, [state.data, toast]);

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <Card>
        <form action={formAction}>
          <CardHeader>
            <CardTitle>Your Health Profile</CardTitle>
            <CardDescription>
              Provide some basic health information for personalized advice. This data is not stored.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="age">Age</Label>
              <Input id="age" name="age" type="number" placeholder="e.g., 35" required />
            </div>
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div className="space-y-0.5">
                <Label htmlFor="respiratoryIssues">Do you have any respiratory issues (e.g., asthma)?</Label>
              </div>
              <Switch id="respiratoryIssues" name="respiratoryIssues" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="otherConditions">Other Health Conditions (optional)</Label>
              <Textarea
                id="otherConditions"
                name="otherConditions"
                placeholder="e.g., allergies, heart condition"
              />
            </div>
          </CardContent>
          <CardFooter className="flex-col items-start gap-4">
            <SubmitButton />
            {state.error && <p className="text-sm text-destructive">{state.error}</p>}
          </CardFooter>
        </form>
      </Card>
      
      <div className="space-y-4">
        {state.data ? (
          <Card className={cn(
            "border-primary/50 bg-primary/10",
            state.data.shouldAlert && "border-destructive/50 bg-destructive/10"
            )}>
            <CardHeader className="flex-row items-start gap-4 space-y-0">
               <div className={cn(
                  "flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary",
                  state.data.shouldAlert && "bg-destructive/20 text-destructive"
                )}>
                  <HeartPulse className="h-6 w-6" />
                </div>
              <div>
                <CardTitle className="font-headline">Your AI-Powered Health Tip</CardTitle>
                <CardDescription>Based on today's air quality</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-lg font-medium text-foreground">{state.data.recommendation}</p>
            </CardContent>
          </Card>
        ) : (
          <div className="flex h-full min-h-[200px] flex-col items-center justify-center rounded-lg border-2 border-dashed bg-card p-8 text-center">
            <Info className="h-10 w-10 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold text-foreground">Your recommendation will appear here.</h3>
            <p className="text-sm text-muted-foreground">Fill out the form to get started.</p>
          </div>
        )}
      </div>
    </div>
  );
}
