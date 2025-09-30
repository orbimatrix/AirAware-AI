import { HealthForm } from "@/components/recommendations/health-form";
import { PageHeader } from "@/components/page-header";

export const metadata = {
  title: "Health Recommendations",
};

export default function RecommendationsPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Personalized Health Advice"
        description="Get AI-powered health recommendations based on your profile and real-time air quality."
      />
      <HealthForm />
    </div>
  );
}
