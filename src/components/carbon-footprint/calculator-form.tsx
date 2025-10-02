'use client'

import { useFormStatus } from 'react-dom';
import { useActionState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Footprints, Leaf, Loader2, Sparkles, Info, LineChart, ChevronDown, Building, Car, Plane, Utensils } from 'lucide-react';
import { getWeeklyFootprint } from '@/app/(app)/carbon-footprint/actions';
import { HistoryChart } from './history-chart';
import { useFootprintHistory } from '@/hooks/use-footprint-history';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../ui/accordion';
import { Form, FormControl, FormField, FormItem, FormMessage } from '../ui/form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { cn } from '@/lib/utils';


const formSchema = z.object({
  householdSize: z.coerce.number().min(1, "Min 1 person."),
  electricityKwh: z.coerce.number().min(0, "Cannot be negative."),
  naturalGasM3: z.coerce.number().min(0, "Cannot be negative."),
  heatingOilL: z.coerce.number().min(0, "Cannot be negative."),
  carKm: z.coerce.number().min(0, "Cannot be negative."),
  carFuelType: z.enum(['petrol', 'diesel', 'electric']),
  carFuelEconomy: z.coerce.number().min(0, "Cannot be negative.").optional(),
  flightsShort: z.coerce.number().min(0, "Cannot be negative."),
  flightsLong: z.coerce.number().min(0, "Cannot be negative."),
  diet: z.enum(['vegan', 'vegetarian', 'pescatarian', 'omnivore', 'omnivore_high_meat']),
  wasteKg: z.coerce.number().min(0, "Cannot be negative."),
});

type FormValues = z.infer<typeof formSchema>;


function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full" size="lg">
      {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
      Calculate My Annual Footprint
    </Button>
  );
}

