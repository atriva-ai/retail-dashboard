"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RefreshCw, RotateCcw } from "lucide-react"
import { apiClient } from "@/lib/api"

interface LineCoordinate {
  x1: number
  y1: number
  x2: number
  y2: number
}

interface LineDrawingCanvasProps {
  cameraId: number
  onLineComplete: (coordinates: LineCoordinate, entranceSidePoint?: { x: number; y: number }) => void
  onCancel: () => void
  requireEntranceSide?: boolean // If true, user must mark entrance side after drawing line
}

export default function LineDrawingCanvas({ cameraId, onLineComplete, onCancel, requireEntranceSide = false }: LineDrawingCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [startPoint, setStartPoint] = useState<{ x: number; y: number } | null>(null)
  const [currentLine, setCurrentLine] = useState<LineCoordinate | null>(null)
  const [entranceSidePoint, setEntranceSidePoint] = useState<{ x: number; y: number } | null>(null)
  const [isMarkingEntrance, setIsMarkingEntrance] = useState(false)
  const [lineConfirmed, setLineConfirmed] = useState(false)
  const [snapshotUrl, setSnapshotUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Debug logging
  console.log('🔍 LineDrawingCanvas - cameraId:', cameraId)
  console.log('🔍 LineDrawingCanvas - cameraId type:', typeof cameraId)

  // Load camera snapshot
  const loadSnapshot = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      console.log('🔍 LineDrawingCanvas - Loading snapshot for cameraId:', cameraId)
      console.log('🔍 LineDrawingCanvas - API URL will be:', `/api/v1/cameras/${cameraId}/latest-frame/`)
      
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

  // Draw the image and any existing lines
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
        
        // Draw current line if exists
        if (currentLine) {
          ctx.strokeStyle = '#ff0000'
          ctx.lineWidth = 3
          ctx.beginPath()
          ctx.moveTo(currentLine.x1, currentLine.y1)
          ctx.lineTo(currentLine.x2, currentLine.y2)
          ctx.stroke()
          
          // Draw arrow indicator to show line direction
          const dx = currentLine.x2 - currentLine.x1
          const dy = currentLine.y2 - currentLine.y1
          const length = Math.sqrt(dx * dx + dy * dy)
          const angle = Math.atan2(dy, dx)
          
          // Arrow head at the end of the line
          const arrowLength = 15
          const arrowWidth = 8
          const arrowX = currentLine.x2
          const arrowY = currentLine.y2
          
          ctx.save()
          ctx.translate(arrowX, arrowY)
          ctx.rotate(angle)
          ctx.beginPath()
          ctx.moveTo(0, 0)
          ctx.lineTo(-arrowLength, -arrowWidth / 2)
          ctx.lineTo(-arrowLength, arrowWidth / 2)
          ctx.closePath()
          ctx.fillStyle = '#ff0000'
          ctx.fill()
          ctx.restore()
        }
        
        // Draw entrance side marker if set
        if (entranceSidePoint) {
          ctx.fillStyle = '#00ff00'
          ctx.beginPath()
          ctx.arc(entranceSidePoint.x, entranceSidePoint.y, 10, 0, 2 * Math.PI)
          ctx.fill()
          ctx.strokeStyle = '#ffffff'
          ctx.lineWidth = 2
          ctx.stroke()
          
          // Draw "ENTRANCE" label
          ctx.fillStyle = '#00ff00'
          ctx.font = 'bold 14px Arial'
          ctx.fillText('ENTRANCE', entranceSidePoint.x + 15, entranceSidePoint.y - 10)
        }
      }
      img.src = snapshotUrl
    }
  }, [snapshotUrl, currentLine, entranceSidePoint])

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

    // If marking entrance side, set the point and exit marking mode
    if (isMarkingEntrance && lineConfirmed) {
      setEntranceSidePoint({ x, y })
      setIsMarkingEntrance(false)
      return
    }

    // Otherwise, draw line
    setStartPoint({ x, y })
    setIsDrawing(true)
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !startPoint) return

    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height
    
    const x = (e.clientX - rect.left) * scaleX
    const y = (e.clientY - rect.top) * scaleY

    setCurrentLine({
      x1: startPoint.x,
      y1: startPoint.y,
      x2: x,
      y2: y
    })
  }

  const handleMouseUp = () => {
    if (isDrawing && startPoint && currentLine) {
      // Line is complete
      setIsDrawing(false)
      setStartPoint(null)
    }
  }

  const handleConfirmLine = () => {
    if (currentLine) {
      if (requireEntranceSide && !entranceSidePoint) {
        // If entrance side is required but not set, enter marking mode
        setIsMarkingEntrance(true)
        setLineConfirmed(true)
        // Update cursor
        const canvas = canvasRef.current
        if (canvas) {
          canvas.style.cursor = 'crosshair'
        }
      } else {
        // Line is complete, call callback with line and entrance side point
        onLineComplete(currentLine, entranceSidePoint || undefined)
      }
    }
  }

  const handleMarkEntranceSide = () => {
    if (currentLine && !lineConfirmed) {
      setLineConfirmed(true)
    }
    setIsMarkingEntrance(true)
    const canvas = canvasRef.current
    if (canvas) {
      canvas.style.cursor = 'crosshair'
    }
  }

  const handleReset = () => {
    setCurrentLine(null)
    setStartPoint(null)
    setEntranceSidePoint(null)
    setIsDrawing(false)
    setIsMarkingEntrance(false)
    setLineConfirmed(false)
    const canvas = canvasRef.current
    if (canvas) {
      canvas.style.cursor = 'crosshair'
    }
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
          <CardTitle className="text-sm">Draw Virtual Line</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="text-sm text-muted-foreground">
              Click and drag to draw a virtual line for line crossing analytics.
            </div>
            
            <div className="border rounded-lg overflow-hidden">
              <canvas
                ref={canvasRef}
                width={640}
                height={480}
                className="w-full h-auto cursor-crosshair"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
              />
            </div>

            {currentLine && (
              <div className="text-sm text-muted-foreground">
                Line coordinates: ({currentLine.x1.toFixed(1)}, {currentLine.y1.toFixed(1)}) to ({currentLine.x2.toFixed(1)}, {currentLine.y2.toFixed(1)})
              </div>
            )}
            
            {isMarkingEntrance && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                <p className="text-sm text-green-800 font-medium">
                  🎯 Click on the side of the line where people ENTER (the entrance side)
                </p>
              </div>
            )}
            
            {entranceSidePoint && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                <p className="text-sm text-green-800">
                  ✅ Entrance side marked at ({entranceSidePoint.x.toFixed(1)}, {entranceSidePoint.y.toFixed(1)})
                </p>
              </div>
            )}

            <div className="flex gap-2">
              {!lineConfirmed ? (
                <Button onClick={handleConfirmLine} disabled={!currentLine}>
                  Confirm Line
                </Button>
              ) : requireEntranceSide && !entranceSidePoint ? (
                <Button onClick={handleMarkEntranceSide} variant="default">
                  Mark Entrance Side
                </Button>
              ) : (
                <Button onClick={() => onLineComplete(currentLine!, entranceSidePoint || undefined)} disabled={!currentLine || (requireEntranceSide && !entranceSidePoint)}>
                  Complete
                </Button>
              )}
              <Button onClick={handleReset} variant="outline" disabled={!currentLine}>
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