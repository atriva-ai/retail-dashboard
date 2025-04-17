"use client"

import { Line, LineChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { ChartTooltip } from "@/components/ui/chart"

const data = [
  { time: "8AM", cashier1: 2.1, cashier2: 2.3, cashier3: 2.0 },
  { time: "9AM", cashier1: 2.3, cashier2: 2.5, cashier3: 2.2 },
  { time: "10AM", cashier1: 2.5, cashier2: 2.7, cashier3: 2.4 },
  { time: "11AM", cashier1: 2.8, cashier2: 3.0, cashier3: 2.7 },
  { time: "12PM", cashier1: 3.2, cashier2: 3.5, cashier3: 3.1 },
  { time: "1PM", cashier1: 3.0, cashier2: 3.3, cashier3: 2.9 },
  { time: "2PM", cashier1: 2.7, cashier2: 2.9, cashier3: 2.6 },
  { time: "3PM", cashier1: 2.5, cashier2: 2.7, cashier3: 2.4 },
  { time: "4PM", cashier1: 2.6, cashier2: 2.8, cashier3: 2.5 },
  { time: "5PM", cashier1: 2.9, cashier2: 3.1, cashier3: 2.8 },
  { time: "6PM", cashier1: 3.3, cashier2: 3.6, cashier3: 3.2 },
  { time: "7PM", cashier1: 3.0, cashier2: 3.2, cashier3: 2.9 },
  { time: "8PM", cashier1: 2.7, cashier2: 2.9, cashier3: 2.6 },
  { time: "9PM", cashier1: 2.4, cashier2: 2.6, cashier3: 2.3 },
]

export default function StaffServiceTime() {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart
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
        <YAxis label={{ value: "Minutes", angle: -90, position: "insideLeft" }} />
        <Tooltip content={<ChartTooltip />} />
        <Legend />
        <Line type="monotone" dataKey="cashier1" name="Cashier 1" stroke="#0ea5e9" activeDot={{ r: 8 }} />
        <Line type="monotone" dataKey="cashier2" name="Cashier 2" stroke="#10b981" activeDot={{ r: 8 }} />
        <Line type="monotone" dataKey="cashier3" name="Cashier 3" stroke="#f59e0b" activeDot={{ r: 8 }} />
      </LineChart>
    </ResponsiveContainer>
  )
}
