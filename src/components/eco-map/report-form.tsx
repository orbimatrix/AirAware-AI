"use client";

import { useFormState, useFormStatus } from "react-dom";
import { useForm, SubmitHandler } from "react-hook-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Send, Loader2, Sparkles, AlertTriangle, Shield, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Form, FormControl, FormField, FormItem, FormMessage } from "../ui/form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { submitReport } from "@/app/(app)/eco-map/actions";
import { useEffect } from "react";
import { cn } from "@/lib/utils";

const formSchema = z.object({
    reportType: z.string({ required_error: "Please select a report type." }),
    description: z.string().min(10, "Description must be at least 10 characters.").max(200, "Description is too long."),
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

const severityMap = {
    Low: { icon: CheckCircle, color: "text-green-500", label: "Low Severity" },
    Medium: { icon: AlertTriangle, color: "text-yellow-500", label: "Medium Severity" },
    High: { icon: Shield, color: "text-red-500", label: "High Severity" },
};

export function ReportForm() {
  const { toast } = useToast();
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
        description: "",
    }
  });

  const initialState = { data: null, error: null };
  const [state, formAction] = useFormState(submitReport, initialState);

  useEffect(() => {
    if(state.data) {
        toast({
            title: "Report Submitted!",
            description: "Thank you for helping keep the community clean.",
        });
        form.reset();
    }
  }, [state.data, toast, form]);

  return (
    <Card>
        <CardHeader>
            <CardTitle>Report an Issue</CardTitle>
            <CardDescription>Spotted something? Let the community know.</CardDescription>
        </CardHeader>
        <CardContent>
            <Form {...form}>
                <form action={formAction} className="space-y-6">
                    <FormField
                        control={form.control}
                        name="reportType"
                        render={({ field }) => (
                            <FormItem>
                                <Label>Type of Issue</Label>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select a report type" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="Illegal Trash Dumping">Illegal Trash Dumping</SelectItem>
                                        <SelectItem value="Visible Air/Water Pollution">Visible Air/Water Pollution</SelectItem>
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
                        {state.error && <p className="text-sm text-destructive">{state.error}</p>}
                    </div>

                    {state.data && (
                        <div className="border-t pt-4 mt-4">
                            <h3 className="font-semibold flex items-center gap-2">
                                <Sparkles className="h-4 w-4 text-primary" />
                                AI Assessment
                            </h3>
                            <div className="flex items-center gap-3 mt-2">
                                 {(() => {
                                    const severityInfo = severityMap[state.data.severity];
                                    const Icon = severityInfo.icon;
                                    return (
                                        <Icon className={cn("h-6 w-6", severityInfo.color)} />
                                    );
                                })()}
                                <div>
                                    <p className={cn("font-bold", severityMap[state.data.severity].color)}>{severityMap[state.data.severity].label}</p>
                                    <p className="text-sm text-muted-foreground">{state.data.reasoning}</p>
                                </div>
                            </div>
                        </div>
                    )}
                </form>
            </Form>
        </CardContent>
    </Card>
  );
}
