import Link from "next/link";
import { Button } from "../ui/button";
import { Footprints } from "lucide-react";

export function FootprintCta() {
  return (
    <section className="py-20 lg:py-28">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
           <div className="relative aspect-square lg:aspect-[4/3] rounded-2xl overflow-hidden shadow-lg order-last lg:order-first p-8 bg-muted/50 border">
              <div className="flex h-full items-center justify-center">
                <div className="text-center">
                    <Footprints className="h-20 w-20 text-primary mx-auto mb-4" />
                    <p className="text-6xl font-bold text-primary tracking-tight">8.6</p>
                    <p className="text-muted-foreground">tonnes CO₂e / year</p>
                </div>
              </div>
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
