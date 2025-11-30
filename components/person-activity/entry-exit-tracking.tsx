"use client"

import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { ChartTooltip } from "@/components/ui/chart"

const data = [
  { time: "8AM", entry: 45, exit: 10 },
  { time: "9AM", entry: 65, exit: 25 },
  { time: "10AM", entry: 85, exit: 40 },
  { time: "11AM", entry: 95, exit: 60 },
  { time: "12PM", entry: 120, exit: 80 },
  { time: "1PM", entry: 110, exit: 95 },
  { time: "2PM", entry: 90, exit: 100 },
  { time: "3PM", entry: 85, exit: 90 },
  { time: "4PM", entry: 95, exit: 85 },
  { time: "5PM", entry: 110, exit: 95 },
  { time: "6PM", entry: 130, exit: 110 },
  { time: "7PM", entry: 100, exit: 120 },
  { time: "8PM", entry: 70, exit: 130 },
  { time: "9PM", entry: 30, exit: 90 },
]

export default function EntryExitTracking() {
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
        <XAxis dataKey="time" />
        <YAxis />
        <Tooltip content={<ChartTooltip />} />
        <Legend />
        <Bar dataKey="entry" name="Entries" fill="#10b981" />
        <Bar dataKey="exit" name="Exits" fill="#f59e0b" />
      </BarChart>
    </ResponsiveContainer>
  )
}
