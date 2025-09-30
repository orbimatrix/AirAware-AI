import { ChallengeList } from "@/components/challenges/challenge-list";
import { Leaderboard } from "@/components/challenges/leaderboard";
import { PageHeader } from "@/components/page-header";

export const metadata = {
  title: "Eco-Challenges",
};

export default function ChallengesPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Eco-Challenges"
        description="Join challenges, earn points, and climb the leaderboard by making a positive impact."
      />
      <div className="grid gap-12 lg:grid-cols-3">
        <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold font-headline mb-4">Available Challenges</h2>
            <ChallengeList />
        </div>
        <div className="lg:col-span-1">
            <Leaderboard />
        </div>
      </div>
    </div>
  );
}
