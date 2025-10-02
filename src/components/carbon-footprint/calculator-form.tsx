
'use client'

import { useActionState, useEffect, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Footprints, Leaf, Loader2, Sparkles, Info, LineChart, Home, Car, Utensils, Trash2, Hotel, Plane, ShoppingCart, Video, Computer } from 'lucide-react';
import { getWeeklyFootprint } from '@/app/(app)/carbon-footprint/actions';
import { HistoryChart } from './history-chart';
import { useFootprintHistory } from '@/hooks/use-footprint-history';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../ui/accordion';
import { Form, FormControl, FormField, FormItem, FormMessage, FormDescription } from '../ui/form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useUserScore } from '@/hooks/use-user-score';
import { toast } from '@/hooks/use-toast';

const CarbonFootprintCalculatorInputSchema = z.object({
  householdSize: z.coerce.number().min(1, 'Must be at least 1.'),
  electricityKwh: z.coerce.number().min(0),
  naturalGasM3: z.coerce.number().min(0),
  heatingOilL: z.coerce.number().min(0),
  carKm: z.coerce.number().min(0),
  carFuelType: z.enum(['petrol', 'diesel', 'electric']),
  carFuelEconomy: z.coerce.number().min(0, "Can't be negative."),
  flightsShort: z.coerce.number().min(0),
  flightsLong: z.coerce.number().min(0),
  diet: z.enum(['vegan', 'vegetarian', 'pescatarian', 'omnivore', 'omnivore_high_meat']),
  wasteKg: z.coerce.number().min(0, "Can't be negative."),
});


type FormValues = z.infer<typeof CarbonFootprintCalculatorInputSchema>;


