"use client"

import { Area, AreaChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { ChartTooltip } from "@/components/ui/chart"

const data = [
  { time: "8AM", queue: 1.2, waitTime: 2.5 },
  { time: "9AM", queue: 2.1, waitTime: 4.2 },
  { time: "10AM", queue: 3.5, waitTime: 7.0 },
  { time: "11AM", queue: 4.2, waitTime: 8.4 },
  { time: "12PM", queue: 6.8, waitTime: 13.6 },
  { time: "1PM", queue: 5.9, waitTime: 11.8 },
  { time: "2PM", queue: 4.5, waitTime: 9.0 },
  { time: "3PM", queue: 3.8, waitTime: 7.6 },
  { time: "4PM", queue: 4.2, waitTime: 8.4 },
  { time: "5PM", queue: 5.7, waitTime: 11.4 },
  { time: "6PM", queue: 7.2, waitTime: 14.4 },
  { time: "7PM", queue: 6.1, waitTime: 12.2 },
  { time: "8PM", queue: 4.3, waitTime: 8.6 },
  { time: "9PM", queue: 2.5, waitTime: 5.0 },
]

export default function QueueLength() {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart
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
        <YAxis yAxisId="left" label={{ value: "People", angle: -90, position: "insideLeft" }} />
        <YAxis yAxisId="right" orientation="right" label={{ value: "Minutes", angle: 90, position: "insideRight" }} />
        <Tooltip content={<ChartTooltip />} />
        <Legend />
        <Area
          yAxisId="left"
          type="monotone"
          dataKey="queue"
          name="Queue Length"
          stroke="#0ea5e9"
          fill="#0ea5e9"
          fillOpacity={0.6}
        />
        <Area
          yAxisId="right"
          type="monotone"
          dataKey="waitTime"
          name="Wait Time"
          stroke="#f59e0b"
          fill="#f59e0b"
          fillOpacity={0.6}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
