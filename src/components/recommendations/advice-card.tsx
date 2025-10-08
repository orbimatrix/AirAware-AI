'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { HealthRecsOutput } from '@/lib/types';
import { CheckCircle, ShieldAlert } from 'lucide-react';

type AdviceCardProps = {
  advice: HealthRecsOutput;
};

export function AdviceCard({ advice }: AdviceCardProps) {
  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardHeader>
        <CardTitle className="flex items-start gap-3">
          <ShieldAlert className="h-8 w-8 text-primary mt-1" />
          <span className="flex-1 text-2xl font-bold font-headline text-primary">
            Your Personalized Recommendation
          </span>
        </CardTitle>
        <CardDescription className="text-lg text-foreground/90 pt-2 pl-11">
          {advice.overallRecommendation}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <h3 className="font-semibold mb-4 ml-11">Detailed Advice:</h3>
        <ul className="space-y-4 ml-11">
          {advice.detailedAdvice.map((item, index) => (
            <li key={index} className="flex items-start gap-4">
              <CheckCircle className="h-5 w-5 text-primary mt-1 shrink-0" />
              <div>
                <p className="font-semibold">{item.title}</p>
                <p className="text-muted-foreground">{item.description}</p>
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
