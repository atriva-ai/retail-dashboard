"use client"

import type React from "react"

import type { TooltipProps } from "recharts"

interface ChartWrapperProps {
  children: React.ReactNode
  content: React.ComponentType<any>
  className?: string
  title?: string
}

export function ChartWrapper({ content: Content, className, title }: ChartWrapperProps) {
  return (
    <div className={className}>
      {title && <h3>{title}</h3>}
      <Content />
    </div>
  )
}

export const ChartTooltip = ({ active, payload, label }: TooltipProps<any, any>) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border rounded-md p-2 shadow-md">
        <p className="font-bold">{`${label}`}</p>
        {payload.map((item, index) => (
          <p key={index} className="text-gray-700">
            {`${item.name}: ${item.value}`}
          </p>
        ))}
      </div>
    )
  }

  return null
}
