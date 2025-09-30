'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { PlusCircle } from 'lucide-react';
import { mockAqiData } from '@/lib/data';
import { HealthLogEntry } from '@/hooks/use-health-log';
import { toast } from '@/hooks/use-toast';

const symptoms = [
  { id: 'cough', label: 'Coughing' },
  { id: 'headache', label: 'Headache' },
  { id: 'eye_irritation', label: 'Eye Irritation' },
  { id: 'short_breath', label: 'Shortness of Breath' },
  { id: 'fatigue', label: 'Fatigue / Weakness' },
];

const formSchema = z.object({
  symptoms: z.array(z.string()).refine((value) => value.some((item) => item), {
    message: 'You have to select at least one symptom.',
  }),
  notes: z.string().max(200, 'Notes are too long.').optional(),
});

type FormValues = z.infer<typeof formSchema>;

type HealthLogFormProps = {
  onAddEntry: (entry: HealthLogEntry) => void;
};

export function HealthLogForm({ onAddEntry }: HealthLogFormProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      symptoms: [],
      notes: '',
    },
  });

  function onSubmit(data: FormValues) {
    const today = new Date().toISOString().split('T')[0];
    const newEntry: HealthLogEntry = {
      date: today,
      aqi: mockAqiData.aqi,
      symptoms: data.symptoms,
      notes: data.notes || '',
    };
    onAddEntry(newEntry);
    toast({
        title: 'Log Saved',
        description: "Today's health entry has been recorded.",
    })
    form.reset();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Log Today's Symptoms</CardTitle>
        <CardDescription>How are you feeling today? Current AQI is {mockAqiData.aqi}.</CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-6">
            <FormField
              control={form.control}
              name="symptoms"
              render={() => (
                <FormItem>
                  <div className="mb-4">
                    <FormLabel className="text-base">Symptoms</FormLabel>
                  </div>
                  {symptoms.map((item) => (
                    <FormField
                      key={item.id}
                      control={form.control}
                      name="symptoms"
                      render={({ field }) => {
                        return (
                          <FormItem
                            key={item.id}
                            className="flex flex-row items-start space-x-3 space-y-0"
                          >
                            <FormControl>
                              <Checkbox
                                checked={field.value?.includes(item.label)}
                                onCheckedChange={(checked) => {
                                  return checked
                                    ? field.onChange([...(field.value || []), item.label])
                                    : field.onChange(
                                        field.value?.filter(
                                          (value) => value !== item.label
                                        )
                                      );
                                }}
                              />
                            </FormControl>
                            <FormLabel className="font-normal">
                              {item.label}
                            </FormLabel>
                          </FormItem>
                        );
                      }}
                    />
                  ))}
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <Label>Notes (optional)</Label>
                  <FormControl>
                    <Textarea placeholder="e.g., Symptoms were worse in the evening..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full">
              <PlusCircle className="mr-2 h-4 w-4" />
              Add to Journal
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
