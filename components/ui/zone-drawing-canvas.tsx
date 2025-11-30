"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RefreshCw, RotateCcw, Square, Pentagon, Hexagon } from "lucide-react"
import { apiClient } from "@/lib/api"

interface ZoneCoordinate {
  type: 'rectangle' | 'pentagon' | 'hexagon'
  points: Array<{ x: number; y: number }>
}

interface ZoneDrawingCanvasProps {
  cameraId: number
  onZoneComplete: (coordinates: ZoneCoordinate) => void
  onCancel: () => void
}

export default function ZoneDrawingCanvas({ cameraId, onZoneComplete, onCancel }: ZoneDrawingCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [zoneType, setZoneType] = useState<'rectangle' | 'pentagon' | 'hexagon'>('rectangle')
  const [isDrawing, setIsDrawing] = useState(false)
  const [startPoint, setStartPoint] = useState<{ x: number; y: number } | null>(null)
  const [currentZone, setCurrentZone] = useState<ZoneCoordinate | null>(null)
  const [snapshotUrl, setSnapshotUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Corner dragging state
  const [isDraggingCorner, setIsDraggingCorner] = useState(false)
  const [draggedCornerIndex, setDraggedCornerIndex] = useState<number | null>(null)
  const [hoveredCornerIndex, setHoveredCornerIndex] = useState<number | null>(null)

  // Load camera snapshot
  const loadSnapshot = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Get the latest frame using the same API method as camera settings
      const frameResponse = await apiClient.get<Blob>(`/api/v1/cameras/${cameraId}/latest-frame/`, {
        responseType: 'blob'
      })
      
      if (frameResponse) {
        const imageUrl = URL.createObjectURL(frameResponse)
        setSnapshotUrl(imageUrl)
      } else {
        throw new Error('Failed to load camera snapshot')
      }
    } catch (err) {
      setError('Failed to load camera snapshot. Please ensure the camera is active and has decoded frames.')
      console.error('Error loading snapshot:', err)
    } finally {
      setLoading(false)
    }
  }, [cameraId])

  useEffect(() => {
    loadSnapshot()
    
    return () => {
      if (snapshotUrl) {
        URL.revokeObjectURL(snapshotUrl)
      }
    }
  }, [loadSnapshot])

  // Generate zone points based on type and start/end points
  const generateZonePoints = useCallback((start: { x: number; y: number }, end: { x: number; y: number }, type: string) => {
    const centerX = (start.x + end.x) / 2
    const centerY = (start.y + end.y) / 2
    const radiusX = Math.abs(end.x - start.x) / 2
    const radiusY = Math.abs(end.y - start.y) / 2
    const radius = Math.max(radiusX, radiusY)

    switch (type) {
      case 'rectangle':
        return [
          { x: start.x, y: start.y },
          { x: end.x, y: start.y },
          { x: end.x, y: end.y },
          { x: start.x, y: end.y }
        ]
      
      case 'pentagon':
        return Array.from({ length: 5 }, (_, i) => {
          const angle = (i * 2 * Math.PI) / 5 - Math.PI / 2
          return {
            x: centerX + radius * Math.cos(angle),
            y: centerY + radius * Math.sin(angle)
          }
        })
      
      case 'hexagon':
        return Array.from({ length: 6 }, (_, i) => {
          const angle = (i * 2 * Math.PI) / 6
          return {
            x: centerX + radius * Math.cos(angle),
            y: centerY + radius * Math.sin(angle)
          }
        })
      
      default:
        return []
    }
  }, [])

  // Helper function to check if a point is near a corner
  const getCornerAtPosition = useCallback((x: number, y: number, points: Array<{ x: number; y: number }>) => {
    const threshold = 10 // pixels
    for (let i = 0; i < points.length; i++) {
      const point = points[i]
      const distance = Math.sqrt((x - point.x) ** 2 + (y - point.y) ** 2)
      if (distance <= threshold) {
        return i
      }
    }
    return null
  }, [])

  // Draw the image and any existing zones
  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Draw background image if available
    if (snapshotUrl) {
      const img = new Image()
      img.onload = () => {
        // Calculate aspect ratio to fit image properly
        const imgAspect = img.width / img.height
        const canvasAspect = canvas.width / canvas.height
        
        let drawWidth = canvas.width
        let drawHeight = canvas.height
        let offsetX = 0
        let offsetY = 0

        if (imgAspect > canvasAspect) {
          // Image is wider than canvas
          drawHeight = canvas.width / imgAspect
          offsetY = (canvas.height - drawHeight) / 2
        } else {
          // Image is taller than canvas
          drawWidth = canvas.height * imgAspect
          offsetX = (canvas.width - drawWidth) / 2
        }

        ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight)
        
        // Draw current zone if exists
        if (currentZone && currentZone.points.length > 0) {
          // Draw zone fill
          ctx.strokeStyle = '#00ff00'
          ctx.fillStyle = 'rgba(0, 255, 0, 0.2)'
          ctx.lineWidth = 3
          ctx.beginPath()
          ctx.moveTo(currentZone.points[0].x, currentZone.points[0].y)
          
          for (let i = 1; i < currentZone.points.length; i++) {
            ctx.lineTo(currentZone.points[i].x, currentZone.points[i].y)
          }
          
          ctx.closePath()
          ctx.fill()
          ctx.stroke()
          
          // Draw corner indicators
          currentZone.points.forEach((point, index) => {
            const isHovered = hoveredCornerIndex === index
            const isDragging = draggedCornerIndex === index
            
            ctx.fillStyle = isDragging ? '#ff0000' : isHovered ? '#ffff00' : '#00ff00'
            ctx.strokeStyle = '#000000'
            ctx.lineWidth = 2
            
            ctx.beginPath()
            ctx.arc(point.x, point.y, 6, 0, 2 * Math.PI)
            ctx.fill()
            ctx.stroke()
          })
        }
      }
      img.src = snapshotUrl
    }
  }, [snapshotUrl, currentZone, hoveredCornerIndex, draggedCornerIndex])

  useEffect(() => {
    drawCanvas()
  }, [drawCanvas])

  // Handle mouse events
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height
    
    const x = (e.clientX - rect.left) * scaleX
    const y = (e.clientY - rect.top) * scaleY

    // Check if clicking on an existing corner
    if (currentZone && currentZone.points.length > 0) {
      const cornerIndex = getCornerAtPosition(x, y, currentZone.points)
      if (cornerIndex !== null) {
        setIsDraggingCorner(true)
        setDraggedCornerIndex(cornerIndex)
        return
      }
    }

    // Start drawing new zone
    setStartPoint({ x, y })
    setIsDrawing(true)
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height
    
    const x = (e.clientX - rect.left) * scaleX
    const y = (e.clientY - rect.top) * scaleY

    // Handle corner dragging
    if (isDraggingCorner && draggedCornerIndex !== null && currentZone) {
      const newPoints = [...currentZone.points]
      newPoints[draggedCornerIndex] = { x, y }
      setCurrentZone({
        ...currentZone,
        points: newPoints
      })
      return
    }

    // Handle corner hovering
    if (currentZone && currentZone.points.length > 0) {
      const cornerIndex = getCornerAtPosition(x, y, currentZone.points)
      setHoveredCornerIndex(cornerIndex)
    }

    // Handle initial drawing
    if (!isDrawing || !startPoint) return

    const points = generateZonePoints(startPoint, { x, y }, zoneType)
    setCurrentZone({
      type: zoneType,
      points
    })
  }

  const handleMouseUp = () => {
    if (isDraggingCorner) {
      setIsDraggingCorner(false)
      setDraggedCornerIndex(null)
      return
    }

    if (isDrawing && startPoint && currentZone) {
      // Zone is complete
      setIsDrawing(false)
      setStartPoint(null)
    }
  }

  const handleConfirmZone = () => {
    if (currentZone) {
      onZoneComplete(currentZone)
    }
  }

  const handleReset = () => {
    setCurrentZone(null)
    setStartPoint(null)
    setIsDrawing(false)
    setIsDraggingCorner(false)
    setDraggedCornerIndex(null)
    setHoveredCornerIndex(null)
  }

  const handleRefresh = () => {
    loadSnapshot()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading camera snapshot...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-4">
        <div className="text-center p-4 text-red-500">
          <p>{error}</p>
        </div>
        <div className="flex justify-center gap-2">
          <Button onClick={handleRefresh} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
          <Button onClick={onCancel} variant="outline">
            Cancel
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Draw Zone</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <div className="text-sm text-muted-foreground">Zone Type:</div>
              <Select value={zoneType} onValueChange={(value: 'rectangle' | 'pentagon' | 'hexagon') => setZoneType(value)}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rectangle">
                    <div className="flex items-center space-x-2">
                      <Square className="h-4 w-4" />
                      <span>Rectangle</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="pentagon">
                    <div className="flex items-center space-x-2">
                      <Pentagon className="h-4 w-4" />
                      <span>Pentagon</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="hexagon">
                    <div className="flex items-center space-x-2">
                      <Hexagon className="h-4 w-4" />
                      <span>Hexagon</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="text-sm text-muted-foreground">
              Click and drag to draw a {zoneType} zone for zone-based analytics.
            </div>
            
            <div className="border rounded-lg overflow-hidden">
              <canvas
                ref={canvasRef}
                width={640}
                height={480}
                className={`w-full h-auto ${hoveredCornerIndex !== null ? 'cursor-move' : 'cursor-crosshair'}`}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
              />
            </div>

            {currentZone && (
              <div className="text-sm text-muted-foreground">
                Zone: {currentZone.type} with {currentZone.points.length} points
              </div>
            )}

            <div className="flex gap-2">
              <Button onClick={handleConfirmZone} disabled={!currentZone}>
                Confirm Zone
              </Button>
              <Button onClick={handleReset} variant="outline" disabled={!currentZone}>
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset
              </Button>
              <Button onClick={handleRefresh} variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Button onClick={onCancel} variant="outline">
                Cancel
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 