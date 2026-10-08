"use client";

import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";

const config = {
  receita: { label: "Receita", color: "var(--chart-1)" },
  despesa: { label: "Despesa", color: "var(--chart-2)" },
} satisfies ChartConfig;

export function RevenueChart({ dados }: { dados: Array<{ mes: string; receita: number; despesa: number }> }) {
  return (
    <ChartContainer config={config} className="h-72 w-full">
      <BarChart data={dados} margin={{ left: -16 }}>
        <CartesianGrid vertical={false} />
        <XAxis dataKey="mes" tickLine={false} axisLine={false} tickMargin={8} />
        <ChartTooltip
          content={
            <ChartTooltipContent
              formatter={(value) => `R$ ${(Number(value) / 100).toLocaleString("pt-BR")}`}
            />
          }
        />
        <ChartLegend content={<ChartLegendContent />} />
        <Bar dataKey="receita" fill="var(--color-receita)" radius={4} />
        <Bar dataKey="despesa" fill="var(--color-despesa)" radius={4} />
      </BarChart>
    </ChartContainer>
  );
}
