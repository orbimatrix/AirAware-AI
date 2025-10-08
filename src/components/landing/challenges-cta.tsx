import Link from "next/link";
import { Button } from "../ui/button";
import { Award, Star, Shield, Gem } from "lucide-react";

export function ChallengesCta() {
  return (
    <section className="py-20 lg:py-28 bg-muted/50">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
           <div>
             <h2 className="text-3xl lg:text-4xl font-bold font-headline">Join the Community, Make a Difference</h2>
             <p className="mt-4 text-lg text-muted-foreground">
                Take part in fun eco-challenges, from planting trees to reducing waste. Earn points, climb the community leaderboard, and see how collective action can lead to a cleaner environment.
            </p>
             <Button asChild size="lg" className="mt-8">
                <Link href="/challenges">View Challenges</Link>
             </Button>
          </div>
          <div className="p-8">
             <div className="grid grid-cols-2 gap-6 text-primary">
                <div className="flex flex-col items-center gap-2 p-6 bg-background rounded-lg border">
                    <Star className="h-12 w-12" />
                    <p className="font-semibold text-center">Eco-Novice</p>
                </div>
                <div className="flex flex-col items-center gap-2 p-6 bg-background rounded-lg border">
                    <Shield className="h-12 w-12" />
                    <p className="font-semibold text-center">Planet Protector</p>
                </div>
                <div className="flex flex-col items-center gap-2 p-6 bg-background rounded-lg border">
                    <Award className="h-12 w-12" />
                    <p className="font-semibold text-center">Green Guru</p>
                </div>
                <div className="flex flex-col items-center gap-2 p-6 bg-background rounded-lg border">
                    <Gem className="h-12 w-12" />
                    <p className="font-semibold text-center">Climate Champion</p>
                </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
