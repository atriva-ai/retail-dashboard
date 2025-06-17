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
import { apiClient } from "@/lib/api"

interface Camera {
  id: number
  name: string
  rtsp_url: string
  location: string | null
  is_active: boolean
}

interface Zone {
  id: number
  name: string
  camera_id: number
  analytics_id: string
  is_active: boolean
  created_at: string
  updated_at: string
}

interface AnalyticsConfig {
  id: string
  name: string
  enabled: boolean
}

export default function ZoneSettings() {
  const [zones, setZones] = useState<Zone[]>([])
  const [cameras, setCameras] = useState<Camera[]>([])
  const [analytics, setAnalytics] = useState<AnalyticsConfig[]>([])
  const [loading, setLoading] = useState(true)
  const [editZone, setEditZone] = useState<Zone | null>(null)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [newZone, setNewZone] = useState<Partial<Zone>>({
    name: "",
    camera_id: 0,
    analytics_id: "",
    is_active: true,
  })
  const { toast } = useToast()

  // Fetch data on component mount
  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      // Fetch zones, cameras, and analytics configuration
      const [zonesResponse, camerasResponse] = await Promise.all([
        apiClient.get<Zone[]>('/api/v1/zones'),
        apiClient.get<Camera[]>('/api/v1/cameras'),
      ])
      
      setZones(zonesResponse || [])
      setCameras(camerasResponse || [])
      
      // For now, we'll use a static analytics config since it's managed in the analytics tab
      setAnalytics([
        {
          id: "people-counting",
          name: "People Counting",
          enabled: true,
        },
        {
          id: "dwell-time",
          name: "Dwell Time Analysis",
          enabled: true,
        },
      ])
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch data",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleAddZone = async () => {
    if (newZone.name && newZone.camera_id && newZone.analytics_id) {
      try {
        await apiClient.post('/api/v1/zones', newZone)
        toast({
          title: "Success",
          description: "Zone added successfully",
        })
        setNewZone({
          name: "",
          camera_id: 0,
          analytics_id: "",
          is_active: true,
        })
        setIsAddDialogOpen(false)
        fetchData()
      } catch (error) {
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
      try {
        await apiClient.put(`/api/v1/zones/${editZone.id}`, editZone)
        toast({
          title: "Success",
          description: "Zone updated successfully",
        })
        setEditZone(null)
        setIsEditDialogOpen(false)
        fetchData()
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to update zone",
          variant: "destructive",
        })
      }
    }
  }

  const handleDeleteZone = async (id: number) => {
    try {
      await apiClient.delete(`/api/v1/zones/${id}`)
      toast({
        title: "Success",
        description: "Zone deleted successfully",
      })
      fetchData()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete zone",
        variant: "destructive",
      })
    }
  }

  const handleToggleActive = async (id: number, currentValue: boolean) => {
    try {
      await apiClient.put(`/api/v1/zones/${id}`, { is_active: !currentValue })
      fetchData()
    } catch (error) {
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
    return cameras.find(camera => camera.id === cameraId)?.name || `Camera ${cameraId}`
  }

  const getAnalyticsName = (analyticsId: string) => {
    return analytics.find(analytic => analytic.id === analyticsId)?.name || analyticsId
  }

  if (loading) {
    return <div className="flex justify-center p-4">Loading zones...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Zones ({zones?.length || 0})</h3>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Zone
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Zone</DialogTitle>
              <DialogDescription>Enter the details for the new zone.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Name
                </Label>
                <Input
                  id="name"
                  value={newZone.name}
                  onChange={(e) => setNewZone({ ...newZone, name: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="camera" className="text-right">
                  Camera
                </Label>
                <Select 
                  value={newZone.camera_id?.toString() || ""} 
                  onValueChange={(value) => setNewZone({ ...newZone, camera_id: parseInt(value) })}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select a camera" />
                  </SelectTrigger>
                  <SelectContent>
                    {cameras.filter(camera => camera.is_active).map((camera) => (
                      <SelectItem key={camera.id} value={camera.id.toString()}>
                        {camera.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="analytics" className="text-right">
                  Analytics
                </Label>
                <Select 
                  value={newZone.analytics_id || ""} 
                  onValueChange={(value) => setNewZone({ ...newZone, analytics_id: value })}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select analytics" />
                  </SelectTrigger>
                  <SelectContent>
                    {analytics.filter(analytic => analytic.enabled && analytic.id !== "line-crossing").map((analytic) => (
                      <SelectItem key={analytic.id} value={analytic.id}>
                        {analytic.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="is_active" className="text-right">
                  Active
                </Label>
                <Switch
                  id="is_active"
                  checked={newZone.is_active}
                  onCheckedChange={(checked) => setNewZone({ ...newZone, is_active: checked })}
                  className="col-span-3"
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleAddZone}>Add Zone</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Camera</TableHead>
              <TableHead>Analytics</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {zones?.map((zone) => (
              <TableRow key={zone.id}>
                <TableCell className="font-medium">{zone.name}</TableCell>
                <TableCell>
                  <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
                    {getCameraName(zone.camera_id)}
                  </span>
                </TableCell>
                <TableCell>
                  <span className="text-sm bg-green-100 text-green-800 px-2 py-1 rounded">
                    {getAnalyticsName(zone.analytics_id)}
                  </span>
                </TableCell>
                <TableCell>
                  <Switch
                    checked={zone.is_active}
                    onCheckedChange={() => handleToggleActive(zone.id, zone.is_active)}
                  />
                </TableCell>
                <TableCell className="text-right">
                  <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="ghost" size="icon" onClick={() => handleEditClick(zone)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Edit Zone</DialogTitle>
                        <DialogDescription>Update the zone details.</DialogDescription>
                      </DialogHeader>
                      {editZone && (
                        <div className="grid gap-4 py-4">
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="edit-name" className="text-right">
                              Name
                            </Label>
                            <Input
                              id="edit-name"
                              value={editZone.name}
                              onChange={(e) => setEditZone({ ...editZone, name: e.target.value })}
                              className="col-span-3"
                            />
                          </div>
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="edit-camera" className="text-right">
                              Camera
                            </Label>
                            <Select 
                              value={editZone.camera_id?.toString() || ""} 
                              onValueChange={(value) => setEditZone({ ...editZone, camera_id: parseInt(value) })}
                            >
                              <SelectTrigger className="col-span-3">
                                <SelectValue placeholder="Select a camera" />
                              </SelectTrigger>
                              <SelectContent>
                                {cameras.filter(camera => camera.is_active).map((camera) => (
                                  <SelectItem key={camera.id} value={camera.id.toString()}>
                                    {camera.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="edit-analytics" className="text-right">
                              Analytics
                            </Label>
                            <Select 
                              value={editZone.analytics_id || ""} 
                              onValueChange={(value) => setEditZone({ ...editZone, analytics_id: value })}
                            >
                              <SelectTrigger className="col-span-3">
                                <SelectValue placeholder="Select analytics" />
                              </SelectTrigger>
                              <SelectContent>
                                {analytics.filter(analytic => analytic.enabled && analytic.id !== "line-crossing").map((analytic) => (
                                  <SelectItem key={analytic.id} value={analytic.id}>
                                    {analytic.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="edit-active" className="text-right">
                              Active
                            </Label>
                            <Switch
                              id="edit-active"
                              checked={editZone.is_active}
                              onCheckedChange={(checked) => setEditZone({ ...editZone, is_active: checked })}
                              className="col-span-3"
                            />
                          </div>
                        </div>
                      )}
                      <DialogFooter>
                        <Button onClick={handleUpdateZone}>Save Changes</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteZone(zone.id)}
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
} 