export function CalculatorForm() {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      householdSize: 1,
      electricityKwh: 0,
      naturalGasM3: 0,
      heatingOilL: 0,
      carKm: 0,
      carFuelType: 'petrol',
      carFuelEconomy: 8,
      flightsShort: 0,
      flightsLong: 0,
      diet: 'omnivore',
      wasteKg: 0,
    },
  });

  const initialState = { data: null, error: null };
  const [state, formAction] = useActionState(getWeeklyFootprint, initialState);
  
  const { history, addEntry } = useFootprintHistory();

  const onSubmit = (data: FormValues) => {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        formData.append(key, String(value));
      }
    });
    formAction(formData);
  };


  useEffect(() => {
    if (state.data) {
      addEntry({
        date: new Date().toISOString().split('T')[0],
        footprint: state.data.totalFootprint,
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.data]);


  return (
    <div className="space-y-8">
        <div className="grid gap-8 lg:grid-cols-2">
            <Card className="self-start">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)}>
                        <CardHeader>
                            <CardTitle>Detailed Lifestyle Inputs</CardTitle>
                            <CardDescription>Provide monthly data for an annual footprint estimate.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Accordion type="multiple" defaultValue={['household']} className="w-full">
                                <AccordionItem value="household">
                                    <AccordionTrigger className="text-lg font-semibold"><Building className="mr-2 h-5 w-5 text-primary" />Household</AccordionTrigger>
                                    <AccordionContent className="pt-4 space-y-4">
                                        <FormField control={form.control} name="householdSize" render={({ field }) => (
                                            <FormItem><Label>Number of people in household</Label><FormControl><Input type="number" placeholder="e.g., 2" {...field} /></FormControl><FormMessage /></FormItem>
                                        )} />
                                        <FormField control={form.control} name="electricityKwh" render={({ field }) => (
                                            <FormItem><Label>Monthly Electricity Usage (kWh)</Label><FormControl><Input type="number" placeholder="e.g., 300" {...field} /></FormControl><FormMessage /></FormItem>
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
                                    <AccordionTrigger className="text-lg font-semibold"><Car className="mr-2 h-5 w-5 text-primary" />Transport</AccordionTrigger>
                                    <AccordionContent className="pt-4 space-y-4">
                                        <FormField control={form.control} name="carKm" render={({ field }) => (
                                            <FormItem><Label>Monthly Distance by Car (km)</Label><FormControl><Input type="number" placeholder="e.g., 500" {...field} /></FormControl><FormMessage /></FormItem>
                                        )} />
                                        <FormField control={form.control} name="carFuelType" render={({ field }) => (
                                            <FormItem><Label>Car Fuel Type</Label><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="petrol">Petrol</SelectItem><SelectItem value="diesel">Diesel</SelectItem><SelectItem value="electric">Electric</SelectItem></SelectContent></Select><FormMessage /></FormItem>
                                        )} />
                                        <FormField control={form.control} name="carFuelEconomy" render={({ field }) => (
                                            <FormItem><Label>Fuel Economy (L/100km or kWh/100km)</Label><FormControl><Input type="number" placeholder="e.g., 8" {...field} /></FormControl><FormMessage /></FormItem>
                                        )} />
                                         <FormField control={form.control} name="flightsShort" render={({ field }) => (
                                            <FormItem><Label>Short-Haul Return Flights (per year)</Label><FormControl><Input type="number" placeholder="e.g., 2" {...field} /></FormControl><FormMessage /></FormItem>
                                        )} />
                                         <FormField control={form.control} name="flightsLong" render={({ field }) => (
                                            <FormItem><Label>Long-Haul Return Flights (per year)</Label><FormControl><Input type="number" placeholder="e.g., 1" {...field} /></FormControl><FormMessage /></FormItem>
                                        )} />
                                    </AccordionContent>
                                </AccordionItem>
                                
                                <AccordionItem value="diet">
                                    <AccordionTrigger className="text-lg font-semibold"><Utensils className="mr-2 h-5 w-5 text-primary" />Diet & Waste</AccordionTrigger>
                                    <AccordionContent className="pt-4 space-y-4">
                                        <FormField control={form.control} name="diet" render={({ field }) => (
                                            <FormItem><Label>Dietary Profile</Label><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="vegan">Vegan</SelectItem><SelectItem value="vegetarian">Vegetarian</SelectItem><SelectItem value="pescatarian">Pescatarian</SelectItem><SelectItem value="omnivore">Omnivore (avg. meat)</SelectItem><SelectItem value="omnivore_high_meat">Omnivore (high meat)</SelectItem></SelectContent></Select><FormMessage /></FormItem>
                                        )} />
                                        <FormField control={form.control} name="wasteKg" render={({ field }) => (
                                            <FormItem><Label>Weekly Non-Recycled Waste (kg)</Label><FormControl><Input type="number" placeholder="e.g., 5" {...field} /></FormControl><FormMessage /></FormItem>
                                        )} />
                                    </AccordionContent>
                                </AccordionItem>
                            </Accordion>
                        </CardContent>
                        <CardFooter className="flex-col items-start gap-4 pt-6">
                            <SubmitButton />
                            {state?.error && <p className="text-sm text-destructive">{state.error}</p>}
                        </CardFooter>
                    </form>
                </Form>
            </Card>
            
            <div className="flex items-start justify-center">
                {state?.data ? (
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
                                {Object.entries(state.data.breakdown).map(([key, value]) => (
                                    <div key={key}>
                                        <div className="flex justify-between text-sm mb-1">
                                            <span className="font-medium capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                                            <span className="text-muted-foreground">{value.toFixed(2)} t</span>
                                        </div>
                                        <div className="w-full bg-primary/20 rounded-full h-2.5">
                                            <div className="bg-primary h-2.5 rounded-full" style={{ width: `${(value / state.data.totalFootprint) * 100}%` }}></div>
                                        </div>
                                    </div>
                                ))}
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
                ) : (
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
                    This chart tracks your annual carbon footprint over time.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <HistoryChart data={history} />
            </CardContent>
        </Card>
    </div>
  );
}
