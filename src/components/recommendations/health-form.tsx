'use client';
import { useActionState, useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Loader2, Sparkles } from 'lucide-react';
import { useAirQualityData } from '@/hooks/useAirQualitydata';
import { Skeleton } from '../ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { AlertCircle } from 'lucide-react';
import { getHealthRecommendations } from '@/app/(app)/recommendations/actions';
import { AdviceCard } from './advice-card';

const healthConditions = [
  { id: 'asthma', label: 'Asthma' },
  { id: 'copd', label: 'COPD' },
  { id: 'heart_disease', label: 'Heart Disease' },
  { id: 'allergies', label: 'Seasonal Allergies' },
];

const formSchema = z.object({
  age: z.coerce.number().optional(),
  healthConditions: z.array(z.string()).optional(),
});

type FormValues = z.infer<typeof formSchema>;

function SubmitButton({ isSubmitting }: { isSubmitting: boolean }) {
  return (
    <Button type="submit" disabled={isSubmitting} className="w-full">
      {isSubmitting ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <Sparkles className="mr-2 h-4 w-4" />
      )}
      Generate My Advice
    </Button>
  );
}

export function HealthRecsForm() {
  const [location, setLocation] = useState<{ lat: number; lon: number } | null>(
    null
  );
  const [isPending, startTransition] = useTransition();

  const {
    data: aqData,
    loading: loadingAq,
    error: errorAq,
  } = useAirQualityData(location?.lat ?? null, location?.lon ?? null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      healthConditions: [],
    },
  });

  const [state, formAction] = useActionState(getHealthRecommendations, {
    data: null,
    error: null,
    submitted: false,
  });

  const handleGetLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        setLocation({
          lat: position.coords.latitude,
          lon: position.coords.longitude,
        });
      });
    }
  };

  const onSubmit = form.handleSubmit((data) => {
    if (!aqData) return;
    const formData = new FormData();
    formData.append('aqi', String(aqData.aqi));
    if (data.age) {
      formData.append('age', String(data.age));
    }
    data.healthConditions?.forEach((hc) =>
      formData.append('healthConditions', hc)
    );

    startTransition(() => {
      formAction(formData);
    });
  });

  if (!location) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Enable Location</CardTitle>
          <CardDescription>
            We need your location to fetch the current air quality data and
            provide accurate recommendations.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={handleGetLocation} className="w-full">
            Get My Location
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (loadingAq) {
    return (
      <div className="space-y-4 max-w-2xl mx-auto">
        <Skeleton className="h-10 w-1/2" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (errorAq) {
    return (
      <Alert variant="destructive" className="max-w-2xl mx-auto">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Could Not Fetch Air Quality</AlertTitle>
        <AlertDescription>{errorAq}</AlertDescription>
      </Alert>
    );
  }
  
  if (state.submitted && state.data) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <AdviceCard advice={state.data} />
        <Button variant="outline" onClick={() => formAction(new FormData())} className="w-full">
          Start Over
        </Button>
      </div>
    );
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <Form {...form}>
        <form onSubmit={onSubmit}>
          <CardHeader>
            <CardTitle>Your Health Profile</CardTitle>
            <CardDescription>
              Provide some optional details for more tailored advice. The current
              AQI is{' '}
              <span className="font-bold text-primary">{Math.round(aqData?.aqi || 0)}</span>.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <FormField
              control={form.control}
              name="age"
              render={({ field }) => (
                <FormItem>
                  <Label>Age (Optional)</Label>
                  <FormControl>
                    <Input type="number" placeholder="e.g., 35" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="healthConditions"
              render={() => (
                <FormItem>
                  <div className="mb-4">
                    <FormLabel>
                      Pre-existing Conditions (Optional)
                    </FormLabel>
                  </div>
                  {healthConditions.map((item) => (
                    <FormField
                      key={item.id}
                      control={form.control}
                      name="healthConditions"
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
                                  const currentValue = field.value || [];
                                  return checked
                                    ? field.onChange([
                                        ...currentValue,
                                        item.label,
                                      ])
                                    : field.onChange(
                                        currentValue?.filter(
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
          </CardContent>
          <CardFooter className="flex-col gap-4">
            <SubmitButton isSubmitting={isPending} />
            {state.error && <p className="text-destructive text-sm">{state.error}</p>}
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
