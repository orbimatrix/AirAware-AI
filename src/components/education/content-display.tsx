import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EducationalContentOutput } from "@/ai/flows/educational-content";
import { CheckCircle } from "lucide-react";

type ContentDisplayProps = {
  content: EducationalContentOutput;
};

export function ContentDisplay({ content }: ContentDisplayProps) {
  return (
    <Card className="mt-6 border-primary/20 bg-primary/5">
      <CardHeader>
        <CardTitle className="text-2xl font-bold font-headline text-primary">{content.title}</CardTitle>
        <CardDescription className="text-base text-foreground/80 pt-2">{content.summary}</CardDescription>
      </CardHeader>
      <CardContent>
        <h3 className="font-semibold mb-3">Key Takeaways:</h3>
        <ul className="space-y-3">
            {content.keyTakeaways.map((takeaway, index) => (
                <li key={index} className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                    <span>{takeaway}</span>
                </li>
            ))}
        </ul>
      </CardContent>
    </Card>
  );
}
