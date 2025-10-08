import { PageHeader } from "@/components/page-header";
import { HealthRecsForm } from "@/components/recommendations/health-form";

export const metadata = {
  title: "Health Recommendations",
};

export default function RecommendationsPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Personalized Health Advice"
        description="Get AI-powered health recommendations tailored to your profile and the current air quality."
      />
      <HealthRecsForm />
    </div>
  );
}
