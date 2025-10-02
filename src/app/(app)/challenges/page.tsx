import { ChallengeList } from "@/components/challenges/challenge-list";
import { Leaderboard } from "@/components/challenges/leaderboard";
import { MyBadges } from "@/components/challenges/my-badges";
import { PageHeader } from "@/components/page-header";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";

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
        <div className="lg:col-span-2 space-y-8">
          <div>
            <h2 className="text-2xl font-bold font-headline mb-4">Available Challenges</h2>
            <ChallengeList />
          </div>
          <div>
            <h2 className="text-2xl font-bold font-headline mb-4">My Badges</h2>
            <MyBadges />
          </div>
        </div>
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Leaderboard</CardTitle>
            </CardHeader>
            <Leaderboard />
          </Card>
        </div>
      </div>
    </div>
  );
}
