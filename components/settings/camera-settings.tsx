"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Camera, Edit, Plus, Trash } from "lucide-react"
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
  created_at: string
  updated_at: string
}

export default function CameraSettings() {
  const [cameras, setCameras] = useState<Camera[]>([])
  const [loading, setLoading] = useState(true)
  const [editCamera, setEditCamera] = useState<Camera | null>(null)
  const [newCamera, setNewCamera] = useState<Partial<Camera>>({
    name: "",
    rtsp_url: "",
    location: "",
    is_active: true,
  })
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const { toast } = useToast()

  const fetchCameras = async () => {
    try {
      const response = await apiClient.get<Camera[]>('/api/v1/cameras')
      setCameras(response || [])
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch cameras",
        variant: "destructive",
      })
      setCameras([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCameras()
  }, [])

  const handleAddCamera = async () => {
    if (newCamera.name && newCamera.rtsp_url) {
      try {
        await apiClient.post('/api/v1/cameras', newCamera)
        toast({
          title: "Success",
          description: "Camera added successfully",
        })
        setNewCamera({
          name: "",
          rtsp_url: "",
          location: "",
          is_active: true,
        })
        setIsAddDialogOpen(false)
        fetchCameras()
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to add camera",
          variant: "destructive",
        })
      }
    }
  }

  const handleUpdateCamera = async () => {
    if (editCamera) {
      try {
        await apiClient.put(`/api/v1/cameras/${editCamera.id}`, editCamera)
        toast({
          title: "Success",
          description: "Camera updated successfully",
        })
        setEditCamera(null)
        setIsEditDialogOpen(false)
        fetchCameras()
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to update camera",
          variant: "destructive",
        })
      }
    }
  }

  const handleDeleteCamera = async (id: number) => {
    try {
      await apiClient.delete(`/api/v1/cameras/${id}`)
      toast({
        title: "Success",
        description: "Camera deleted successfully",
      })
      fetchCameras()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete camera",
        variant: "destructive",
      })
    }
  }

  const handleToggleActive = async (id: number, currentValue: boolean) => {
    try {
      await apiClient.put(`/api/v1/cameras/${id}`, { is_active: !currentValue })
      fetchCameras()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update camera status",
        variant: "destructive",
      })
    }
  }

  const handleEditClick = (camera: Camera) => {
    setEditCamera(camera)
    setIsEditDialogOpen(true)
  }

  if (loading) {
    return <div className="flex justify-center p-4">Loading cameras...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Cameras ({cameras?.length || 0})</h3>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Camera
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Camera</DialogTitle>
              <DialogDescription>Enter the details for the new camera.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Name
                </Label>
                <Input
                  id="name"
                  value={newCamera.name}
                  onChange={(e) => setNewCamera({ ...newCamera, name: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="rtsp_url" className="text-right">
                  RTSP URL
                </Label>
                <Input
                  id="rtsp_url"
                  value={newCamera.rtsp_url}
                  onChange={(e) => setNewCamera({ ...newCamera, rtsp_url: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="location" className="text-right">
                  Location
                </Label>
                <Input
                  id="location"
                  value={newCamera.location || ""}
                  onChange={(e) => setNewCamera({ ...newCamera, location: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="is_active" className="text-right">
                  Active
                </Label>
                <Switch
                  id="is_active"
                  checked={newCamera.is_active}
                  onCheckedChange={(checked) => setNewCamera({ ...newCamera, is_active: checked })}
                  className="col-span-3"
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleAddCamera}>Add Camera</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>RTSP URL</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {cameras?.map((camera) => (
              <TableRow key={camera.id}>
                <TableCell>{camera.name}</TableCell>
                <TableCell>{camera.location || "Not specified"}</TableCell>
                <TableCell className="max-w-[200px] truncate">{camera.rtsp_url}</TableCell>
                <TableCell>
                  <Switch
                    checked={camera.is_active}
                    onCheckedChange={() => handleToggleActive(camera.id, camera.is_active)}
                  />
                </TableCell>
                <TableCell className="text-right">
                  <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="ghost" size="icon" onClick={() => handleEditClick(camera)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Edit Camera</DialogTitle>
                        <DialogDescription>Update the camera details.</DialogDescription>
                      </DialogHeader>
                      {editCamera && (
                        <div className="grid gap-4 py-4">
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="edit-name" className="text-right">
                              Name
                            </Label>
                            <Input
                              id="edit-name"
                              value={editCamera.name}
                              onChange={(e) => setEditCamera({ ...editCamera, name: e.target.value })}
                              className="col-span-3"
                            />
                          </div>
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="edit-rtsp" className="text-right">
                              RTSP URL
                            </Label>
                            <Input
                              id="edit-rtsp"
                              value={editCamera.rtsp_url}
                              onChange={(e) => setEditCamera({ ...editCamera, rtsp_url: e.target.value })}
                              className="col-span-3"
                            />
                          </div>
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="edit-location" className="text-right">
                              Location
                            </Label>
                            <Input
                              id="edit-location"
                              value={editCamera.location || ""}
                              onChange={(e) => setEditCamera({ ...editCamera, location: e.target.value })}
                              className="col-span-3"
                            />
                          </div>
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="edit-active" className="text-right">
                              Active
                            </Label>
                            <Switch
                              id="edit-active"
                              checked={editCamera.is_active}
                              onCheckedChange={(checked) => setEditCamera({ ...editCamera, is_active: checked })}
                              className="col-span-3"
                            />
                          </div>
                        </div>
                      )}
                      <DialogFooter>
                        <Button onClick={handleUpdateCamera}>Save Changes</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteCamera(camera.id)}
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
