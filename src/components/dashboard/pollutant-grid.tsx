import { AqiData } from "@/lib/types";
import { PollutantCard } from "./pollutant-card";

type PollutantGridProps = {
  data: AqiData;
};

export function PollutantGrid({ data }: PollutantGridProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {data.pollutants.map((pollutant) => (
        <PollutantCard key={pollutant.name} pollutant={pollutant} />
      ))}
    </div>
  );
}
