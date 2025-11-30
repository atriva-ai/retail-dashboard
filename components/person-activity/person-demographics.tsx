"use client"

import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts"
import { ChartTooltip } from "@/components/ui/chart"

const ageData = [
  { name: "Under 18", value: 15 },
  { name: "18-24", value: 22 },
  { name: "25-34", value: 28 },
  { name: "35-44", value: 18 },
  { name: "45-54", value: 10 },
  { name: "55+", value: 7 },
]

const genderData = [
  { name: "Male", value: 48 },
  { name: "Female", value: 52 },
]

const COLORS = ["#0ea5e9", "#10b981", "#f59e0b", "#8b5cf6", "#ec4899", "#ef4444"]
const GENDER_COLORS = ["#0ea5e9", "#ec4899"]

export default function PersonDemographics() {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={ageData}
          cx="30%"
          cy="50%"
          outerRadius={60}
          fill="#8884d8"
          dataKey="value"
          label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
        >
          {ageData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Pie
          data={genderData}
          cx="70%"
          cy="50%"
          outerRadius={60}
          fill="#8884d8"
          dataKey="value"
          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
        >
          {genderData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={GENDER_COLORS[index % GENDER_COLORS.length]} />
          ))}
        </Pie>
        <Tooltip content={<ChartTooltip />} />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  )
}
