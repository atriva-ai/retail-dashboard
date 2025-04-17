"use client"

import { useState } from "react"
import Image from "next/image"

const heatmapColors = [
  "rgba(0, 255, 0, 0.3)", // Low traffic - green
  "rgba(255, 255, 0, 0.4)", // Medium traffic - yellow
  "rgba(255, 165, 0, 0.5)", // High traffic - orange
  "rgba(255, 0, 0, 0.6)", // Very high traffic - red
]

interface HeatPoint {
  x: number
  y: number
  value: number
}

// Generate sample heatmap data
const generateHeatmapData = () => {
  const points: HeatPoint[] = []

  // Create hotspots in different areas
  // Entrance area
  for (let i = 0; i < 20; i++) {
    points.push({
      x: Math.random() * 150 + 50,
      y: Math.random() * 100 + 50,
      value: Math.random() * 0.8 + 0.2,
    })
  }

  // Product area A (high traffic)
  for (let i = 0; i < 30; i++) {
    points.push({
      x: Math.random() * 150 + 250,
      y: Math.random() * 100 + 100,
      value: Math.random() * 0.4 + 0.6,
    })
  }

  // Product area B (medium traffic)
  for (let i = 0; i < 25; i++) {
    points.push({
      x: Math.random() * 150 + 450,
      y: Math.random() * 100 + 100,
      value: Math.random() * 0.3 + 0.4,
    })
  }

  // Product area C (low traffic)
  for (let i = 0; i < 15; i++) {
    points.push({
      x: Math.random() * 150 + 650,
      y: Math.random() * 100 + 100,
      value: Math.random() * 0.3 + 0.1,
    })
  }

  // Checkout area
  for (let i = 0; i < 25; i++) {
    points.push({
      x: Math.random() * 200 + 400,
      y: Math.random() * 100 + 250,
      value: Math.random() * 0.5 + 0.3,
    })
  }

  return points
}

export default function ProductHeatmap() {
  const [heatmapData] = useState(generateHeatmapData())

  return (
    <div className="relative w-full h-full">
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative w-full h-full">
          <Image
            src="/placeholder.svg?height=400&width=800&text=Store+Layout"
            alt="Store Layout"
            fill
            className="object-contain"
          />

          <canvas
            id="heatmap-canvas"
            className="absolute inset-0 w-full h-full"
            width={800}
            height={400}
            style={{ opacity: 0.8 }}
            ref={(canvas) => {
              if (canvas) {
                const ctx = canvas.getContext("2d")
                if (ctx) {
                  // Clear canvas
                  ctx.clearRect(0, 0, canvas.width, canvas.height)

                  // Draw heatmap points
                  heatmapData.forEach((point) => {
                    const gradient = ctx.createRadialGradient(point.x, point.y, 0, point.x, point.y, 30)

                    // Determine color based on value
                    const colorIndex = Math.min(
                      Math.floor(point.value * heatmapColors.length),
                      heatmapColors.length - 1,
                    )

                    gradient.addColorStop(0, heatmapColors[colorIndex])
                    gradient.addColorStop(1, "rgba(0, 0, 0, 0)")

                    ctx.fillStyle = gradient
                    ctx.beginPath()
                    ctx.arc(point.x, point.y, 30, 0, 2 * Math.PI)
                    ctx.fill()
                  })

                  // Add zone labels
                  ctx.font = "12px Arial"
                  ctx.fillStyle = "rgba(0, 0, 0, 0.7)"
                  ctx.fillText("Entrance", 100, 40)
                  ctx.fillText("Product Area A", 300, 80)
                  ctx.fillText("Product Area B", 500, 80)
                  ctx.fillText("Product Area C", 700, 80)
                  ctx.fillText("Checkout", 450, 300)
                }
              }
            }}
          />
        </div>
      </div>

      <div className="absolute bottom-2 right-2 flex items-center bg-white/80 p-2 rounded-md">
        <div className="flex items-center space-x-2 text-xs">
          <span>Low</span>
          <div className="flex space-x-1">
            {heatmapColors.map((color, i) => (
              <div key={i} className="w-4 h-4 rounded-sm" style={{ backgroundColor: color.replace(/[^,]+\)/, "1)") }} />
            ))}
          </div>
          <span>High</span>
        </div>
      </div>
    </div>
  )
}
