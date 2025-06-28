"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  AlertTriangle, 
  Edit, 
  Plus, 
  Trash, 
  RefreshCw, 
  Users, 
  UserCheck, 
  TrendingUp,
  MapPin,
  Activity
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

interface AlertEngine {
  id: number
  name: string
  type: string
  config: any
  is_active: boolean
  created_at: string
  updated_at: string
  cameras?: Camera[]
}

// Alert engine types - focused on alerting functionality
const ALERT_ENGINE_TYPES = [
  {
    value: "human_detection",
    label: "Human Detection",
    description: "Alert when humans are detected in the camera view",
    icon: Users,
    requiresZone: false,
    requiresLine: false
  },
  {
    value: "human_crossing_line",
    label: "Human Crossing Line",
    description: "Alert when humans cross a virtual line",
    icon: TrendingUp,
    requiresZone: false,
    requiresLine: true
  },
  {
    value: "human_in_zone",
    label: "Human in Zone",
    description: "Alert when humans enter or stay in a defined zone",
    icon: MapPin,
    requiresZone: true,
    requiresLine: false
  }
]

export default function AlertEnginesSettings() {
  const [alertEngines, setAlertEngines] = useState<AlertEngine[]>([])
  const [cameras, setCameras] = useState<Camera[]>([])
  const [loading, setLoading] = useState(true)
  const [editEngine, setEditEngine] = useState<AlertEngine | null>(null)
  const [newEngine, setNewEngine] = useState<Partial<AlertEngine>>({
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
  const [zoneCoordinates, setZoneCoordinates] = useState<ZoneCoordinate | null>(null)
  const [selectedEngineType, setSelectedEngineType] = useState<string | undefined>(undefined)
  const [selectedCameraForAssignment, setSelectedCameraForAssignment] = useState<number | null>(null)
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

  const fetchAlertEngines = async () => {
    try {
      console.log('🔍 Fetching alert engines...')
      const response = await apiClient.get<AlertEngine[]>('/api/v1/alert-engines/')
      console.log('🔍 Alert engines response:', response)
      setAlertEngines(response || [])
    } catch (error) {
      console.error('Error fetching alert engines:', error)
      setAlertEngines([])
    }
  }

  useEffect(() => {
    fetchCameras()
    fetchAlertEngines()
  }, [])

  const handleAddEngine = async () => {
    if (newEngine.name && newEngine.type && selectedCameraForAssignment) {
      try {
        // Prepare config based on engine type
        let config = {}
        const engineType = ALERT_ENGINE_TYPES.find(t => t.value === newEngine.type)
        
        if (engineType?.requiresLine && lineCoordinates) {
          config = { ...config, line: lineCoordinates }
        }
        
        if (engineType?.requiresZone && zoneCoordinates) {
          config = { ...config, zone: zoneCoordinates }
        }

        // Create alert engine via API
        const response = await apiClient.post<AlertEngine>('/api/v1/alert-engines/', {
          ...newEngine,
          config
        })
        
        if (response) {
          // Try to assign to camera via API
          try {
            await apiClient.post('/api/v1/alert-engines/camera', {
              camera_id: selectedCameraForAssignment,
              alert_engine_id: response.id
            })
          } catch (error) {
            console.error('Failed to assign alert engine to camera:', error)
          }

          // Add to local state with API response
          setAlertEngines(prev => [...prev, response])
        }

        toast({
          title: "Success",
          description: "Alert engine added successfully",
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
        setSelectedEngineType(undefined)
      } catch (error) {
        console.error('Failed to create alert engine:', error)
        
        // Extract error message from backend response
        let errorMessage = "Failed to add alert engine"
        if (error && typeof error === 'object' && 'response' in error) {
          const response = (error as any).response
          if (response?.data?.detail) {
            if (typeof response.data.detail === 'string' && response.data.detail.includes('already exists')) {
              errorMessage = 'An alert engine with this name already exists. Please choose a different name.'
            } else {
              errorMessage = response.data.detail
            }
          } else if (response?.status === 400) {
            errorMessage = "Validation error - please check your input"
          }
        }
        
        toast({
          title: "Error",
          description: errorMessage,
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
        await apiClient.put(`/api/v1/alert-engines/${editEngine.id}`, editEngine)
        
        // Update local state
        setAlertEngines(prev => 
          prev.map(engine => 
            engine.id === editEngine.id 
              ? { ...editEngine, updated_at: new Date().toISOString() }
              : engine
          )
        )
        
        toast({
          title: "Success",
          description: "Alert engine updated successfully",
        })
        setEditEngine(null)
        setIsEditDialogOpen(false)
      } catch (error) {
        console.error('Failed to update alert engine:', error)
        toast({
          title: "Error",
          description: "Failed to update alert engine",
          variant: "destructive",
        })
      }
    }
  }

  const handleDeleteEngine = async (id: number) => {
    try {
      await apiClient.delete(`/api/v1/alert-engines/${id}`)

      // Update local state
      setAlertEngines(prev => prev.filter(engine => engine.id !== id))
      toast({
        title: "Success",
        description: "Alert engine deleted successfully",
      })
    } catch (error) {
      console.error('Failed to delete alert engine:', error)
      toast({
        title: "Error",
        description: "Failed to delete alert engine",
        variant: "destructive",
      })
    }
  }

  const handleToggleEngine = async (engine: AlertEngine) => {
    try {
      await apiClient.put(`/api/v1/alert-engines/${engine.id}`, {
        ...engine,
        is_active: !engine.is_active
      })

      // Update local state
      setAlertEngines(prev => 
        prev.map(e => 
          e.id === engine.id 
            ? { ...e, is_active: !e.is_active, updated_at: new Date().toISOString() }
            : e
        )
      )
      
      toast({
        title: "Success",
        description: `Alert engine ${engine.is_active ? 'disabled' : 'enabled'} successfully`,
      })
    } catch (error) {
      console.error('Failed to toggle alert engine:', error)
      toast({
        title: "Error",
        description: "Failed to update alert engine status",
        variant: "destructive",
      })
    }
  }

  const handleEditClick = (engine: AlertEngine) => {
    setEditEngine(engine)
    setIsEditDialogOpen(true)
  }

  const handleEngineTypeChange = (value: string) => {
    setNewEngine({ ...newEngine, type: value })
    setSelectedEngineType(value)
    setLineCoordinates(null)
    setZoneCoordinates(null)
  }

  const handleLineDrawingComplete = (coordinates: LineCoordinate) => {
    setLineCoordinates(coordinates)
    setIsLineDrawingOpen(false)
    toast({
      title: "Line Drawn",
      description: "Virtual line has been configured successfully",
    })
  }

  const handleZoneDrawingComplete = (coordinates: ZoneCoordinate) => {
    setZoneCoordinates(coordinates)
    setIsZoneDrawingOpen(false)
    toast({
      title: "Zone Drawn",
      description: "Zone has been configured successfully",
    })
  }

  const getCameraNames = (engine: AlertEngine) => {
    if (engine.cameras && engine.cameras.length > 0) {
      return engine.cameras.map(camera => camera.name).join(", ")
    }
    return "No cameras assigned"
  }

  const getEngineIcon = (type: string) => {
    const engineType = ALERT_ENGINE_TYPES.find(t => t.value === type)
    if (engineType) {
      const IconComponent = engineType.icon
      return <IconComponent className="h-4 w-4" />
    }
    return <AlertTriangle className="h-4 w-4" />
  }

  const getEngineTypeLabel = (type: string) => {
    const engineType = ALERT_ENGINE_TYPES.find(t => t.value === type)
    return engineType ? engineType.label : type
  }

  const getEngineTypeDescription = (type: string) => {
    const engineType = ALERT_ENGINE_TYPES.find(t => t.value === type)
    return engineType ? engineType.description : ""
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="flex flex-col items-center space-y-2">
          <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
          <p className="text-muted-foreground">Loading alert engines...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">
          Alert Engines ({alertEngines?.length || 0})
        </h3>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button disabled={cameras.length === 0}>
              <Plus className="mr-2 h-4 w-4" />
              Add Alert Engine
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New Alert Engine</DialogTitle>
              <DialogDescription>Configure a new alert engine for video monitoring.</DialogDescription>
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
                  placeholder="e.g., Entrance Alert"
                />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="camera" className="text-right">
                  Camera *
                </Label>
                <Select
                  value={selectedCameraForAssignment?.toString() || ""}
                  onValueChange={(value) => setSelectedCameraForAssignment(parseInt(value))}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select a camera (required)" />
                  </SelectTrigger>
                  <SelectContent>
                    {cameras.map((camera) => (
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
                  disabled={ALERT_ENGINE_TYPES.length === 0}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select alert engine type (required)" />
                  </SelectTrigger>
                  <SelectContent>
                    {ALERT_ENGINE_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        <div className="flex items-center space-x-2">
                          {getEngineIcon(type.value)}
                          <span>{type.label}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {selectedEngineType && (
                <div className="col-span-4 p-3 bg-muted rounded-md">
                  <p className="text-sm text-muted-foreground">
                    {getEngineTypeDescription(selectedEngineType)}
                  </p>
                  {ALERT_ENGINE_TYPES.find(t => t.value === selectedEngineType)?.requiresLine && (
                    <p className="text-sm text-blue-600 mt-1">
                      ⚠️ This alert type requires drawing a virtual line
                    </p>
                  )}
                  {ALERT_ENGINE_TYPES.find(t => t.value === selectedEngineType)?.requiresZone && (
                    <p className="text-sm text-green-600 mt-1">
                      ⚠️ This alert type requires drawing a zone
                    </p>
                  )}
                </div>
              )}
              {lineCoordinates && (
                <div className="col-span-4 p-3 bg-blue-50 rounded-md">
                  <p className="text-sm text-blue-700">
                    ✅ Line configured: ({lineCoordinates.x1.toFixed(1)}, {lineCoordinates.y1.toFixed(1)}) to ({lineCoordinates.x2.toFixed(1)}, {lineCoordinates.y2.toFixed(1)})
                  </p>
                </div>
              )}
              {zoneCoordinates && (
                <div className="col-span-4 p-3 bg-green-50 rounded-md">
                  <p className="text-sm text-green-700">
                    ✅ Zone configured: {zoneCoordinates.type} with {zoneCoordinates.points.length} points
                  </p>
                </div>
              )}

              {/* Drawing buttons */}
              {selectedEngineType && ALERT_ENGINE_TYPES.find(t => t.value === selectedEngineType)?.requiresLine && (
                <div className="col-span-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      if (selectedCameraForAssignment) {
                        setSelectedCameraForDrawing(cameras.find(c => c.id === selectedCameraForAssignment) || null)
                        setIsLineDrawingOpen(true)
                      }
                    }}
                    disabled={!selectedCameraForAssignment}
                  >
                    <TrendingUp className="mr-2 h-4 w-4" />
                    Draw Virtual Line
                  </Button>
                </div>
              )}

              {selectedEngineType && ALERT_ENGINE_TYPES.find(t => t.value === selectedEngineType)?.requiresZone && (
                <div className="col-span-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      if (selectedCameraForAssignment) {
                        setSelectedCameraForDrawing(cameras.find(c => c.id === selectedCameraForAssignment) || null)
                        setIsZoneDrawingOpen(true)
                      }
                    }}
                    disabled={!selectedCameraForAssignment}
                  >
                    <MapPin className="mr-2 h-4 w-4" />
                    Draw Zone
                  </Button>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddEngine}>Add Alert Engine</Button>
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
            {alertEngines?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  <div className="flex flex-col items-center space-y-2">
                    <AlertTriangle className="h-8 w-8 text-muted-foreground" />
                    <p className="text-muted-foreground">No alert engines configured</p>
                    <p className="text-sm text-muted-foreground">
                      Click "Add Alert Engine" to create your first alert configuration
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              alertEngines?.map((engine) => (
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

      {/* Edit Alert Engine Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Alert Engine</DialogTitle>
            <DialogDescription>
              Update alert engine configuration
            </DialogDescription>
          </DialogHeader>
          {editEngine && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-name">Name</Label>
                <Input
                  id="edit-name"
                  value={editEngine.name}
                  onChange={(e) => setEditEngine({ ...editEngine, name: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-type">Engine Type</Label>
                <Select
                  value={editEngine.type}
                  onValueChange={(value) => setEditEngine({ ...editEngine, type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ALERT_ENGINE_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        <div className="flex items-center space-x-2">
                          {getEngineIcon(type.value)}
                          <span>{type.label}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  checked={editEngine.is_active}
                  onCheckedChange={(checked) => setEditEngine({ ...editEngine, is_active: checked })}
                />
                <Label>Active</Label>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateEngine}>Update Alert Engine</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Line Drawing Dialog */}
      <Dialog open={isLineDrawingOpen} onOpenChange={setIsLineDrawingOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Draw Virtual Line</DialogTitle>
            <DialogDescription>
              Draw a virtual line for line crossing alerts.
            </DialogDescription>
          </DialogHeader>
          {selectedCameraForAssignment && (
            <LineDrawingCanvas
              cameraId={selectedCameraForAssignment}
              onLineComplete={handleLineDrawingComplete}
              onCancel={() => setIsLineDrawingOpen(false)}
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
              Draw a zone for zone-based alerts.
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