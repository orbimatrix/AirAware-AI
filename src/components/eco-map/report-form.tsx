"use client";

import { useForm, SubmitHandler } from "react-hook-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Form, FormControl, FormField, FormItem, FormMessage } from "../ui/form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const formSchema = z.object({
    reportType: z.string({ required_error: "Please select a report type." }),
    description: z.string().min(10, "Description must be at least 10 characters.").max(200, "Description is too long."),
});

type FormValues = z.infer<typeof formSchema>;


export function ReportForm() {
  const { toast } = useToast();
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
        description: "",
    }
  });

  const onSubmit: SubmitHandler<FormValues> = (data) => {
    console.log("New Report Submitted:", data);
    toast({
      title: "Report Submitted!",
      description: "Thank you for helping keep the community clean.",
    });
    form.reset();
  };

  return (
    <Card>
        <CardHeader>
            <CardTitle>Report an Issue</CardTitle>
            <CardDescription>Spotted something? Let the community know.</CardDescription>
        </CardHeader>
        <CardContent>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                                        <SelectItem value="trash">Illegal Trash Dumping</SelectItem>
                                        <SelectItem value="pollution">Visible Air/Water Pollution</SelectItem>
                                        <SelectItem value="other">Other</SelectItem>
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

                    <Button type="submit" className="w-full">
                        <Send className="mr-2 h-4 w-4" />
                        Submit Report
                    </Button>
                </form>
            </Form>
        </CardContent>
    </Card>
  );
}
