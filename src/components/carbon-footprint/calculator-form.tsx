'use client'

import { useState, useMemo } from 'react';
import { useForm, UseFormReturn } from 'react-hook-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Footprints, Leaf } from 'lucide-react';

type FormData = {
  transport: number;
  energy: number;
  diet: number;
  consumption: number;
};

// Simple weights for calculation
const weights = {
  transport: 0.4, // kg CO2 per km
  energy: 0.2, // kg CO2 per kWh
  diet: 2.5, // kg CO2 per day for meat-heavy diet
  consumption: 0.1, // kg CO2 per dollar spent on goods
};

const labels = {
    transport: ['Rarely use vehicles', 'Daily short commutes', 'Daily long commutes'],
    energy: ['Minimal usage', 'Average usage', 'High usage'],
    diet: ['Vegan/Vegetarian', 'Occasional meat', 'Daily meat'],
    consumption: ['Minimalist', 'Average shopper', 'Frequent shopper'],
}

function CalculatorSlider({ name, label, control, value, categoryLabels }: { name: keyof FormData, label: string, control: UseFormReturn<FormData>, value: number, categoryLabels: string[] }) {
    const { setValue } = control;

    return (
        <div className="space-y-3">
            <Label htmlFor={name} className="text-base">{label}</Label>
            <Slider
                id={name}
                min={0}
                max={100}
                step={1}
                value={[value]}
                onValueChange={(vals) => setValue(name, vals[0])}
            />
            <div className="flex justify-between text-xs text-muted-foreground">
                <span>{categoryLabels[0]}</span>
                <span>{categoryLabels[1]}</span>
                <span>{categoryLabels[2]}</span>
            </div>
        </div>
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

  const { control, watch } = form;
  const formValues = watch();

  const totalFootprint = useMemo(() => {
    const transportC02 = formValues.transport * weights.transport;
    const energyC02 = formValues.energy * weights.energy;
    const dietC02 = (formValues.diet / 50) * weights.diet; // Scaled
    const consumptionC02 = formValues.consumption * weights.consumption;
    return (transportC02 + energyC02 + dietC02 + consumptionC02).toFixed(2);
  }, [formValues]);

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Lifestyle Inputs</CardTitle>
          <CardDescription>Adjust the sliders to reflect your daily habits.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          <CalculatorSlider name="transport" label="Daily Commute & Travel" control={form} value={formValues.transport} categoryLabels={labels.transport} />
          <CalculatorSlider name="energy" label="Home Energy Usage" control={form} value={formValues.energy} categoryLabels={labels.energy} />
          <CalculatorSlider name="diet" label="Dietary Habits" control={form} value={formValues.diet} categoryLabels={labels.diet} />
          <CalculatorSlider name="consumption" label="Shopping & Consumption" control={form} value={formValues.consumption} categoryLabels={labels.consumption} />
        </CardContent>
      </Card>
      
      <div className="flex items-center justify-center">
        <Card className="w-full bg-primary/10 border-primary/20">
            <CardHeader className="items-center text-center">
                 <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/20 text-primary mb-4">
                    <Footprints className="h-8 w-8" />
                </div>
                <CardTitle className="text-2xl">Your Estimated Daily Footprint</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
                <p className="text-6xl font-bold text-primary tracking-tight">{totalFootprint}</p>
                <p className="text-muted-foreground">kg CO₂ equivalent</p>
                <div className="mt-6 space-y-2 text-sm text-foreground/80">
                    <p className="flex items-center justify-center gap-2"><Leaf className="h-4 w-4 text-primary" /> Reduce meat consumption to lower your score.</p>
                    <p className="flex items-center justify-center gap-2"><Leaf className="h-4 w-4 text-primary" /> Opt for public transport or cycling.</p>
                    <p className="flex items-center justify-center gap-2"><Leaf className="h-4 w-4 text-primary" /> Unplug devices when not in use.</p>
                </div>
            </CardContent>
        </Card>
      </div>

    </div>
  );
}
