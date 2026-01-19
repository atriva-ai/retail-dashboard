"use client"

import { useState, useEffect, useCallback } from "react"
import type React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  Brain, 
  Edit, 
  Plus, 
  Trash, 
  RefreshCw, 
  Users, 
  Clock, 
  UserCheck, 
  TrendingUp,
  MapPin,
  Activity,
  ArrowRight,
  ArrowLeft,
  ArrowUpDown
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useToast } from "@/components/ui/use-toast"
import { apiClient } from "@/lib/api"
import LineDrawingCanvas from "@/components/ui/line-drawing-canvas"
import ZoneDrawingCanvas from "@/components/ui/zone-drawing-canvas"

interface Camera {
  id: number
  name: string
  rtsp_url: string
  location: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

interface AnalyticsEngine {
  id: number
  name: string
  type: string
  config: any
  is_active: boolean
  created_at: string
  updated_at: string
  cameras?: Camera[]
}

interface LineCoordinate {
  x1: number
  y1: number
  x2: number
  y2: number
}

interface ZoneCoordinate {
  type: 'rectangle' | 'pentagon' | 'hexagon'
  points: Array<{ x: number; y: number }>
}

interface AnalyticsTypeConfig {
  value: string
  label: string
  description: string
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>
  requiresZone: boolean
  requiresLine: boolean
}

// Map analytics type to icon component
const getIconForType = (type: string): React.ComponentType<React.SVGProps<SVGSVGElement>> => {
  const iconMap: Record<string, React.ComponentType<React.SVGProps<SVGSVGElement>>> = {
    "people_counting": Users,
    "dwell_time": Clock,
    "demographic": UserCheck,
    "people_counting_by_zone": MapPin,
    "dwell_time_by_zone": Clock,
    "line_cross_count": TrendingUp,
    "demographic_on_line_crossing": UserCheck,
    "entrance": Activity,
  }
  return iconMap[type] || Brain
}

export default function AnalyticsEnginesSettings() {
  const [analyticsEngines, setAnalyticsEngines] = useState<AnalyticsEngine[]>([])
  const [analyticsTypes, setAnalyticsTypes] = useState<AnalyticsTypeConfig[]>([])
  const [cameras, setCameras] = useState<Camera[]>([])
  const [loading, setLoading] = useState(true)
  const [editEngine, setEditEngine] = useState<AnalyticsEngine | null>(null)
  const [newEngine, setNewEngine] = useState<Partial<AnalyticsEngine>>({
    name: "",
    type: undefined,
    config: {},
    is_active: true,
  })
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isLineDrawingOpen, setIsLineDrawingOpen] = useState(false)
  const [isZoneDrawingOpen, setIsZoneDrawingOpen] = useState(false)
  const [selectedCameraForDrawing, setSelectedCameraForDrawing] = useState<Camera | null>(null)
  const [lineCoordinates, setLineCoordinates] = useState<LineCoordinate | null>(null)
  const [entranceSidePoint, setEntranceSidePoint] = useState<{ x: number; y: number } | null>(null)
  const [zoneCoordinates, setZoneCoordinates] = useState<ZoneCoordinate | null>(null)
  const [selectedEngineType, setSelectedEngineType] = useState<string | undefined>(undefined)
  const [selectedCameraForAssignment, setSelectedCameraForAssignment] = useState<number | null>(null)
  const [entranceDirection, setEntranceDirection] = useState<'in' | 'out' | 'both'>('both')
  const { toast } = useToast()

  const fetchCameras = async () => {
    try {
      const response = await apiClient.get<Camera[]>('/api/v1/cameras/')
      setCameras(response || [])
    } catch (error) {
      console.error('Error fetching cameras:', error)
      setCameras([])
    } finally {
      setLoading(false)
    }
  }

  const fetchAnalyticsEngines = async () => {
    try {
      console.log('🔍 Fetching analytics engines...')
      const response = await apiClient.get<AnalyticsEngine[]>('/api/v1/analytics/')
      console.log('🔍 Analytics engines response:', response)
      setAnalyticsEngines(response || [])
    } catch (error) {
      console.error('Error fetching analytics engines:', error)
      setAnalyticsEngines([])
    }
  }

