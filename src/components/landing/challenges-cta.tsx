import Image from "next/image";
import Link from "next/link";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Button } from "../ui/button";

export function ChallengesCta() {
  const challengesImage = PlaceHolderImages.find((p) => p.id === "ecoChallenges");

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
          <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-lg">
             {challengesImage && (
              <Image
                src={challengesImage.imageUrl}
                alt={challengesImage.description}
                fill
                className="object-cover"
                data-ai-hint={challengesImage.imageHint}
              />
            )}
             <div className="absolute inset-0 bg-gradient-to-t from-muted/50 to-transparent"></div>
          </div>
        </div>
      </div>
    </section>
  );
}
