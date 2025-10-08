import { CheckCircle } from "lucide-react";

export function AqiExplained() {
  return (
    <section className="py-20 lg:py-28">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="order-last lg:order-first bg-primary/5 rounded-2xl p-8 lg:p-12 border">
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <p className="text-sm font-medium text-muted-foreground">
                  Sample AQI
                </p>
                <div className="my-4">
                  <span className="text-8xl font-bold tracking-tighter text-destructive">
                    180
                  </span>
                </div>
                <p className="text-3xl font-semibold font-headline text-destructive">
                  Unhealthy
                </p>
              </div>
            </div>
          </div>
          <div>
             <h2 className="text-3xl lg:text-4xl font-bold font-headline">Understand the Air You Breathe</h2>
             <p className="mt-4 text-lg text-muted-foreground">The Air Quality Index (AQI) is a simple tool to understand how polluted the air is. We break it down for you, so you can make informed decisions.</p>
             <ul className="mt-6 space-y-4">
                <li className="flex items-start gap-3">
                    <CheckCircle className="h-6 w-6 text-primary mt-1 shrink-0" />
                    <span><span className="font-semibold">Real-Time Data:</span> Know the current AQI for Lahore and other major cities.</span>
                </li>
                <li className="flex items-start gap-3">
                    <CheckCircle className="h-6 w-6 text-primary mt-1 shrink-0" />
                    <span><span className="font-semibold">Pollutant Breakdown:</span> See levels of PM2.5, Ozone, and other harmful pollutants.</span>
                </li>
                <li className="flex items-start gap-3">
                    <CheckCircle className="h-6 w-6 text-primary mt-1 shrink-0" />
                    <span><span className="font-semibold">Simple Categories:</span> From "Good" to "Hazardous", our color-coded system is easy to understand.</span>
                </li>
             </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
