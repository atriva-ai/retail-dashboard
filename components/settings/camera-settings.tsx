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
import { useCameras, useCameraOperations, type Camera as CameraType } from "@/hooks/use-cameras"
import { toast } from "@/components/ui/use-toast"

const zones = [
  "Entrance 1",
  "Entrance 2",
  "Product Area A",
  "Product Area B",
  "Product Area C",
  "Cashier 1",
  "Cashier 2",
  "Cashier 3",
  "Exit 1",
  "Exit 2",
]

export default function CameraSettings() {
  const { data: camerasData, isLoading, error, execute: refreshCameras } = useCameras()
  const { createCamera, updateCamera, deleteCamera, isLoading: isOperationLoading } = useCameraOperations()

  const [cameras, setCameras] = useState<CameraType[]>([])
  const [editCamera, setEditCamera] = useState<CameraType | null>(null)
  const [newCamera, setNewCamera] = useState<Partial<CameraType>>({
    name: "",
    zone: "",
    ipAddress: "",
    status: "offline",
    analyticsEnabled: true,
  })

  // Update local state when API data changes
  useEffect(() => {
    if (camerasData) {
      setCameras(camerasData)
    }
  }, [camerasData])

  // Show error toast if API call fails
  useEffect(() => {
    if (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to load cameras",
        variant: "destructive",
      })
    }
  }, [error])

  const handleAddCamera = async () => {
    if (newCamera.name && newCamera.zone && newCamera.ipAddress) {
      try {
        await createCamera({
          name: newCamera.name,
          zone: newCamera.zone,
          ipAddress: newCamera.ipAddress,
          status: "offline",
          analyticsEnabled: newCamera.analyticsEnabled || false,
        } as Omit<CameraType, "id">)

        refreshCameras()

        setNewCamera({
          name: "",
          zone: "",
          ipAddress: "",
          status: "offline",
          analyticsEnabled: true,
        })

        toast({
          title: "Success",
          description: "Camera added successfully",
        })
      } catch (err) {
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
        await updateCamera(editCamera.id, editCamera)
        refreshCameras()
        setEditCamera(null)

        toast({
          title: "Success",
          description: "Camera updated successfully",
        })
      } catch (err) {
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
      await deleteCamera(id)
      refreshCameras()

      toast({
        title: "Success",
        description: "Camera deleted successfully",
      })
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to delete camera",
        variant: "destructive",
      })
    }
  }

  const handleToggleAnalytics = async (id: number, currentValue: boolean) => {
    try {
      await updateCamera(id, { analyticsEnabled: !currentValue })
      refreshCameras()
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to update camera analytics setting",
        variant: "destructive",
      })
    }
  }

  if (isLoading) {
    return <div className="flex justify-center p-4">Loading cameras...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Cameras ({cameras.length})</h3>
        <Dialog>
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
                <Label htmlFor="zone" className="text-right">
                  Zone
                </Label>
                <Select value={newCamera.zone} onValueChange={(value) => setNewCamera({ ...newCamera, zone: value })}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select zone" />
                  </SelectTrigger>
                  <SelectContent>
                    {zones.map((zone) => (
                      <SelectItem key={zone} value={zone}>
                        {zone}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="ipAddress" className="text-right">
                  IP Address
                </Label>
                <Input
                  id="ipAddress"
                  value={newCamera.ipAddress}
                  onChange={(e) => setNewCamera({ ...newCamera, ipAddress: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="analytics" className="text-right">
                  Analytics
                </Label>
                <div className="flex items-center space-x-2 col-span-3">
                  <Switch
                    id="analytics"
                    checked={newCamera.analyticsEnabled}
                    onCheckedChange={(checked) => setNewCamera({ ...newCamera, analyticsEnabled: checked })}
                  />
                  <Label htmlFor="analytics">Enable analytics for this camera</Label>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleAddCamera} disabled={isOperationLoading}>
                {isOperationLoading ? "Adding..." : "Add Camera"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Zone</TableHead>
              <TableHead>IP Address</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Analytics</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {cameras.map((camera) => (
              <TableRow key={camera.id}>
                <TableCell className="font-medium">{camera.name}</TableCell>
                <TableCell>{camera.zone}</TableCell>
                <TableCell>{camera.ipAddress}</TableCell>
                <TableCell>
                  <div className="flex items-center">
                    <div
                      className={`h-2 w-2 rounded-full mr-2 ${
                        camera.status === "online"
                          ? "bg-green-500"
                          : camera.status === "warning"
                            ? "bg-yellow-500"
                            : "bg-red-500"
                      }`}
                    />
                    {camera.status}
                  </div>
                </TableCell>
                <TableCell>
                  <Switch
                    checked={camera.analyticsEnabled}
                    onCheckedChange={() => handleToggleAnalytics(camera.id, camera.analyticsEnabled)}
                    disabled={isOperationLoading}
                  />
                </TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="icon" onClick={() => setEditCamera(camera)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        {editCamera && (
                          <>
                            <DialogHeader>
                              <DialogTitle>Edit Camera</DialogTitle>
                              <DialogDescription>Update the camera details.</DialogDescription>
                            </DialogHeader>
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
                                <Label htmlFor="edit-zone" className="text-right">
                                  Zone
                                </Label>
                                <Select
                                  value={editCamera.zone}
                                  onValueChange={(value) => setEditCamera({ ...editCamera, zone: value })}
                                >
                                  <SelectTrigger className="col-span-3">
                                    <SelectValue placeholder="Select zone" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {zones.map((zone) => (
                                      <SelectItem key={zone} value={zone}>
                                        {zone}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="edit-ipAddress" className="text-right">
                                  IP Address
                                </Label>
                                <Input
                                  id="edit-ipAddress"
                                  value={editCamera.ipAddress}
                                  onChange={(e) => setEditCamera({ ...editCamera, ipAddress: e.target.value })}
                                  className="col-span-3"
                                />
                              </div>
                              <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="edit-analytics" className="text-right">
                                  Analytics
                                </Label>
                                <div className="flex items-center space-x-2 col-span-3">
                                  <Switch
                                    id="edit-analytics"
                                    checked={editCamera.analyticsEnabled}
                                    onCheckedChange={(checked) =>
                                      setEditCamera({ ...editCamera, analyticsEnabled: checked })
                                    }
                                  />
                                  <Label htmlFor="edit-analytics">Enable analytics for this camera</Label>
                                </div>
                              </div>
                            </div>
                            <DialogFooter>
                              <Button onClick={handleUpdateCamera} disabled={isOperationLoading}>
                                {isOperationLoading ? "Saving..." : "Save Changes"}
                              </Button>
                            </DialogFooter>
                          </>
                        )}
                      </DialogContent>
                    </Dialog>
                    <Button
                      variant="outline"
                      size="icon"
                      className="text-red-500"
                      onClick={() => handleDeleteCamera(camera.id)}
                      disabled={isOperationLoading}
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

      <div className="bg-muted p-4 rounded-md">
        <div className="flex items-start space-x-3">
          <Camera className="h-5 w-5 mt-0.5 text-muted-foreground" />
          <div>
            <h4 className="font-medium">Camera Configuration Tips</h4>
            <ul className="text-sm text-muted-foreground mt-1 list-disc pl-4 space-y-1">
              <li>Ensure cameras have a static IP address for reliable connectivity</li>
              <li>Position cameras to maximize coverage of key areas</li>
              <li>For optimal analytics performance, maintain good lighting conditions</li>
              <li>Regularly check camera status to ensure continuous monitoring</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
