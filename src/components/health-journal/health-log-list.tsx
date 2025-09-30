'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { HealthLogEntry } from '@/hooks/use-health-log';
import { Badge } from '@/components/ui/badge';
import { BookDashed, FileText } from 'lucide-react';
import { format } from 'date-fns';

type HealthLogListProps = {
  log: HealthLogEntry[];
};

export function HealthLogList({ log }: HealthLogListProps) {
  if (log.length === 0) {
    return (
      <div className="flex h-full min-h-[300px] flex-col items-center justify-center rounded-lg border-2 border-dashed bg-card p-8 text-center">
        <BookDashed className="h-10 w-10 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold text-foreground">No Journal Entries Yet</h3>
        <p className="text-sm text-muted-foreground">Log your symptoms on the left to start tracking.</p>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Health History</CardTitle>
        <CardDescription>A log of your symptoms and the air quality on those days.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {log.map((entry) => (
            <div key={entry.date} className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-muted font-bold text-lg flex-col leading-none">
                 <span>{format(new Date(entry.date), "dd")}</span>
                 <span className="text-xs">{format(new Date(entry.date), "MMM")}</span>
              </div>
              <div className="flex-1">
                <div className="flex items-baseline justify-between">
                    <p className="font-semibold">AQI: <span className="font-bold text-primary">{entry.aqi}</span></p>
                    <p className="text-sm text-muted-foreground">{format(new Date(entry.date), "EEEE, yyyy")}</p>
                </div>
                <div className="my-2">
                    <p className="font-medium text-sm">Symptoms Reported:</p>
                    <div className="flex flex-wrap gap-2 mt-1">
                        {entry.symptoms.map(symptom => (
                            <Badge key={symptom} variant="secondary">{symptom}</Badge>
                        ))}
                    </div>
                </div>
                {entry.notes && (
                    <div className="mt-2 text-sm text-muted-foreground italic border-l-2 pl-3">
                        <FileText className="inline-block h-3.5 w-3.5 mr-1.5" />
                        {entry.notes}
                    </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
