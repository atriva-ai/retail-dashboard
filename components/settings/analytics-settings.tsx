"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { AlertCircle, Users, Clock, ArrowRightLeft, Video, X } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { apiClient } from "@/lib/api"

interface Camera {
  id: number
  name: string
  rtsp_url: string
  location: string | null
  is_active: boolean
}

interface AnalyticsConfig {
  id: string
  name: string
  enabled: boolean
  cameras: number[]
}

interface LineCrossingConfig {
  cameraId: number
  lines: Array<{
    id: string
    startX: number
    startY: number
    endX: number
    endY: number
  }>
}

export default function AnalyticsSettings() {
  const [cameras, setCameras] = useState<Camera[]>([])
  const [analytics, setAnalytics] = useState<AnalyticsConfig[]>([
    {
      id: "people-counting",
      name: "People Counting",
      enabled: false,
      cameras: [],
    },
    {
      id: "dwell-time",
      name: "Dwell Time Analysis",
      enabled: false,
      cameras: [],
    },
    {
      id: "line-crossing",
      name: "Line Crossing Traffic",
      enabled: false,
      cameras: [],
    },
  ])
  const [lineCrossingConfig, setLineCrossingConfig] = useState<LineCrossingConfig[]>([])
  const [isLineDrawingOpen, setIsLineDrawingOpen] = useState(false)
  const [selectedCameraForLine, setSelectedCameraForLine] = useState<Camera | null>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [currentLine, setCurrentLine] = useState<{ startX: number; startY: number } | null>(null)
  const [lines, setLines] = useState<Array<{ id: string; startX: number; startY: number; endX: number; endY: number }>>([])

  // Fetch cameras on component mount
  useEffect(() => {
    fetchCameras()
  }, [])

  const fetchCameras = async () => {
    try {
      const response = await apiClient.get<Camera[]>('/api/v1/cameras')
      setCameras(response || [])
    } catch (error) {
      console.error('Failed to fetch cameras:', error)
    }
  }

  const handleAnalyticsToggle = (id: string) => {
    setAnalytics(analytics.map((analytic) => 
      analytic.id === id ? { ...analytic, enabled: !analytic.enabled } : analytic
    ))
  }

  const handleCameraToggle = (analyticsId: string, cameraId: number) => {
    setAnalytics(analytics.map((analytic) => {
      if (analytic.id === analyticsId) {
        const cameras = analytic.cameras.includes(cameraId)
          ? analytic.cameras.filter(id => id !== cameraId)
          : [...analytic.cameras, cameraId]
        
        return { ...analytic, cameras }
      }
      return analytic
    }))
  }

  const handleLineCrossingSetup = (camera: Camera) => {
    setSelectedCameraForLine(camera)
    setIsLineDrawingOpen(true)
    // Load existing lines for this camera
    const existingConfig = lineCrossingConfig.find(config => config.cameraId === camera.id)
    setLines(existingConfig?.lines || [])
  }

  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) {
      const rect = event.currentTarget.getBoundingClientRect()
      const x = event.clientX - rect.left
      const y = event.clientY - rect.top
      setCurrentLine({ startX: x, startY: y })
      setIsDrawing(true)
    } else {
      if (currentLine) {
        const rect = event.currentTarget.getBoundingClientRect()
        const x = event.clientX - rect.left
        const y = event.clientY - rect.top
        const newLine = {
          id: `line-${Date.now()}`,
          startX: currentLine.startX,
          startY: currentLine.startY,
          endX: x,
          endY: y,
        }
        setLines([...lines, newLine])
        setCurrentLine(null)
        setIsDrawing(false)
      }
    }
  }

  const handleCanvasMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (isDrawing && currentLine) {
      const canvas = event.currentTarget
      const ctx = canvas.getContext('2d')
      if (ctx) {
        // Redraw all lines
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        lines.forEach(line => {
          ctx.beginPath()
          ctx.moveTo(line.startX, line.startY)
          ctx.lineTo(line.endX, line.endY)
          ctx.strokeStyle = '#00ff00'
          ctx.lineWidth = 2
          ctx.stroke()
        })
        
        // Draw current line being drawn
        const rect = canvas.getBoundingClientRect()
        const x = event.clientX - rect.left
        const y = event.clientY - rect.top
        ctx.beginPath()
        ctx.moveTo(currentLine.startX, currentLine.startY)
        ctx.lineTo(x, y)
        ctx.strokeStyle = '#ff0000'
        ctx.lineWidth = 2
        ctx.stroke()
      }
    }
  }

  const handleSaveLines = () => {
    if (selectedCameraForLine) {
      setLineCrossingConfig(prev => {
        const filtered = prev.filter(config => config.cameraId !== selectedCameraForLine.id)
        return [...filtered, { cameraId: selectedCameraForLine.id, lines }]
      })
      setIsLineDrawingOpen(false)
      setSelectedCameraForLine(null)
      setLines([])
      setCurrentLine(null)
      setIsDrawing(false)
    }
  }

  const handleDeleteLine = (lineId: string) => {
    setLines(lines.filter(line => line.id !== lineId))
  }

  const getCameraName = (cameraId: number) => {
    return cameras.find(camera => camera.id === cameraId)?.name || `Camera ${cameraId}`
  }

  return (
    <div className="space-y-6">
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Analytics Engine Configuration</AlertTitle>
        <AlertDescription>
          Configure analytics engines and select cameras for each analysis type. Enable the engines you need and assign cameras to them.
        </AlertDescription>
      </Alert>

      <div className="space-y-4">
        {analytics.map((analytic) => (
          <Card key={analytic.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {analytic.id === "people-counting" && <Users className="h-5 w-5" />}
                  {analytic.id === "dwell-time" && <Clock className="h-5 w-5" />}
                  {analytic.id === "line-crossing" && <ArrowRightLeft className="h-5 w-5" />}
                  <CardTitle className="text-lg">{analytic.name}</CardTitle>
                </div>
                <Switch 
                  checked={analytic.enabled} 
                  onCheckedChange={() => handleAnalyticsToggle(analytic.id)} 
                />
              </div>
              <CardDescription>
                {analytic.id === "people-counting" && "Track the number of people entering and exiting areas"}
                {analytic.id === "dwell-time" && "Analyze how long people spend in specific areas"}
                {analytic.id === "line-crossing" && "Monitor traffic flow across defined lines"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {analytic.enabled && (
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium">Select Cameras</Label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                      {cameras.map((camera) => (
                        <div key={camera.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={`${analytic.id}-${camera.id}`}
                            checked={analytic.cameras.includes(camera.id)}
                            onCheckedChange={() => handleCameraToggle(analytic.id, camera.id)}
                          />
                          <Label 
                            htmlFor={`${analytic.id}-${camera.id}`}
                            className="text-sm cursor-pointer"
                          >
                            {camera.name}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {analytic.id === "line-crossing" && analytic.cameras.length > 0 && (
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Line Configuration</Label>
                      <div className="space-y-2">
                        {analytic.cameras.map((cameraId) => {
                          const camera = cameras.find(c => c.id === cameraId)
                          const config = lineCrossingConfig.find(c => c.cameraId === cameraId)
                          return (
                            <div key={cameraId} className="flex items-center justify-between p-2 border rounded">
                              <span className="text-sm">{camera?.name}</span>
                              <Button
                                size="sm"
                                onClick={() => camera && handleLineCrossingSetup(camera)}
                              >
                                <Video className="h-4 w-4 mr-1" />
                                {config?.lines.length ? `${config.lines.length} lines` : 'Draw Lines'}
                              </Button>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Line Drawing Dialog */}
      <Dialog open={isLineDrawingOpen} onOpenChange={setIsLineDrawingOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Draw Crossing Lines - {selectedCameraForLine?.name}</DialogTitle>
            <DialogDescription>
              Click and drag to draw lines. People crossing these lines will be tracked.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="border rounded-lg overflow-hidden">
              <canvas
                width={640}
                height={480}
                className="w-full h-96 bg-black cursor-crosshair"
                onClick={handleCanvasClick}
                onMouseMove={handleCanvasMouseMove}
                style={{ backgroundImage: `url(/placeholder.svg?height=480&width=640&text=Camera+${selectedCameraForLine?.id})` }}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                {isDrawing ? "Click to end line" : "Click to start drawing a line"}
              </div>
              <div className="flex space-x-2">
                {lines.map((line) => (
                  <Button
                    key={line.id}
                    size="sm"
                    variant="outline"
                    onClick={() => handleDeleteLine(line.id)}
                  >
                    <X className="h-3 w-3 mr-1" />
                    Line {line.id.slice(-4)}
                  </Button>
                ))}
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsLineDrawingOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveLines}>
              Save Lines
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