  const fetchAnalyticsTypes = async () => {
    try {
      console.log('🔍 Fetching analytics types from backend...')
      const response = await apiClient.get<Record<string, {
        name: string
        type: string
        description: string
        requires_zone: boolean
        requires_line: boolean
      }>>('/api/v1/analytics/types')
      
      // Transform backend response to frontend format
      const types: AnalyticsTypeConfig[] = Object.values(response || {}).map((config) => ({
        value: config.type,
        label: config.name,
        description: config.description,
        icon: getIconForType(config.type),
        requiresZone: config.requires_zone || false,
        requiresLine: config.requires_line || false,
      }))
      
      console.log('🔍 Analytics types response:', types)
      setAnalyticsTypes(types)
    } catch (error) {
      console.error('Error fetching analytics types:', error)
      // Fallback to empty array if API fails
      setAnalyticsTypes([])
      toast({
        title: "Warning",
        description: "Failed to load analytics types from backend",
        variant: "destructive",
      })
    }
  }

  useEffect(() => {
    fetchCameras()
    fetchAnalyticsEngines()
    fetchAnalyticsTypes()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleAddEngine = async () => {
    if (newEngine.name && newEngine.type && selectedCameraForAssignment) {
      try {
        // Prepare config based on engine type
        let config = {}
        const engineType = analyticsTypes.find(t => t.value === newEngine.type)
        
        if (engineType?.requiresLine && lineCoordinates) {
          config = { ...config, line: lineCoordinates }
        }
        
        if (engineType?.requiresZone && zoneCoordinates) {
          config = { ...config, zone: zoneCoordinates }
        }

        // Create analytics engine via API
        const response = await apiClient.post<AnalyticsEngine>('/api/v1/analytics/', {
          ...newEngine,
          config
        })
        
        if (response) {
          // Try to assign to camera via API
          try {
            await apiClient.post('/api/v1/analytics/camera', {
              camera_id: selectedCameraForAssignment,
              analytics_id: response.id
            })
          } catch (error) {
            console.error('Failed to assign analytics to camera:', error)
          }

          // If this is entrance analytics, enable it via the entrance/exit API
          if (newEngine.type === 'entrance' && lineCoordinates) {
            try {
              const configPayload: any = {
                enabled: true,
                line: lineCoordinates,
                direction: entranceDirection
              }
              // Add entrance side point if provided
              if (entranceSidePoint) {
                configPayload.entrance_side = entranceSidePoint
              }
              await apiClient.put(`/api/v1/entrance-exit/config/${selectedCameraForAssignment}`, configPayload)
            } catch (error) {
              console.error('Failed to enable entrance/exit analytics:', error)
              toast({
                title: "Warning",
                description: "Analytics engine created but entrance/exit tracking may not be enabled",
                variant: "default",
              })
            }
          }

          // Add to local state with API response
          setAnalyticsEngines(prev => [...prev, response])
        }

        toast({
          title: "Success",
          description: "Analytics engine added successfully",
        })
        
        // Reset form
        setNewEngine({
          name: "",
          type: undefined,
          config: {},
          is_active: true,
        })
        setSelectedCameraForAssignment(null)
        setIsAddDialogOpen(false)
        setLineCoordinates(null)
        setZoneCoordinates(null)
        setEntranceDirection('both')
        setSelectedEngineType(undefined)
      } catch (error) {
        console.error('Failed to create analytics engine:', error)
        toast({
          title: "Error",
          description: "Failed to add analytics engine",
          variant: "destructive",
        })
      }
    } else {
      const missingFields = []
      if (!newEngine.name) missingFields.push("Name")
      if (!newEngine.type) missingFields.push("Engine Type")
      if (!selectedCameraForAssignment) missingFields.push("Camera")
      
      toast({
        title: "Validation Error",
        description: `Please fill in all required fields: ${missingFields.join(", ")}`,
        variant: "destructive",
      })
    }
  }

  const handleUpdateEngine = async () => {
    if (editEngine) {
      try {
        await apiClient.put(`/api/v1/analytics/${editEngine.id}`, editEngine)
        
        // Update local state
        setAnalyticsEngines(prev => 
          prev.map(engine => 
            engine.id === editEngine.id 
              ? { ...editEngine, updated_at: new Date().toISOString() }
              : engine
          )
        )
        
        toast({
          title: "Success",
          description: "Analytics engine updated successfully",
        })
        setEditEngine(null)
        setIsEditDialogOpen(false)
      } catch (error) {
        console.error('Failed to update analytics engine:', error)
        toast({
          title: "Error",
          description: "Failed to update analytics engine",
          variant: "destructive",
        })
      }
    }
  }

  const handleDeleteEngine = async (id: number) => {
    try {
      await apiClient.delete(`/api/v1/analytics/${id}`)

      // Update local state
      setAnalyticsEngines(prev => prev.filter(engine => engine.id !== id))
      toast({
        title: "Success",
        description: "Analytics engine deleted successfully",
      })
    } catch (error) {
      console.error('Failed to delete analytics engine:', error)
      toast({
        title: "Error",
        description: "Failed to delete analytics engine",
        variant: "destructive",
      })
    }
  }

  const handleToggleEngine = async (engine: AnalyticsEngine) => {
    try {
      await apiClient.put(`/api/v1/analytics/${engine.id}`, {
        ...engine,
        is_active: !engine.is_active
      })

      // Update local state
      setAnalyticsEngines(prev => 
        prev.map(e => 
          e.id === engine.id 
            ? { ...e, is_active: !e.is_active, updated_at: new Date().toISOString() }
            : e
        )
      )
      
      toast({
        title: "Success",
        description: `Analytics engine ${engine.is_active ? 'disabled' : 'enabled'} successfully`,
      })
    } catch (error) {
      console.error('Failed to toggle analytics engine:', error)
      toast({
        title: "Error",
        description: "Failed to update analytics engine status",
        variant: "destructive",
      })
    }
  }

  const handleEditClick = (engine: AnalyticsEngine) => {
    setEditEngine(engine)
    setIsEditDialogOpen(true)
  }

  const handleEngineTypeChange = (type: string) => {
    console.log('🔍 handleEngineTypeChange - type:', type)
    console.log('🔍 handleEngineTypeChange - selectedCameraForAssignment:', selectedCameraForAssignment)
    
    setSelectedEngineType(type)
    setNewEngine({ ...newEngine, type })
    
    const engineType = analyticsTypes.find(t => t.value === type)
    if (engineType?.requiresLine) {
      if (!selectedCameraForAssignment) {
        toast({
          title: "Camera Required",
          description: "Please select a camera first before choosing an engine type that requires line drawing.",
          variant: "destructive",
        })
        return
      }
      console.log('🔍 Opening line drawing dialog with cameraId:', selectedCameraForAssignment)
      setIsLineDrawingOpen(true)
    } else if (engineType?.requiresZone) {
      if (!selectedCameraForAssignment) {
        toast({
          title: "Camera Required",
          description: "Please select a camera first before choosing an engine type that requires zone drawing.",
          variant: "destructive",
        })
        return
      }
      console.log('🔍 Opening zone drawing dialog with cameraId:', selectedCameraForAssignment)
      setIsZoneDrawingOpen(true)
    }
  }

  const handleLineDrawingComplete = (coordinates: LineCoordinate, entranceSide?: { x: number; y: number }) => {
    setLineCoordinates(coordinates)
    setEntranceSidePoint(entranceSide || null)
    // Reset direction to 'both' when a new line is drawn
    setEntranceDirection('both')
    setIsLineDrawingOpen(false)
  }

  const handleZoneDrawingComplete = (coordinates: ZoneCoordinate) => {
    setZoneCoordinates(coordinates)
    setIsZoneDrawingOpen(false)
  }

  const getCameraNames = (analytics: AnalyticsEngine) => {
    if (analytics.cameras && analytics.cameras.length > 0) {
      return analytics.cameras.map(c => c.name).join(', ')
    }
    return "No cameras assigned"
  }

  const getEngineIcon = (type: string) => {
    const engineType = analyticsTypes.find(t => t.value === type)
    if (engineType) {
      const IconComponent = engineType.icon
      return <IconComponent className="h-4 w-4" />
    }
    return <Brain className="h-4 w-4" />
  }

  const getEngineTypeLabel = (type: string) => {
    const engineType = analyticsTypes.find(t => t.value === type)
    return engineType ? engineType.label : type
  }

  const getEngineTypeDescription = (type: string) => {
    const engineType = analyticsTypes.find(t => t.value === type)
    return engineType ? engineType.description : ""
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="flex flex-col items-center space-y-2">
          <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
          <p className="text-muted-foreground">Loading analytics engines...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">
          Analytics Engines ({analyticsEngines?.length || 0})
        </h3>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button disabled={cameras.length === 0}>
              <Plus className="mr-2 h-4 w-4" />
              Add Analytics Engine
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New Analytics Engine</DialogTitle>
              <DialogDescription>Configure a new analytics engine for video analysis.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Name
                </Label>
                <Input
                  id="name"
                  value={newEngine.name}
                  onChange={(e) => setNewEngine({ ...newEngine, name: e.target.value })}
                  className="col-span-3"
                  placeholder="e.g., Entrance People Counter"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="camera" className="text-right">
                  Camera *
                </Label>
                <Select
                  value={selectedCameraForAssignment?.toString()}
                  onValueChange={(value) => {
                    console.log('🔍 Camera selection changed to:', value)
                    setSelectedCameraForAssignment(parseInt(value))
                  }}
                  disabled={cameras.length === 0}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder={cameras.length === 0 ? "Loading cameras..." : "Select a camera (required)"} />
                  </SelectTrigger>
                  <SelectContent>
                    {cameras
                      .filter(camera => camera.id && camera.id > 0 && camera.name)
                      .map((camera) => (
                        <SelectItem key={camera.id} value={camera.id.toString()}>
                          {camera.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="engine_type" className="text-right">
                  Engine Type *
                </Label>
                <Select
                  value={newEngine.type}
                  onValueChange={handleEngineTypeChange}
                  disabled={analyticsTypes.length === 0}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder={analyticsTypes.length === 0 ? "Loading types..." : "Select analytics engine type (required)"} />
                  </SelectTrigger>
                  <SelectContent>
                    {analyticsTypes.map((type) => {
                      const IconComponent = type.icon
                      return (
                        <SelectItem key={type.value} value={type.value}>
                          <div className="flex items-center space-x-2">
                            <IconComponent className="h-4 w-4" />
                            <span>{type.label}</span>
                          </div>
                        </SelectItem>
                      )
                    })}
                  </SelectContent>
                </Select>
              </div>
              {selectedEngineType && (
                <div className="col-span-4 p-3 bg-muted rounded-md">
                  <p className="text-sm text-muted-foreground">
                    {getEngineTypeDescription(selectedEngineType)}
                  </p>
                  {analyticsTypes.find(t => t.value === selectedEngineType)?.requiresLine && (
                    <p className="text-sm text-blue-600 mt-1">
                      ⚠️ This analytics type requires drawing a virtual line
                    </p>
                  )}
                  {analyticsTypes.find(t => t.value === selectedEngineType)?.requiresZone && (
                    <p className="text-sm text-green-600 mt-1">
                      ⚠️ This analytics type requires drawing a zone
                    </p>
                  )}
                </div>
              )}
              {lineCoordinates && (
                <div className="col-span-4 space-y-3">
                  <div className="p-3 bg-blue-50 rounded-md">
                    <p className="text-sm text-blue-700">
                      ✅ Line configured: ({lineCoordinates.x1.toFixed(1)}, {lineCoordinates.y1.toFixed(1)}) to ({lineCoordinates.x2.toFixed(1)}, {lineCoordinates.y2.toFixed(1)})
                    </p>
                    {entranceSidePoint && (
                      <p className="text-sm text-green-700 mt-1">
                        ✅ Entrance side marked at ({entranceSidePoint.x.toFixed(1)}, {entranceSidePoint.y.toFixed(1)})
                      </p>
                    )}
                  </div>
                  {selectedEngineType === 'entrance' && (
                    <div className="p-3 bg-amber-50 rounded-md border border-amber-200">
                      <Label className="text-sm font-medium text-amber-900 mb-2 block">
                        Select Direction:
                      </Label>
                      <div className="flex gap-3">
                        <Button
                          type="button"
                          variant={entranceDirection === 'in' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setEntranceDirection('in')}
                          className="flex items-center gap-2"
                        >
                          <ArrowRight className="h-4 w-4" />
                          Enter Only
                        </Button>
                        <Button
                          type="button"
                          variant={entranceDirection === 'out' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setEntranceDirection('out')}
                          className="flex items-center gap-2"
                        >
                          <ArrowLeft className="h-4 w-4" />
                          Exit Only
                        </Button>
                        <Button
                          type="button"
                          variant={entranceDirection === 'both' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setEntranceDirection('both')}
                          className="flex items-center gap-2"
                        >
                          <ArrowUpDown className="h-4 w-4" />
                          Both Directions
                        </Button>
                      </div>
                      <p className="text-xs text-amber-700 mt-2">
                        {entranceDirection === 'in' && 'Count only people entering (crossing from right to left relative to line direction)'}
                        {entranceDirection === 'out' && 'Count only people exiting (crossing from left to right relative to line direction)'}
                        {entranceDirection === 'both' && 'Count people entering and exiting in both directions'}
                      </p>
                    </div>
                  )}
                </div>
              )}
              {zoneCoordinates && (
                <div className="col-span-4 p-3 bg-green-50 rounded-md">
                  <p className="text-sm text-green-700">
                    ✅ Zone configured: {zoneCoordinates.type} with {zoneCoordinates.points.length} points
                  </p>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddEngine}>Add Analytics Engine</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Engine Type</TableHead>
              <TableHead>Assigned Cameras</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Configuration</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {analyticsEngines?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  <div className="flex flex-col items-center space-y-2">
                    <Brain className="h-8 w-8 text-muted-foreground" />
                    <p className="text-muted-foreground">No analytics engines configured</p>
                    <p className="text-sm text-muted-foreground">
                      Click "Add Analytics Engine" to create your first analytics configuration
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              analyticsEngines?.map((engine) => (
                <TableRow key={engine.id}>
                  <TableCell className="font-medium">{engine.name}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      {getEngineIcon(engine.type)}
                      <span>{getEngineTypeLabel(engine.type)}</span>
                    </div>
                  </TableCell>
                  <TableCell>{getCameraNames(engine)}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={engine.is_active}
                        onCheckedChange={() => handleToggleEngine(engine)}
                      />
                      <Badge variant={engine.is_active ? "default" : "secondary"}>
                        {engine.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm space-y-1">
                      {engine.config?.line && (
                        <div>Line: ({engine.config.line.x1.toFixed(1)},{engine.config.line.y1.toFixed(1)}) to ({engine.config.line.x2.toFixed(1)},{engine.config.line.y2.toFixed(1)})</div>
                      )}
                      {engine.config?.zone && (
                        <div>Zone: {engine.config.zone.type} with {engine.config.zone.points.length} points</div>
                      )}
                      {!engine.config?.line && !engine.config?.zone && (
                        <span className="text-muted-foreground">No special configuration</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEditClick(engine)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteEngine(engine.id)}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Edit Analytics Engine Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Analytics Engine</DialogTitle>
            <DialogDescription>Update the analytics engine configuration.</DialogDescription>
          </DialogHeader>
          {editEngine && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-name" className="text-right">
                  Name
                </Label>
                <Input
                  id="edit-name"
                  value={editEngine.name}
                  onChange={(e) => setEditEngine({ ...editEngine, name: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-active" className="text-right">
                  Active
                </Label>
                <Switch
                  id="edit-active"
                  checked={editEngine.is_active}
                  onCheckedChange={(checked) => setEditEngine({ ...editEngine, is_active: checked })}
                  className="col-span-3"
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateEngine}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Line Drawing Dialog */}
      <Dialog open={isLineDrawingOpen} onOpenChange={setIsLineDrawingOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Draw Virtual Line</DialogTitle>
            <DialogDescription>
              Draw a virtual line for line crossing analytics.
            </DialogDescription>
          </DialogHeader>
          {selectedCameraForAssignment && (
            <LineDrawingCanvas
              cameraId={selectedCameraForAssignment}
              onLineComplete={handleLineDrawingComplete}
              onCancel={() => setIsLineDrawingOpen(false)}
              requireEntranceSide={selectedEngineType === 'entrance'}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Zone Drawing Dialog */}
      <Dialog open={isZoneDrawingOpen} onOpenChange={setIsZoneDrawingOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Draw Zone</DialogTitle>
            <DialogDescription>
              Draw a zone for zone-based analytics.
            </DialogDescription>
          </DialogHeader>
          {selectedCameraForAssignment && (
            <ZoneDrawingCanvas
              cameraId={selectedCameraForAssignment}
              onZoneComplete={handleZoneDrawingComplete}
              onCancel={() => setIsZoneDrawingOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
} 