"use client"

import { Area, AreaChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { ChartTooltip } from "@/components/ui/chart"

const data = [
  { time: "8AM", entrance: 40, productArea: 24, checkout: 10 },
  { time: "9AM", entrance: 65, productArea: 45, checkout: 20 },
  { time: "10AM", entrance: 85, productArea: 62, checkout: 35 },
  { time: "11AM", entrance: 120, productArea: 80, checkout: 50 },
  { time: "12PM", entrance: 150, productArea: 105, checkout: 65 },
  { time: "1PM", entrance: 180, productArea: 120, checkout: 80 },
  { time: "2PM", entrance: 160, productArea: 130, checkout: 70 },
  { time: "3PM", entrance: 140, productArea: 110, checkout: 60 },
  { time: "4PM", entrance: 120, productArea: 90, checkout: 50 },
  { time: "5PM", entrance: 150, productArea: 110, checkout: 70 },
  { time: "6PM", entrance: 180, productArea: 140, checkout: 90 },
  { time: "7PM", entrance: 200, productArea: 160, checkout: 100 },
  { time: "8PM", entrance: 180, productArea: 140, checkout: 90 },
  { time: "9PM", entrance: 120, productArea: 80, checkout: 50 },
]

export default function DashboardChart() {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart
        data={data}
        margin={{
          top: 20,
          right: 20,
          left: 0,
          bottom: 0,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="time" />
        <YAxis />
        <Tooltip content={<ChartTooltip />} />
        <Legend />
        <Area
          type="monotone"
          dataKey="entrance"
          stackId="1"
          stroke="#0ea5e9"
          fill="#0ea5e9"
          fillOpacity={0.6}
          name="Entrance"
        />
        <Area
          type="monotone"
          dataKey="productArea"
          stackId="2"
          stroke="#10b981"
          fill="#10b981"
          fillOpacity={0.6}
          name="Product Area"
        />
        <Area
          type="monotone"
          dataKey="checkout"
          stackId="3"
          stroke="#f59e0b"
          fill="#f59e0b"
          fillOpacity={0.6}
          name="Checkout"
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
