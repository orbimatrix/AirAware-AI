import Image from "next/image";
import Link from "next/link";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Button } from "../ui/button";

export function FootprintCta() {
  const footprintImage = PlaceHolderImages.find((p) => p.id === "carbonFootprint");

  return (
    <section className="py-20 lg:py-28">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
           <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-lg order-last lg:order-first">
             {footprintImage && (
              <Image
                src={footprintImage.imageUrl}
                alt={footprintImage.description}
                fill
                className="object-cover"
                data-ai-hint={footprintImage.imageHint}
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-background/30 to-transparent"></div>
          </div>
           <div>
             <h2 className="text-3xl lg:text-4xl font-bold font-headline">Know Your Impact</h2>
             <p className="mt-4 text-lg text-muted-foreground">
                Curious about your environmental footprint? Our calculator helps you estimate your daily carbon emissions based on your commute, diet, and energy use, offering simple tips to make a difference.
            </p>
             <Button asChild variant="outline" size="lg" className="mt-8">
                <Link href="/carbon-footprint">Calculate Your Footprint</Link>
             </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
