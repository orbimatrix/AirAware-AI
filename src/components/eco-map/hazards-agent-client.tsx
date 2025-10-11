'use client';

import { useActionState, useTransition } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertTriangle, Globe, Loader2, Sparkles, Wand } from 'lucide-react';
import { getHazardInfo } from '@/app/(app)/eco-map/actions';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';

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

  let parsedResult = null;
  if (state.result) {
    try {
      parsedResult = JSON.parse(state.result);
    } catch (e) {
      // If result is not JSON, treat it as a plain string.
      parsedResult = { answer: state.result, query: new FormData(document.querySelector('form')!).get('query') };
    }
  }


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
        
        {parsedResult && (
            <Card>
                <CardHeader className='flex-row items-start gap-3 space-y-0'>
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary shrink-0">
                        <Sparkles className="h-6 w-6" />
                    </div>
                    <div>
                        <CardTitle>Agent Response</CardTitle>
                        <CardDescription>
                            Hazard summary for: <span className="font-semibold italic">"{parsedResult.query}"</span>
                        </CardDescription>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    <p className="text-foreground/90 leading-relaxed">{parsedResult.answer || "The agent did not provide a textual answer."}</p>
                    
                    {parsedResult.raw?.results && parsedResult.raw.results.length > 0 && (
                        <div>
                            <Separator className="my-4" />
                            <h4 className="text-sm font-semibold text-muted-foreground mb-3">Sources Consulted</h4>
                            <div className="space-y-4">
                                {parsedResult.raw.results.map((item: any, index: number) => (
                                    <div key={index} className="text-sm border-l-2 pl-4">
                                        <a href={item.url} target="_blank" rel="noopener noreferrer" className="font-semibold text-primary hover:underline block truncate">{item.title}</a>
                                        <p className="text-muted-foreground mt-1 line-clamp-2">{item.content}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </CardContent>
                 {parsedResult.source && (
                    <CardFooter>
                        <Badge variant="outline" className="flex items-center gap-1.5">
                            <Globe className="h-3 w-3" />
                           Source: {parsedResult.source}
                        </Badge>
                    </CardFooter>
                )}
            </Card>
        )}
    </div>
  );
}
