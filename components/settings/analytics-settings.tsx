"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { AlertCircle, Plus, Edit, Trash, Users, Clock, UserCheck } from "lucide-react"
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { useAnalyticsManagement, type Analytics } from "@/hooks/use-analytics-management"
import { useCameras } from "@/hooks/use-cameras"
import { getAllAnalyticsTypes, type AnalyticsTypeConfig } from "@/lib/constants/analytics"

export default function AnalyticsSettings() {
  const { analytics, analyticsTypes, loading, error, createAnalytics, updateAnalytics, deleteAnalytics, addAnalyticsToCamera, removeAnalyticsFromCamera, getCameraAnalytics } = useAnalyticsManagement()
  const { data: cameras = [] } = useCameras()
  const { toast } = useToast()
  
  // Dialog states for analytics management
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingAnalytics, setEditingAnalytics] = useState<Analytics | null>(null)
  const [newAnalytics, setNewAnalytics] = useState({
    name: "",
    type: "",
    config: {},
    is_active: true
  })

  // State to track camera assignments for each analytics
  const [cameraAssignments, setCameraAssignments] = useState<Record<number, number[]>>({})

  const predefinedTypes = getAllAnalyticsTypes()

  // Fetch camera assignments for all analytics
  const fetchCameraAssignments = async () => {
    const assignments: Record<number, number[]> = {}
    
    for (const analytic of analytics) {
      try {
        const cameraAnalytics = await getCameraAnalytics(analytic.id)
        assignments[analytic.id] = cameraAnalytics.map((ca: Analytics) => ca.id)
      } catch (error) {
        console.error(`Error fetching camera assignments for analytics ${analytic.id}:`, error)
        assignments[analytic.id] = []
      }
    }
    
    setCameraAssignments(assignments)
  }

  // Fetch camera assignments when analytics change
  useEffect(() => {
    if (analytics.length > 0) {
      fetchCameraAssignments()
    }
  }, [analytics])

  const getAnalyticsIcon = (type: string) => {
    switch (type) {
      case "people_counting":
        return <Users className="h-5 w-5" />
      case "dwell_time":
        return <Clock className="h-5 w-5" />
      case "demographic":
        return <UserCheck className="h-5 w-5" />
      default:
        return <AlertCircle className="h-5 w-5" />
    }
  }

  const getAnalyticsColor = (type: string) => {
    switch (type) {
      case "people_counting":
        return "text-blue-600"
      case "dwell_time":
        return "text-green-600"
      case "demographic":
        return "text-purple-600"
      default:
        return "text-gray-600"
    }
  }

  const isCameraAssigned = (analyticsId: number, cameraId: number) => {
    return cameraAssignments[analyticsId]?.includes(cameraId) || false
  }

  const handleAddAnalytics = async () => {
    if (newAnalytics.name && newAnalytics.type) {
      // Get default config for the selected type
      const typeConfig = predefinedTypes.find(t => t.type === newAnalytics.type)
      const config = typeConfig ? typeConfig.defaultConfig : {}
      
      const result = await createAnalytics({
        ...newAnalytics,
        config
      })
      if (result) {
        toast({
          title: "Success",
          description: "Analytics configuration created successfully",
        })
        setNewAnalytics({ name: "", type: "", config: {}, is_active: true })
        setIsAddDialogOpen(false)
      } else {
        toast({
          title: "Error",
          description: "Failed to create analytics configuration",
          variant: "destructive",
        })
      }
    }
  }

  const handleUpdateAnalytics = async () => {
    if (editingAnalytics) {
      const result = await updateAnalytics(editingAnalytics.id, {
        name: editingAnalytics.name,
        type: editingAnalytics.type,
        config: editingAnalytics.config,
        is_active: editingAnalytics.is_active
      })
      if (result) {
        toast({
          title: "Success",
          description: "Analytics configuration updated successfully",
        })
        setEditingAnalytics(null)
        setIsEditDialogOpen(false)
      } else {
        toast({
          title: "Error",
          description: "Failed to update analytics configuration",
          variant: "destructive",
        })
      }
    }
  }

  const handleDeleteAnalytics = async (id: number) => {
    const result = await deleteAnalytics(id)
    if (result) {
      toast({
        title: "Success",
        description: "Analytics configuration deleted successfully",
      })
    } else {
      toast({
        title: "Error",
        description: "Failed to delete analytics configuration",
        variant: "destructive",
      })
    }
  }

  const handleAnalyticsToggle = async (analyticsItem: Analytics) => {
    const result = await updateAnalytics(analyticsItem.id, {
      is_active: !analyticsItem.is_active
    })
    if (result) {
      toast({
        title: "Success",
        description: `Analytics ${analyticsItem.is_active ? 'disabled' : 'enabled'} successfully`,
      })
    } else {
      toast({
        title: "Error",
        description: "Failed to update analytics status",
        variant: "destructive",
      })
    }
  }

  const handleCameraToggle = async (analyticsId: number, cameraId: number) => {
    try {
      const isCurrentlyAssigned = isCameraAssigned(analyticsId, cameraId)
      
      if (isCurrentlyAssigned) {
        const result = await removeAnalyticsFromCamera(cameraId, analyticsId)
        if (result) {
          // Update local state
          setCameraAssignments(prev => ({
            ...prev,
            [analyticsId]: prev[analyticsId]?.filter(id => id !== cameraId) || []
          }))
          toast({
            title: "Success",
            description: "Analytics removed from camera",
          })
        }
      } else {
        const result = await addAnalyticsToCamera(cameraId, analyticsId)
        if (result) {
          // Update local state
          setCameraAssignments(prev => ({
            ...prev,
            [analyticsId]: [...(prev[analyticsId] || []), cameraId]
          }))
          toast({
            title: "Success",
            description: "Analytics added to camera",
          })
        }
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update camera assignment",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return <div className="flex justify-center p-4">Loading analytics...</div>
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-6">
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Analytics Engine Configuration</AlertTitle>
        <AlertDescription>
          Configure analytics engines and assign them to cameras. Each analytics type can be enabled/disabled and assigned to multiple cameras.
        </AlertDescription>
      </Alert>

      {/* Analytics Management Section */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Analytics Configurations</CardTitle>
              <CardDescription>Manage analytics engine configurations</CardDescription>
            </div>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Analytics
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Analytics Configuration</DialogTitle>
                  <DialogDescription>
                    Create a new analytics configuration
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      value={newAnalytics.name}
                      onChange={(e) => setNewAnalytics({ ...newAnalytics, name: e.target.value })}
                      placeholder="e.g., People Counting"
                    />
                  </div>
                  <div>
                    <Label htmlFor="type">Analytics Type</Label>
                    <Select
                      value={newAnalytics.type}
                      onValueChange={(value) => {
                        const typeConfig = predefinedTypes.find(t => t.type === value)
                        setNewAnalytics({ 
                          ...newAnalytics, 
                          type: value,
                          name: typeConfig ? typeConfig.name : newAnalytics.name
                        })
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select analytics type" />
                      </SelectTrigger>
                      <SelectContent>
                        {predefinedTypes.map((type) => (
                          <SelectItem key={type.type} value={type.type}>
                            <div className="flex items-center space-x-2">
                              {getAnalyticsIcon(type.type)}
                              <span>{type.name}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddAnalytics}>Add Analytics</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analytics.map((analytic) => (
              <Card key={analytic.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={analytic.is_active}
                          onCheckedChange={() => handleAnalyticsToggle(analytic)}
                        />
                        <div className="flex items-center space-x-2">
                          {getAnalyticsIcon(analytic.type)}
                          <Label className={getAnalyticsColor(analytic.type)}>{analytic.name}</Label>
                        </div>
                      </div>
                      <span className="text-sm text-muted-foreground">({analytic.type})</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setEditingAnalytics(analytic)
                          setIsEditDialogOpen(true)
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteAnalytics(analytic.id)}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  {/* Analytics Description */}
                  <div className="mt-2">
                    <p className="text-sm text-muted-foreground">
                      {predefinedTypes.find(t => t.type === analytic.type)?.description || "No description available"}
                    </p>
                  </div>
                  
                  {/* Camera Assignment */}
                  <div className="mt-4">
                    <Label className="text-sm font-medium">Assigned Cameras:</Label>
                    <div className="mt-2 space-y-2">
                      {(cameras || []).map((camera: any) => (
                        <div key={camera.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={`camera-${camera.id}-${analytic.id}`}
                            checked={isCameraAssigned(analytic.id, camera.id)}
                            onCheckedChange={() => handleCameraToggle(analytic.id, camera.id)}
                          />
                          <Label htmlFor={`camera-${camera.id}-${analytic.id}`} className="text-sm">
                            {camera.name}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Edit Analytics Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Analytics Configuration</DialogTitle>
            <DialogDescription>
              Update analytics configuration settings
            </DialogDescription>
          </DialogHeader>
          {editingAnalytics && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-name">Name</Label>
                <Input
                  id="edit-name"
                  value={editingAnalytics.name}
                  onChange={(e) => setEditingAnalytics({ ...editingAnalytics, name: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-type">Type</Label>
                <Input
                  id="edit-type"
                  value={editingAnalytics.type}
                  disabled
                  className="bg-muted"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  checked={editingAnalytics.is_active}
                  onCheckedChange={(checked) => setEditingAnalytics({ ...editingAnalytics, is_active: checked })}
                />
                <Label>Active</Label>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateAnalytics}>Update Analytics</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
