'use client';

import { useActionState, useTransition } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertTriangle, Loader2, Sparkles, Wand } from 'lucide-react';
import { getHazardInfo } from '@/app/(app)/eco-map/actions';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';

function SubmitButton({ isSubmitting }: { isSubmitting: boolean }) {
  return (
    <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
      {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand className="mr-2 h-4 w-4" />}
      Ask Agent
    </Button>
  );
}

export function HazardsAgentClient() {
  const [isPending, startTransition] = useTransition();
  const initialState = { result: null, error: null };
  const [state, formAction] = useActionState(getHazardInfo, initialState);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    startTransition(() => {
        formAction(formData);
    });
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
        <Card>
            <form onSubmit={handleSubmit}>
                <CardHeader>
                    <CardTitle>Query the Hazard Agent</CardTitle>
                    <CardDescription>Ask for real-time environmental hazards. For example: "Show current hazards in Karachi, Pakistan" or "Are there any wildfires in California right now?".</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="query">Your Question</Label>
                            <div className="flex flex-col sm:flex-row gap-2">
                                <Input 
                                    id="query" 
                                    name="query"
                                    placeholder="e.g., Show current hazards in Karachi, Pakistan"
                                    defaultValue="Show current hazards in Karachi, Pakistan"
                                />
                                <SubmitButton isSubmitting={isPending} />
                            </div>
                        </div>
                    </div>
                </CardContent>
            </form>
        </Card>

        {isPending && (
            <Card className="flex items-center justify-center p-12">
                <div className="text-center space-y-3">
                    <Loader2 className="h-8 w-8 text-primary animate-spin mx-auto" />
                    <p className="font-semibold">Agent is thinking...</p>
                    <p className="text-sm text-muted-foreground">Fetching and analyzing real-time data.</p>
                </div>
            </Card>
        )}

        {state.error && (
             <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Agent Error</AlertTitle>
                <AlertDescription>{state.error}</AlertDescription>
            </Alert>
        )}
        
        {state.result && (
            <Card>
                <CardHeader className='flex-row items-start gap-3 space-y-0'>
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary shrink-0">
                        <Sparkles className="h-6 w-6" />
                    </div>
                    <div>
                        <CardTitle>Agent Response</CardTitle>
                        <CardDescription>Here is the hazard summary based on your query.</CardDescription>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="prose prose-sm dark:prose-invert max-w-none">
                        <pre className="whitespace-pre-wrap bg-muted p-4 rounded-md text-foreground">{state.result}</pre>
                    </div>
                </CardContent>
            </Card>
        )}
    </div>
  );
}
