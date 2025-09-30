import { EcoMap } from "@/components/eco-map/eco-map";
import { ReportForm } from "@/components/eco-map/report-form";
import { PageHeader } from "@/components/page-header";

export const metadata = {
  title: "Eco-Map",
};

export default function EcoMapPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Eco-Map"
        description="View and report environmental issues in your community."
      />
      <div className="grid gap-12 lg:grid-cols-3">
        <div className="lg:col-span-2">
            <EcoMap />
        </div>
        <div className="lg:col-span-1">
            <ReportForm />
        </div>
      </div>
    </div>
  );
}
