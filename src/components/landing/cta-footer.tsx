import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Leaf } from "lucide-react";

export function CtaFooter() {
  return (
    <section className="py-20 lg:py-28 bg-primary/10">
      <div className="container mx-auto px-4 text-center">
        <Leaf className="h-12 w-12 text-primary mx-auto mb-4" />
        <h2 className="text-3xl lg:text-4xl font-bold font-headline text-foreground">
          Ready to Take Control of Your Air Quality?
        </h2>
        <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
          Join thousands of others in Pakistan taking steps towards a healthier life and a cleaner environment. Access all features now.
        </p>
        <div className="mt-8">
          <Button asChild size="lg">
            <Link href="/dashboard">Go to the App</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
