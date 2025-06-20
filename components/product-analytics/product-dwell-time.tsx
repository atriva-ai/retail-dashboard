"use client"

import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { ChartTooltip } from "@/components/ui/chart"

const data = [
  { zone: "Product A", avgTime: 5.2, peakTime: 7.8 },
  { zone: "Product B", avgTime: 4.1, peakTime: 6.2 },
  { zone: "Product C", avgTime: 3.8, peakTime: 5.5 },
  { zone: "Product D", avgTime: 6.3, peakTime: 9.1 },
  { zone: "Product E", avgTime: 2.9, peakTime: 4.3 },
  { zone: "Product F", avgTime: 4.7, peakTime: 7.0 },
]

export default function ProductDwellTime() {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={data}
        margin={{
          top: 20,
          right: 30,
          left: 20,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="zone" />
        <YAxis label={{ value: "Minutes", angle: -90, position: "insideLeft" }} />
        <Tooltip content={<ChartTooltip />} />
        <Legend />
        <Bar dataKey="avgTime" name="Average Dwell Time" fill="#10b981" />
        <Bar dataKey="peakTime" name="Peak Dwell Time" fill="#0ea5e9" />
      </BarChart>
    </ResponsiveContainer>
  )
}
