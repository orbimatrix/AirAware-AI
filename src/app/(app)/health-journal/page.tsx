import { PageHeader } from "@/components/page-header";
import { HealthJournal } from "@/components/health-journal/health-journal";

export const metadata = {
  title: "Health Journal",
};

export default function HealthJournalPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Health Journal"
        description="Track how your body feels on different air quality days to find patterns."
      />
      <HealthJournal />
    </div>
  );
}
