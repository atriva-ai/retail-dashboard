"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Edit, Plus, Trash, MapPin } from "lucide-react"
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
import { useZones, type Zone, type ZoneCreate } from "@/hooks/use-zones"
import { apiClient } from "@/lib/api"
import { Camera } from "@/types"
import { useAnalyticsManagement } from "@/hooks/use-analytics-management"
import { getAllAnalyticsTypes } from "@/lib/constants/analytics"

export default function ZoneSettings() {
  const { zones, loading, error, createZone, updateZone, deleteZone, toggleZoneActive } = useZones()
  const [cameras, setCameras] = useState<Camera[]>([])
  const [camerasLoading, setCamerasLoading] = useState(true)
  const { analytics } = useAnalyticsManagement()
  const { toast } = useToast()
  
  const predefinedTypes = getAllAnalyticsTypes()
  
  // Fetch cameras on component mount
  useEffect(() => {
    const fetchCameras = async () => {
      try {
        const response = await apiClient.get<Camera[]>('/api/v1/cameras/')
        setCameras(response || [])
      } catch (error) {
        console.error("Error fetching cameras:", error)
        setCameras([])
      } finally {
        setCamerasLoading(false)
      }
    }
    
    fetchCameras()
  }, [])
  
  const [editZone, setEditZone] = useState<Zone | null>(null)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [newZone, setNewZone] = useState<Partial<ZoneCreate>>({
    name: "",
    camera_id: 0,
    analytics_id: 0,
    is_active: true,
  })

  const handleAddZone = async () => {
    if (newZone.name && newZone.camera_id && newZone.analytics_id) {
      const result = await createZone(newZone as ZoneCreate)
      if (result) {
        toast({
          title: "Success",
          description: "Zone added successfully",
        })
        setNewZone({
          name: "",
          camera_id: 0,
          analytics_id: 0,
          is_active: true,
        })
        setIsAddDialogOpen(false)
      } else {
        toast({
          title: "Error",
          description: "Failed to add zone",
          variant: "destructive",
        })
      }
    }
  }

  const handleUpdateZone = async () => {
    if (editZone) {
      const result = await updateZone(editZone.id, {
        name: editZone.name,
        camera_id: editZone.camera_id,
        analytics_id: editZone.analytics_id,
        is_active: editZone.is_active
      })
      if (result) {
        toast({
          title: "Success",
          description: "Zone updated successfully",
        })
        setEditZone(null)
        setIsEditDialogOpen(false)
      } else {
        toast({
          title: "Error",
          description: "Failed to update zone",
          variant: "destructive",
        })
      }
    }
  }

  const handleDeleteZone = async (id: number) => {
    const result = await deleteZone(id)
    if (result) {
      toast({
        title: "Success",
        description: "Zone deleted successfully",
      })
    } else {
      toast({
        title: "Error",
        description: "Failed to delete zone",
        variant: "destructive",
      })
    }
  }

  const handleToggleActive = async (id: number) => {
    const result = await toggleZoneActive(id)
    if (result) {
      toast({
        title: "Success",
        description: "Zone status updated successfully",
      })
    } else {
      toast({
        title: "Error",
        description: "Failed to update zone status",
        variant: "destructive",
      })
    }
  }

  const handleEditClick = (zone: Zone) => {
    setEditZone(zone)
    setIsEditDialogOpen(true)
  }

  const getCameraName = (cameraId: number) => {
    return (cameras || []).find((camera: any) => camera.id === cameraId)?.name || `Camera ${cameraId}`
  }

  const getAnalyticsName = (analyticsId: number) => {
    const analytic = (analytics || []).find((a: any) => a.id === analyticsId)
    if (analytic) {
      return analytic.name
    }
    return `Analytics ${analyticsId}`
  }

  const getAnalyticsDescription = (analyticsId: number) => {
    const analytic = (analytics || []).find((a: any) => a.id === analyticsId)
    if (analytic) {
      const typeConfig = predefinedTypes.find(t => t.type === analytic.type)
      return typeConfig?.description || "No description available"
    }
    return ""
  }

  if (loading) {
    return <div className="flex justify-center p-4">Loading zones...</div>
  }

  if (error) {
    return (
      <div className="flex justify-center p-4 text-red-500">
        Error: {error}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Zones ({zones?.length || 0})</h3>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Zone
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Zone</DialogTitle>
              <DialogDescription>
                Create a new zone for analytics monitoring
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Zone Name</Label>
                <Input
                  id="name"
                  value={newZone.name}
                  onChange={(e) => setNewZone({ ...newZone, name: e.target.value })}
                  placeholder="e.g., Entrance Zone"
                />
              </div>
              <div>
                <Label htmlFor="camera">Camera</Label>
                <Select
                  value={newZone.camera_id?.toString() || ""}
                  onValueChange={(value) => setNewZone({ ...newZone, camera_id: parseInt(value) })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a camera" />
                  </SelectTrigger>
                  <SelectContent>
                    {(cameras || []).map((camera: any) => (
                      <SelectItem key={camera.id} value={camera.id.toString()}>
                        {camera.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="analytics">Analytics</Label>
                <Select
                  value={newZone.analytics_id?.toString() || ""}
                  onValueChange={(value) => setNewZone({ ...newZone, analytics_id: parseInt(value) })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select analytics" />
                  </SelectTrigger>
                  <SelectContent>
                    {(analytics || []).map((analytic: any) => (
                      <SelectItem key={analytic.id} value={analytic.id.toString()}>
                        {analytic.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  checked={newZone.is_active}
                  onCheckedChange={(checked) => setNewZone({ ...newZone, is_active: checked })}
                />
                <Label>Active</Label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddZone}>Add Zone</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Camera</TableHead>
              <TableHead>Analytics</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(zones || []).map((zone) => (
              <TableRow key={zone.id}>
                <TableCell className="font-medium">{zone.name}</TableCell>
                <TableCell>{getCameraName(zone.camera_id)}</TableCell>
                <TableCell>{getAnalyticsName(zone.analytics_id)}</TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={zone.is_active}
                      onCheckedChange={() => handleToggleActive(zone.id)}
                    />
                    <span className={zone.is_active ? "text-green-600" : "text-red-600"}>
                      {zone.is_active ? "Active" : "Inactive"}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditClick(zone)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteZone(zone.id)}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Edit Zone Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Zone</DialogTitle>
            <DialogDescription>
              Update zone configuration
            </DialogDescription>
          </DialogHeader>
          {editZone && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-name">Zone Name</Label>
                <Input
                  id="edit-name"
                  value={editZone.name}
                  onChange={(e) => setEditZone({ ...editZone, name: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-camera">Camera</Label>
                <Select
                  value={editZone.camera_id.toString()}
                  onValueChange={(value) => setEditZone({ ...editZone, camera_id: parseInt(value) })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(cameras || []).map((camera: any) => (
                      <SelectItem key={camera.id} value={camera.id.toString()}>
                        {camera.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit-analytics">Analytics</Label>
                <Select
                  value={editZone.analytics_id.toString()}
                  onValueChange={(value) => setEditZone({ ...editZone, analytics_id: parseInt(value) })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(analytics || []).map((analytic: any) => (
                      <SelectItem key={analytic.id} value={analytic.id.toString()}>
                        {analytic.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  checked={editZone.is_active}
                  onCheckedChange={(checked) => setEditZone({ ...editZone, is_active: checked })}
                />
                <Label>Active</Label>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateZone}>Update Zone</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
} 