"use client"

import { useEffect, useRef } from "react"

interface PathPoint {
  x: number
  y: number
}

interface CustomerPath {
  id: number
  color: string
  path: PathPoint[]
}

// Sample customer paths
const customerPaths: CustomerPath[] = [
  {
    id: 1,
    color: "#0ea5e9",
    path: [
      { x: 100, y: 50 },
      { x: 150, y: 100 },
      { x: 250, y: 120 },
      { x: 350, y: 150 },
      { x: 450, y: 180 },
      { x: 550, y: 200 },
      { x: 650, y: 250 },
      { x: 700, y: 300 },
    ],
  },
  {
    id: 2,
    color: "#10b981",
    path: [
      { x: 100, y: 70 },
      { x: 200, y: 100 },
      { x: 300, y: 150 },
      { x: 400, y: 120 },
      { x: 500, y: 100 },
      { x: 600, y: 150 },
      { x: 700, y: 250 },
    ],
  },
  {
    id: 3,
    color: "#f59e0b",
    path: [
      { x: 100, y: 60 },
      { x: 180, y: 80 },
      { x: 250, y: 100 },
      { x: 300, y: 150 },
      { x: 350, y: 200 },
      { x: 400, y: 250 },
      { x: 500, y: 280 },
      { x: 600, y: 300 },
      { x: 700, y: 280 },
    ],
  },
  {
    id: 4,
    color: "#8b5cf6",
    path: [
      { x: 100, y: 80 },
      { x: 150, y: 120 },
      { x: 200, y: 180 },
      { x: 300, y: 200 },
      { x: 400, y: 220 },
      { x: 500, y: 250 },
      { x: 600, y: 270 },
      { x: 700, y: 290 },
    ],
  },
]

export default function PersonJourneyMap() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Draw store zones
    ctx.fillStyle = "rgba(229, 231, 235, 0.5)"

    // Entrance zone
    ctx.fillRect(50, 30, 100, 80)
    ctx.fillStyle = "rgba(0, 0, 0, 0.7)"
    ctx.font = "12px Arial"
    ctx.fillText("Entrance", 70, 70)

    // Product zones
    ctx.fillStyle = "rgba(209, 250, 229, 0.5)"
    ctx.fillRect(200, 80, 150, 100)
    ctx.fillStyle = "rgba(0, 0, 0, 0.7)"
    ctx.fillText("Product Area A", 230, 130)

    ctx.fillStyle = "rgba(219, 234, 254, 0.5)"
    ctx.fillRect(400, 80, 150, 100)
    ctx.fillStyle = "rgba(0, 0, 0, 0.7)"
    ctx.fillText("Product Area B", 430, 130)

    ctx.fillStyle = "rgba(254, 226, 226, 0.5)"
    ctx.fillRect(600, 80, 150, 100)
    ctx.fillStyle = "rgba(0, 0, 0, 0.7)"
    ctx.fillText("Product Area C", 630, 130)

    // Checkout zone
    ctx.fillStyle = "rgba(254, 240, 138, 0.5)"
    ctx.fillRect(400, 230, 200, 80)
    ctx.fillStyle = "rgba(0, 0, 0, 0.7)"
    ctx.fillText("Checkout", 470, 270)

    // Exit zone
    ctx.fillStyle = "rgba(229, 231, 235, 0.5)"
    ctx.fillRect(650, 250, 100, 80)
    ctx.fillStyle = "rgba(0, 0, 0, 0.7)"
    ctx.fillText("Exit", 685, 290)

    // Draw customer paths
    customerPaths.forEach((customer) => {
      ctx.strokeStyle = customer.color
      ctx.lineWidth = 3
      ctx.beginPath()

      // Start point
      ctx.moveTo(customer.path[0].x, customer.path[0].y)

      // Draw path
      for (let i = 1; i < customer.path.length; i++) {
        ctx.lineTo(customer.path[i].x, customer.path[i].y)
      }

      ctx.stroke()

      // Draw points
      customer.path.forEach((point) => {
        ctx.fillStyle = customer.color
        ctx.beginPath()
        ctx.arc(point.x, point.y, 4, 0, 2 * Math.PI)
        ctx.fill()
      })
    })

    // Draw legend
    ctx.fillStyle = "rgba(255, 255, 255, 0.8)"
    ctx.fillRect(20, 330, 200, 50)
    ctx.strokeStyle = "rgba(0, 0, 0, 0.2)"
    ctx.strokeRect(20, 330, 200, 50)

    ctx.fillStyle = "rgba(0, 0, 0, 0.7)"
    ctx.fillText("Customer Journeys:", 30, 350)

    customerPaths.forEach((customer, index) => {
      ctx.fillStyle = customer.color
      ctx.beginPath()
      ctx.arc(50 + index * 40, 370, 4, 0, 2 * Math.PI)
      ctx.fill()

      ctx.strokeStyle = customer.color
      ctx.beginPath()
      ctx.moveTo(60 + index * 40, 370)
      ctx.lineTo(80 + index * 40, 370)
      ctx.stroke()
    })
  }, [])

  return (
    <div className="relative w-full h-full">
      <canvas ref={canvasRef} width={800} height={400} className="w-full h-full" />
    </div>
  )
}