function SubmitButton({ isSubmitting }: { isSubmitting: boolean }) {
  return (
    <Button type="submit" disabled={isSubmitting} className="w-full" size="lg">
      {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
      Calculate My Annual Footprint
    </Button>
  );
}

export function CalculatorForm() {
  const form = useForm<FormValues>({
    resolver: zodResolver(CarbonFootprintCalculatorInputSchema),
    defaultValues: {
      householdSize: 1,
      electricityKwh: 250,
      naturalGasM3: 50,
      heatingOilL: 0,
      carKm: 400,
      carFuelType: 'petrol',
      carFuelEconomy: 8,
      flightsShort: 1,
      flightsLong: 0,
      diet: 'omnivore',
      wasteKg: 4,
    },
  });

  const [isPending, startTransition] = useTransition();
  const initialState = { data: null, error: null };
  const [state, formAction] = useActionState(getWeeklyFootprint, initialState);
  
  const { history, addEntry } = useFootprintHistory();
  const { addScore } = useUserScore();

  const onSubmit = form.handleSubmit((data) => {
    const formData = new FormData();
    for (const key in data) {
      formData.append(key, (data as any)[key]);
    }
    startTransition(() => {
        formAction(formData);
    });
  });

  useEffect(() => {
    if (state.data) {
      const newFootprint = state.data.totalFootprint;
      
      const lastEntry = history[history.length - 1];
      let pointsEarned = 20; // Base points for calculation
      let toastDescription = "You've earned 20 points for calculating your footprint!";

      if (lastEntry && newFootprint < lastEntry.footprint) {
        pointsEarned += 50; // Bonus for reduction
        toastDescription = `Great job! Your footprint is lower. You earned a bonus 50 points, for a total of ${pointsEarned}!`;
      }
      
      addScore(pointsEarned);
      toast({
        title: "Points Awarded!",
        description: toastDescription,
      });

      addEntry({
        date: new Date().toISOString().split('T')[0],
        footprint: newFootprint,
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.data]);


  return (
    <div className="space-y-8">
        <div className="grid gap-8 lg:grid-cols-2">
            <Card className="self-start">
                <Form {...form}>
                    <form onSubmit={onSubmit} className="space-y-6">
                        <CardHeader>
                            <CardTitle>Detailed Lifestyle Inputs</CardTitle>
                            <CardDescription>Provide your typical monthly data to estimate your annual carbon footprint. The more accurate your inputs, the better the estimate.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Accordion type="multiple" defaultValue={['household']} className="w-full">
                                <AccordionItem value="household">
                                    <AccordionTrigger className="text-lg font-semibold"><Home className="mr-2 h-5 w-5 text-primary" />Housing & Energy</AccordionTrigger>
                                    <AccordionContent className="pt-4 space-y-4">
                                        <FormField control={form.control} name="householdSize" render={({ field }) => (
                                            <FormItem><Label>Number of people in household</Label><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                                        )} />
                                        <FormField control={form.control} name="electricityKwh" render={({ field }) => (
                                            <FormItem><Label>Monthly Electricity Usage (kWh)</Label><FormControl><Input type="number" placeholder="e.g., 250" {...field} /></FormControl><FormMessage /></FormItem>
                                        )} />
                                        <FormField control={form.control} name="naturalGasM3" render={({ field }) => (
                                            <FormItem><Label>Monthly Natural Gas (m³)</Label><FormControl><Input type="number" placeholder="e.g., 50" {...field} /></FormControl><FormMessage /></FormItem>
                                        )} />
                                        <FormField control={form.control} name="heatingOilL" render={({ field }) => (
                                            <FormItem><Label>Monthly Heating Oil (Litres)</Label><FormControl><Input type="number" placeholder="e.g., 0" {...field} /></FormControl><FormMessage /></FormItem>
                                        )} />
                                    </AccordionContent>
                                </AccordionItem>

                                <AccordionItem value="transport">
                                    <AccordionTrigger className="text-lg font-semibold"><Car className="mr-2 h-5 w-5 text-primary" />Transport & Travel</AccordionTrigger>
                                    <AccordionContent className="pt-4 space-y-4">
                                        <FormField control={form.control} name="carKm" render={({ field }) => (
                                            <FormItem><Label>Monthly Distance by Car (km)</Label><FormControl><Input type="number" placeholder="e.g., 400" {...field} /></FormControl><FormMessage /></FormItem>
                                        )} />
                                        <FormField control={form.control} name="carFuelType" render={({ field }) => (
                                            <FormItem><Label>Car Fuel Type</Label><Select onValueChange={field.onChange} defaultValue={field.value} name={field.name}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="petrol">Petrol</SelectItem><SelectItem value="diesel">Diesel</SelectItem><SelectItem value="electric">Electric</SelectItem></SelectContent></Select><FormMessage /></FormItem>
                                        )} />
                                        <FormField control={form.control} name="carFuelEconomy" render={({ field }) => (
                                            <FormItem><Label>Car Fuel Economy (L or kWh / 100km)</Label><FormControl><Input type="number" placeholder="e.g., 8" {...field} /></FormControl><FormMessage /></FormItem>
                                        )} />
                                         <FormField control={form.control} name="flightsShort" render={({ field }) => (
                                            <FormItem><Label>Short-Haul Return Flights (per year)</Label><FormControl><Input type="number" placeholder="e.g., 1" {...field} /></FormControl><FormDescription>Flights under 3 hours.</FormDescription><FormMessage /></FormItem>
                                        )} />
                                         <FormField control={form.control} name="flightsLong" render={({ field }) => (
                                            <FormItem><Label>Long-Haul Return Flights (per year)</Label><FormControl><Input type="number" placeholder="e.g., 0" {...field} /></FormControl><FormDescription>Flights over 3 hours.</FormDescription><FormMessage /></FormItem>
                                        )} />
                                    </AccordionContent>
                                </AccordionItem>
                                
                                <AccordionItem value="diet">
                                    <AccordionTrigger className="text-lg font-semibold"><Utensils className="mr-2 h-5 w-5 text-primary" />Food & Diet</AccordionTrigger>
                                    <AccordionContent className="pt-4 space-y-4">
                                        <FormField control={form.control} name="diet" render={({ field }) => (
                                            <FormItem><Label>Primary Dietary Profile</Label><Select onValueChange={field.onChange} defaultValue={field.value} name={field.name}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="vegan">Vegan</SelectItem><SelectItem value="vegetarian">Vegetarian</SelectItem><SelectItem value="pescatarian">Pescatarian</SelectItem><SelectItem value="omnivore">Omnivore (avg. meat)</SelectItem><SelectItem value="omnivore_high_meat">Omnivore (high meat)</SelectItem></SelectContent></Select><FormMessage /></FormItem>
                                        )} />
                                    </AccordionContent>
                                </AccordionItem>

                                 <AccordionItem value="goods">
                                    <AccordionTrigger className="text-lg font-semibold"><Trash2 className="mr-2 h-5 w-5 text-primary" />Waste</AccordionTrigger>
                                    <AccordionContent className="pt-4 space-y-4">
                                        <FormField control={form.control} name="wasteKg" render={({ field }) => (
                                            <FormItem><Label>Weekly Non-Recycled Household Waste (kg)</Label><FormControl><Input type="number" placeholder="e.g., 4" {...field} /></FormControl><FormMessage /></FormItem>
                                        )} />
                                    </AccordionContent>
                                </AccordionItem>
                            </Accordion>
                        </CardContent>
                        <CardFooter className="flex-col items-start gap-4 pt-6">
                            <SubmitButton isSubmitting={isPending} />
                            {state?.error && <p className="text-sm text-destructive">{state.error}</p>}
                        </CardFooter>
                    </form>
                </Form>
            </Card>
            
            <div className="flex items-start justify-center">
                {isPending && !state?.data && (
                  <div className="flex h-full w-full min-h-[400px] flex-col items-center justify-center rounded-lg border-2 border-dashed bg-card p-8 text-center sticky top-24">
                      <Loader2 className="h-10 w-10 text-primary animate-spin mb-4" />
                      <h3 className="text-lg font-semibold text-foreground">Calculating your footprint...</h3>
                      <p className="text-sm text-muted-foreground">The AI is running the numbers.</p>
                  </div>
                )}

                {!isPending && state?.data ? (
                    <Card className="w-full bg-primary/10 border-primary/20 sticky top-24">
                        <CardHeader className="items-center text-center">
                            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/20 text-primary mb-4">
                                <Footprints className="h-8 w-8" />
                            </div>
                            <CardTitle className="text-2xl">Your Estimated Annual Footprint</CardTitle>
                        </CardHeader>
                        <CardContent className="text-center">
                            <p className="text-6xl font-bold text-primary tracking-tight">{state.data.totalFootprint.toFixed(2)}</p>
                            <p className="text-muted-foreground">tonnes CO₂e per year</p>

                             <div className="mt-6 text-left space-y-3">
                                {Object.entries(state.data.breakdown).map(([key, value]) => {
                                  if (value === 0) return null;
                                  return (
                                    <div key={key}>
                                        <div className="flex justify-between text-sm mb-1">
                                            <span className="font-medium capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                                            <span className="text-muted-foreground">{value.toFixed(2)} t</span>
                                        </div>
                                        <div className="w-full bg-primary/20 rounded-full h-2.5">
                                            <div className="bg-primary h-2.5 rounded-full" style={{ width: `${(value / state.data.totalFootprint) * 100}%` }}></div>
                                        </div>
                                    </div>
                                  );
                                })}
                            </div>

                            <div className="mt-8 space-y-3 text-sm text-foreground/80 text-left">
                                <h4 className="font-semibold text-base text-primary">AI-Powered Tips</h4>
                                {state.data.tips.map((tip, index) => (
                                    <p key={index} className="flex items-start gap-3">
                                        <Leaf className="h-4 w-4 text-primary mt-1 shrink-0" /> 
                                        <span>{tip}</span>
                                    </p>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                ) : !isPending && !state?.data && (
                    <div className="flex h-full w-full min-h-[400px] flex-col items-center justify-center rounded-lg border-2 border-dashed bg-card p-8 text-center sticky top-24">
                        <Info className="h-10 w-10 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-semibold text-foreground">Your AI-powered estimate will appear here.</h3>
                        <p className="text-sm text-muted-foreground">Fill out the form and click calculate.</p>
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
                    This chart tracks your estimated annual carbon footprint over time. Each calculation you make is saved.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <HistoryChart data={history} />
            </CardContent>
        </Card>
    </div>
  );
}

    
