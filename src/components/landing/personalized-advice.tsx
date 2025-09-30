import Image from "next/image";
import Link from "next/link";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Button } from "../ui/button";

export function PersonalizedAdvice() {
  const adviceImage = PlaceHolderImages.find((p) => p.id === "healthAdvice");

  return (
    <section className="py-20 lg:py-28 bg-muted/50">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
           <div>
             <h2 className="text-3xl lg:text-4xl font-bold font-headline">AI-Powered Health Recommendations</h2>
             <p className="mt-4 text-lg text-muted-foreground">
                Our advanced AI analyzes the current air quality and your unique health profile to provide actionable advice. Whether you have asthma or are planning activities for your children, Saaf Hawa has your back.
            </p>
             <Button asChild size="lg" className="mt-8">
                <Link href="/recommendations">Get Your Health Tip</Link>
             </Button>
          </div>
          <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-lg">
             {adviceImage && (
              <Image
                src={adviceImage.imageUrl}
                alt={adviceImage.description}
                fill
                className="object-cover"
                data-ai-hint={adviceImage.imageHint}
              />
            )}
             <div className="absolute inset-0 bg-gradient-to-t from-muted/50 to-transparent"></div>
          </div>
        </div>
      </div>
    </section>
  );
}
