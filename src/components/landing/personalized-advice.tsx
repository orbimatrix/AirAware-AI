import Link from "next/link";
import { Button } from "../ui/button";
import { HeartPulse, Wind, AlertTriangle } from "lucide-react";

export function PersonalizedAdvice() {
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
          <div className="relative aspect-[4/3] rounded-2xl overflow-hidden p-8">
             <div className="flex flex-col items-center justify-center h-full gap-6">
                <div className="p-6 rounded-lg bg-background border w-full max-w-sm">
                    <div className="flex items-start gap-4">
                        <HeartPulse className="h-8 w-8 text-primary mt-1" />
                        <div>
                            <h4 className="font-semibold">Sensitive Group Advisory</h4>
                            <p className="text-sm text-muted-foreground">AQI is high. Consider limiting outdoor exertion if you have respiratory conditions.</p>
                        </div>
                    </div>
                </div>
                <div className="p-6 rounded-lg bg-background border w-full max-w-sm">
                    <div className="flex items-start gap-4">
                        <Wind className="h-8 w-8 text-primary mt-1" />
                        <div>
                            <h4 className="font-semibold">Ventilation Tip</h4>
                            <p className="text-sm text-muted-foreground">Air quality is good. It's a great time to open windows and ventilate your home.</p>
                        </div>
                    </div>
                </div>
             </div>
          </div>
        </div>
      </div>
    </section>
  );
}
