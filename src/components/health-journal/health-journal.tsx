'use client';
import { HealthLogForm } from './health-log-form';
import { HealthLogList } from './health-log-list';
import { useHealthLog } from '@/hooks/use-health-log';

export function HealthJournal() {
  const { log, addEntry } = useHealthLog();

  return (
    <div className="grid gap-12 lg:grid-cols-3">
      <div className="lg:col-span-1">
        <HealthLogForm onAddEntry={addEntry} />
      </div>
      <div className="lg:col-span-2">
        <HealthLogList log={log} />
      </div>
    </div>
  );
}
