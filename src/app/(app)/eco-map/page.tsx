import { HazardsAgentClient } from "@/components/eco-map/hazards-agent-client";
import { PageHeader } from "@/components/page-header";

export const metadata = {
  title: "AI Hazard Agent",
};

export default function EcoMapPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="AI-Powered Hazard Agent"
        description="Ask the AI agent about current environmental hazards in any location."
      />
      <HazardsAgentClient />
    </div>
  );
}
