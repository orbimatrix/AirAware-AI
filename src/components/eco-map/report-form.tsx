"use client";

import { useFormStatus } from "react-dom";
import { useActionState, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Send, Loader2, LocateFixed } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Form, FormControl, FormField, FormItem, FormMessage } from "../ui/form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { submitReport } from "@/app/(app)/eco-map/actions";

const formSchema = z.object({
    reportType: z.string({ required_error: "Please select a report type." }),
    description: z.string().min(10, "Description must be at least 10 characters.").max(200, "Description is too long."),
    latitude: z.coerce.number(),
    longitude: z.coerce.number(),
});

type FormValues = z.infer<typeof formSchema>;

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
      Submit Report
    </Button>
  );
}

export function ReportForm() {
  const { toast } = useToast();
  const [location, setLocation] = useState<{lat: number; lng: number} | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
        description: "",
    }
  });

  const initialState = { success: false, error: null };
  const [state, formAction] = useActionState(submitReport, initialState);
  
  const handleGetLocation = () => {
    setLocationError(null);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          // For demo, we'll keep it within Lahore's bounding box
          const clampedLat = Math.max(31.3, Math.min(31.6, latitude));
          const clampedLng = Math.max(74.1, Math.min(74.5, longitude));
          setLocation({ lat: clampedLat, lng: clampedLng });
          form.setValue('latitude', clampedLat);
          form.setValue('longitude', clampedLng);
          toast({ title: 'Location Acquired!' });
        },
        (error) => {
          setLocationError(`Error: ${error.message}`);
          toast({ title: 'Location Error', description: error.message, variant: 'destructive' });
        }
      );
    } else {
      setLocationError("Geolocation is not supported by this browser.");
      toast({ title: 'Location Error', description: 'Geolocation is not supported.' });
    }
  };


  useEffect(() => {
    if (state.success) {
        toast({
            title: "Report Submitted!",
            description: "Thank you for helping keep the community clean. It's now visible on the map.",
        });
        form.reset({description: ''});
        setLocation(null);
    }
    if (state.error) {
        toast({
            title: "Submission Error",
            description: state.error,
            variant: "destructive",
        })
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  return (
    <Card>
        <CardHeader>
            <CardTitle>Report an Issue</CardTitle>
            <CardDescription>Spotted something? Get your location and submit a report.</CardDescription>
        </CardHeader>
        <CardContent>
            <Form {...form}>
                <form action={formAction} className="space-y-6">
                    <input type="hidden" {...form.register('latitude')} />
                    <input type="hidden" {...form.register('longitude')} />
                    
                     <div className="space-y-2">
                        <Label>Location</Label>
                        <Button type="button" variant="outline" className="w-full" onClick={handleGetLocation}>
                            <LocateFixed className="mr-2" />
                            {location ? `Location Set: (${location.lat.toFixed(4)}, ${location.lng.toFixed(4)})` : 'Get Current Location'}
                        </Button>
                        {(locationError || (form.formState.isSubmitted && !location)) && <p className="text-sm text-destructive">{locationError || 'Please acquire your location to submit a report.'}</p>}
                    </div>

                    <FormField
                        control={form.control}
                        name="reportType"
                        render={({ field }) => (
                            <FormItem>
                                <Label>Type of Issue</Label>
                                <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select a report type" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="Trash">Illegal Trash Dumping</SelectItem>
                                        <SelectItem value="Pollution">Visible Air/Water Pollution</SelectItem>
                                        <SelectItem value="Other">Other</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                            <FormItem>
                                <Label>Description</Label>
                                <FormControl>
                                    <Textarea
                                        placeholder="Tell us more about what you saw..."
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                     <div className="space-y-4">
                        <SubmitButton />
                    </div>
                </form>
            </Form>
        </CardContent>
    </Card>
  );
}
