'use client'

import { useFormStatus } from 'react-dom';
import { useActionState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Footprints, Leaf, Loader2, Sparkles, Info, LineChart } from 'lucide-react';
import { getWeeklyFootprint } from '@/app/(app)/carbon-footprint/actions';
import { HistoryChart } from './history-chart';
import { useFootprintHistory } from '@/hooks/use-footprint-history';

type FormData = {
  transport: number;
  energy: number;
  diet: number;
  consumption: number;
};

const labels = {
    transport: ['Rarely use vehicles', 'Daily short commutes', 'Daily long commutes'],
    energy: ['Minimal usage', 'Average usage', 'High usage'],
    diet: ['Vegan/Vegetarian', 'Occasional meat', 'Daily meat'],
    consumption: ['Minimalist', 'Average shopper', 'Frequent shopper'],
}

function CalculatorSlider({ name, label, control, categoryLabels }: { name: keyof FormData, label: string, control: any, categoryLabels: string[] }) {
    return (
        <Controller
            name={name}
            control={control}
            render={({ field }) => (
                <div className="space-y-3">
                    <Label htmlFor={name} className="text-base">{label}</Label>
                    <Slider
                        id={name}
                        min={0}
                        max={100}
                        step={1}
                        value={[field.value]}
                        onValueChange={(vals) => field.onChange(vals[0])}
                        name={field.name}
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                        <span>{categoryLabels[0]}</span>
                        <span>{categoryLabels[1]}</span>
                        <span>{categoryLabels[2]}</span>
                    </div>
                </div>
            )}
        />
    );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
      Calculate My Weekly Footprint
    </Button>
  );
}

export function CalculatorForm() {
  const form = useForm<FormData>({
    defaultValues: {
      transport: 50,
      energy: 50,
      diet: 50,
      consumption: 50,
    },
  });
  const { control } = form;

  const initialState = { data: null, error: null };
  const [state, formAction] = useActionState(getWeeklyFootprint, initialState);
  
  const { history, addEntry } = useFootprintHistory();

  useEffect(() => {
    if (state.data) {
      addEntry({
        date: new Date().toISOString().split('T')[0],
        footprint: state.data.weeklyFootprint,
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.data]);


  return (
    <div className="space-y-8">
        <div className="grid gap-8 lg:grid-cols-2">
            <Card>
                <form action={formAction}>
                    <CardHeader>
                        <CardTitle>Lifestyle Inputs</CardTitle>
                        <CardDescription>Adjust the sliders to reflect your daily habits.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-8">
                        <CalculatorSlider name="transport" label="Daily Commute & Travel" control={control} categoryLabels={labels.transport} />
                        <CalculatorSlider name="energy" label="Home Energy Usage" control={control} categoryLabels={labels.energy} />
                        <CalculatorSlider name="diet" label="Dietary Habits" control={control} categoryLabels={labels.diet} />
                        <CalculatorSlider name="consumption" label="Shopping & Consumption" control={control} categoryLabels={labels.consumption} />
                    </CardContent>
                    <CardFooter className="flex-col items-start gap-4">
                        <SubmitButton />
                        {state?.error && <p className="text-sm text-destructive">{state.error}</p>}
                    </CardFooter>
                </form>
            </Card>
            
            <div className="flex items-center justify-center">
                {state?.data ? (
                    <Card className="w-full bg-primary/10 border-primary/20">
                        <CardHeader className="items-center text-center">
                            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/20 text-primary mb-4">
                                <Footprints className="h-8 w-8" />
                            </div>
                            <CardTitle className="text-2xl">Your Estimated Weekly Footprint</CardTitle>
                        </CardHeader>
                        <CardContent className="text-center">
                            <p className="text-6xl font-bold text-primary tracking-tight">{state.data.weeklyFootprint.toFixed(1)}</p>
                            <p className="text-muted-foreground">kg CO₂ equivalent</p>
                            <div className="mt-6 space-y-2 text-sm text-foreground/80 text-left">
                                {state.data.tips.map((tip, index) => (
                                    <p key={index} className="flex items-start gap-3">
                                        <Leaf className="h-4 w-4 text-primary mt-1 shrink-0" /> 
                                        <span>{tip}</span>
                                    </p>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="flex h-full w-full min-h-[400px] flex-col items-center justify-center rounded-lg border-2 border-dashed bg-card p-8 text-center">
                        <Info className="h-10 w-10 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-semibold text-foreground">Your AI-powered estimate will appear here.</h3>
                        <p className="text-sm text-muted-foreground">Adjust the sliders and click calculate.</p>
                    </div>
                )}
            </div>
        </div>
        
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <LineChart className="h-6 w-6" />
                    Your Progress
                </CardTitle>
                <CardDescription>
                    Here is your weekly carbon footprint over time.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <HistoryChart data={history} />
            </CardContent>
        </Card>
    </div>
  );
}
