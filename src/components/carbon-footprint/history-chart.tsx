"use client"

import {
  Area,
  AreaChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { FootprintHistoryEntry } from "@/hooks/use-footprint-history"

const chartConfig = {
  footprint: {
    label: "CO₂ Footprint",
    color: "hsl(var(--primary))",
  },
}

type HistoryChartProps = {
    data: FootprintHistoryEntry[];
};

export function HistoryChart({ data }: HistoryChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex h-[250px] w-full items-center justify-center rounded-lg border-2 border-dashed text-muted-foreground">
        No data yet. Calculate your footprint to see your progress!
      </div>
    )
  }

  return (
    <div className="h-[250px] w-full">
        <ChartContainer config={chartConfig}>
            <AreaChart
                accessibilityLayer
                data={data}
                margin={{
                left: 12,
                right: 12,
                }}
            >
                <CartesianGrid vertical={false} />
                <XAxis
                    dataKey="date"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    tickFormatter={(value) => {
                        const date = new Date(value);
                        return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
                    }}
                />
                <YAxis 
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    domain={['dataMin - 10', 'dataMax + 10']}
                />
                <Tooltip
                    cursor={false}
                    content={<ChartTooltipContent indicator="dot" />}
                />
                <defs>
                    <linearGradient id="fillFootprint" x1="0" y1="0" x2="0" y2="1">
                        <stop
                        offset="5%"
                        stopColor="var(--color-footprint)"
                        stopOpacity={0.8}
                        />
                        <stop
                        offset="95%"
                        stopColor="var(--color-footprint)"
                        stopOpacity={0.1}
                        />
                    </linearGradient>
                </defs>
                <Area
                    dataKey="footprint"
                    type="natural"
                    fill="url(#fillFootprint)"
                    stroke="var(--color-footprint)"
                    stackId="a"
                />
            </AreaChart>
        </ChartContainer>
    </div>
  )
}
