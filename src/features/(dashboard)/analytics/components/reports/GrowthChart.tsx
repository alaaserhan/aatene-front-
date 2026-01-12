// src/components/(admin)/analytics/reports/GrowthChart.tsx
"use client";

import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import { cn } from "@/src/lib/utils";

interface GrowthChartProps {
  data: any[];
  title: string;
  lines: {
    key: string;
    color: string;
    name: string;
  }[];
  className?: string;
}

export function GrowthChart({ data, title, lines, className }: GrowthChartProps) {
  return (
    <div className={cn("bg-white rounded-lg p-4 flex flex-col h-[450px]", className)}>
      <div className="flex items-center justify-between mb-6 shrink-0">
        <h3 className="text-lg font-medium flex items-center gap-2">
          {title}
        </h3>
      </div>

      <div className="flex-1 w-full min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              {lines.map((line, i) => (
                <linearGradient key={i} id={`color-${line.key}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={line.color} stopOpacity={0.1} />
                  <stop offset="95%" stopColor={line.color} stopOpacity={0} />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
            <XAxis
              dataKey="date"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: "#9CA3AF" }}
              tickMargin={10}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: "#9CA3AF" }}
            />
            <Tooltip contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }} />

            {lines.map((line) => (
              <Area
                key={line.key}
                type="monotone"
                dataKey={line.key}
                name={line.name}
                stroke={line.color}
                fill={`url(#color-${line.key})`}
                strokeWidth={2}
                dot={false}
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="flex items-center justify-center gap-6 mt-4 shrink-0">
        {lines.map((line) => (
          <div key={line.key} className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: line.color }} />
            <span className="text-xs text-gray-2 font-medium">{line.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}