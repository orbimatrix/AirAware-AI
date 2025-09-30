import { CalculatorForm } from "@/components/carbon-footprint/calculator-form";
import { PageHeader } from "@/components/page-header";

export const metadata = {
  title: "Carbon Footprint",
};

export default function CarbonFootprintPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Carbon Footprint Calculator"
        description="Get a rough estimate of your daily carbon emissions and find tips to reduce them."
      />
      <CalculatorForm />
    </div>
  );
}
