"use client"

import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { ChartTooltip } from "@/components/ui/chart"

const data = [
  { day: "Mon", dwellTime: 45, activity: 28 },
  { day: "Tue", dwellTime: 52, activity: 32 },
  { day: "Wed", dwellTime: 48, activity: 30 },
  { day: "Thu", dwellTime: 61, activity: 38 },
  { day: "Fri", dwellTime: 65, activity: 42 },
  { day: "Sat", dwellTime: 78, activity: 52 },
  { day: "Sun", dwellTime: 42, activity: 25 },
]

export default function InventoryActivity() {
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
        <XAxis dataKey="day" />
        <YAxis />
        <Tooltip content={<ChartTooltip />} />
        <Legend />
        <Bar dataKey="dwellTime" name="Dwell Time (min)" fill="#0ea5e9" />
        <Bar dataKey="activity" name="Activity Count" fill="#10b981" />
      </BarChart>
    </ResponsiveContainer>
  )
}
