"use client"

import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { ChartTooltip } from "@/components/ui/chart"

// Static chart data - zone engagement analytics API not implemented yet
const chartData = [
  { zone: "Entrance 1", visitors: 245, engagement: 78 },
  { zone: "Entrance 2", visitors: 198, engagement: 65 },
  { zone: "Product Area A", visitors: 320, engagement: 85 },
  { zone: "Product Area B", visitors: 280, engagement: 72 },
  { zone: "Product Area C", visitors: 195, engagement: 68 },
  { zone: "Product Area D", visitors: 265, engagement: 80 },
  { zone: "Checkout 1", visitors: 420, engagement: 92 },
  { zone: "Checkout 2", visitors: 380, engagement: 88 },
]

export default function ZoneEngagement() {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={chartData}
        margin={{
          top: 20,
          right: 30,
          left: 20,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="zone" angle={-45} textAnchor="end" height={80} />
        <YAxis yAxisId="left" label={{ value: "Visitors", angle: -90, position: "insideLeft" }} />
        <YAxis yAxisId="right" orientation="right" label={{ value: "Engagement %", angle: 90, position: "insideRight" }} />
        <Tooltip content={<ChartTooltip />} />
        <Legend />
        <Bar yAxisId="left" dataKey="visitors" name="Visitors" fill="#0ea5e9" />
        <Bar yAxisId="right" dataKey="engagement" name="Engagement %" fill="#10b981" />
      </BarChart>
    </ResponsiveContainer>
  )
}


