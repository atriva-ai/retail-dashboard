"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Camera, Edit, Plus, Trash, RefreshCw } from "lucide-react"
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
  video_info: any
  created_at: string
  updated_at: string
  stream_status?: string
  frame_count?: number
}

interface VideoValidation {
  status: string
  video_info: any
  errors: string[]
}

interface CreateCameraResponse {
  camera: Camera
  video_validation: VideoValidation
}

interface ActivateCameraResponse {
  camera_id: number
  rtsp_url: string
  activation: {
    status: string
    decode_status: any
    errors: string[]
  }
}

interface DecodeStatusResponse {
  camera_id: string
  status: string
  frame_count: number
  last_error?: string
}

export default function CameraSettings() {
  const [cameras, setCameras] = useState<Camera[]>([])
  const [loading, setLoading] = useState(true)
  const [editCamera, setEditCamera] = useState<Camera | null>(null)
  const [newCamera, setNewCamera] = useState<Partial<Camera>>({
    name: "",
    rtsp_url: "",
    location: "",
  })
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isFramePreviewOpen, setIsFramePreviewOpen] = useState(false)
  const [selectedCameraForPreview, setSelectedCameraForPreview] = useState<Camera | null>(null)
  const [framePreviewData, setFramePreviewData] = useState<{imageUrl: string, frameCount: number} | null>(null)
  const [framePreviewLoading, setFramePreviewLoading] = useState(false)
  const [statusPolling, setStatusPolling] = useState<{[key: number]: NodeJS.Timeout}>({})
  const [processingCameras, setProcessingCameras] = useState<{[key: number]: boolean}>({})
  const [refreshingCameras, setRefreshingCameras] = useState<{[key: number]: boolean}>({})
  const { toast } = useToast()

  const fetchCameras = async () => {
    try {
      const response = await apiClient.get<Camera[]>('/api/v1/cameras/')
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

  // Poll decode status for cameras that are starting or running
  const pollDecodeStatus = useCallback(async (cameraId: number) => {
    try {
      const response = await apiClient.get<DecodeStatusResponse>(`/api/v1/cameras/${cameraId}/decode-status/`)
      if (response) {
        setCameras(prev => prev.map(c => 
          c.id === cameraId 
            ? { 
                ...c, 
                stream_status: response.status === 'completed' ? 'active' : response.status,
                frame_count: response.frame_count,
                is_active: response.status === 'active' || response.status === 'completed'
              }
            : c
        ))
        
        // Only stop polling if decode failed or was explicitly stopped
        if (response.status === 'error' || response.status === 'stopped') {
          if (statusPolling[cameraId]) {
            clearInterval(statusPolling[cameraId])
            setStatusPolling(prev => {
              const newPolling = { ...prev }
              delete newPolling[cameraId]
              return newPolling
            })
          }
          // Clear processing state
          setProcessingCameras(prev => {
            const newProcessing = { ...prev }
            delete newProcessing[cameraId]
            return newProcessing
          })
        } else if (response.status === 'completed' || response.status === 'active') {
          // Clear processing state but keep polling for active cameras
          setProcessingCameras(prev => {
            const newProcessing = { ...prev }
            delete newProcessing[cameraId]
            return newProcessing
          })
        }
      }
    } catch (error) {
      console.error(`Failed to poll status for camera ${cameraId}:`, error)
      // Clear processing state on error
      setProcessingCameras(prev => {
        const newProcessing = { ...prev }
        delete newProcessing[cameraId]
        return newProcessing
      })
    }
  }, [statusPolling])

  // Start polling for a camera
  const startStatusPolling = useCallback((cameraId: number) => {
    if (statusPolling[cameraId]) {
      clearInterval(statusPolling[cameraId])
    }
    
    const interval = setInterval(() => pollDecodeStatus(cameraId), 2000) // Poll every 2 seconds
    setStatusPolling(prev => ({ ...prev, [cameraId]: interval }))
  }, [statusPolling, pollDecodeStatus])

  // Stop polling for a camera
  const stopStatusPolling = useCallback((cameraId: number) => {
    if (statusPolling[cameraId]) {
      clearInterval(statusPolling[cameraId])
      setStatusPolling(prev => {
        const newPolling = { ...prev }
        delete newPolling[cameraId]
        return newPolling
      })
    }
  }, [statusPolling])

  // Start polling for all active cameras
  const startPollingForActiveCameras = useCallback(() => {
    cameras.forEach(camera => {
      if (camera.stream_status === 'active' || camera.stream_status === 'starting' || (camera.frame_count && camera.frame_count > 0)) {
        if (!statusPolling[camera.id]) {
          startStatusPolling(camera.id)
        }
      }
    })
  }, [cameras, statusPolling, startStatusPolling])

  useEffect(() => {
    fetchCameras()
    
    // Cleanup polling on unmount
    return () => {
      Object.values(statusPolling).forEach(interval => clearInterval(interval))
    }
  }, [statusPolling])

  // Start polling for active cameras when cameras list changes
  useEffect(() => {
    if (cameras.length > 0) {
      startPollingForActiveCameras()
    }
  }, [cameras, startPollingForActiveCameras])

  const handleAddCamera = async () => {
    if (newCamera.name && newCamera.rtsp_url) {
      try {
        const response = await apiClient.post<CreateCameraResponse>('/api/v1/cameras/', newCamera)
        
        if (response && response.camera) {
          toast({
            title: "Success",
            description: "Camera added successfully",
          })
          
          if (response.video_validation) {
            const validation = response.video_validation
            if (validation.status === "validated") {
              toast({
                title: "Video Stream Validated",
                description: `Video stream is accessible. Camera is ready to be activated.`,
              })
            } else if (validation.errors && validation.errors.length > 0) {
              toast({
                title: "Video Stream Issues",
                description: `Camera added but video stream has issues: ${validation.errors.join(", ")}`,
                variant: "destructive",
              })
            }
          }
        }
        
        setNewCamera({
          name: "",
          rtsp_url: "",
          location: "",
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
      stopStatusPolling(id)
      setProcessingCameras(prev => {
        const newProcessing = { ...prev }
        delete newProcessing[id]
        return newProcessing
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

  const handleToggleStreaming = async (camera: Camera) => {
    const isCurrentlyActive = camera.stream_status === 'active' || (camera.frame_count && camera.frame_count > 0)
    
    try {
      setProcessingCameras(prev => ({ ...prev, [camera.id]: true }))
      
      if (isCurrentlyActive) {
        // Stop streaming
        await apiClient.post(`/api/v1/cameras/${camera.id}/deactivate/`)
        
        // Update local state immediately
        setCameras(prev => prev.map(c => 
          c.id === camera.id 
            ? { ...c, stream_status: 'stopping', is_active: false }
            : c
        ))
        
        // Start polling to track stopping progress
        startStatusPolling(camera.id)
        
        toast({
          title: "Stopping Stream",
          description: "Camera stream is being stopped...",
        })
      } else {
        // Start streaming
        const response = await apiClient.post<ActivateCameraResponse>(`/api/v1/cameras/${camera.id}/activate/`)
        
        if (response && response.activation) {
          const activation = response.activation
          
          // Update local state based on activation response
          setCameras(prev => prev.map(c => 
            c.id === camera.id 
              ? { 
                  ...c, 
                  stream_status: activation.status === 'started' ? 'starting' : activation.status,
                  is_active: activation.status === 'started' || activation.status === 'active'
                }
              : c
          ))
          
          if (activation.status === 'started' || activation.status === 'active') {
            // Start polling to track starting progress
            startStatusPolling(camera.id)
            
            toast({
              title: "Starting Stream",
              description: "Camera stream is being started...",
            })
          } else if (activation.errors && activation.errors.length > 0) {
            toast({
              title: "Activation Failed",
              description: `Failed to start stream: ${activation.errors.join(", ")}`,
              variant: "destructive",
            })
            setProcessingCameras(prev => {
              const newProcessing = { ...prev }
              delete newProcessing[camera.id]
              return newProcessing
            })
          }
        }
      }
    } catch (error) {
      console.error('Toggle streaming error:', error)
      toast({
        title: "Error",
        description: `Failed to ${isCurrentlyActive ? 'stop' : 'start'} camera stream`,
        variant: "destructive",
      })
      setProcessingCameras(prev => {
        const newProcessing = { ...prev }
        delete newProcessing[camera.id]
        return newProcessing
      })
    }
  }

  const handleEditClick = (camera: Camera) => {
    setEditCamera(camera)
    setIsEditDialogOpen(true)
  }

  const handleSnapshotPreview = async (camera: Camera) => {
    setSelectedCameraForPreview(camera)
    setIsFramePreviewOpen(true)
    setFramePreviewLoading(true)
    setFramePreviewData(null)
    
    try {
      // Get the latest frame using the snapshot endpoint
      const frameResponse = await fetch(`/api/v1/cameras/${camera.id}/latest-frame/`)
      if (frameResponse.ok) {
        const blob = await frameResponse.blob()
        const imageUrl = URL.createObjectURL(blob)
        
        // Get decode status for frame count
        const statusResponse = await apiClient.get<DecodeStatusResponse>(`/api/v1/cameras/${camera.id}/decode-status/`)
        const frameCount = statusResponse?.frame_count || 0
        
        setFramePreviewData({ imageUrl, frameCount })
      } else {
        toast({
          title: "Error",
          description: "Failed to load snapshot preview",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load snapshot preview",
        variant: "destructive",
      })
    } finally {
      setFramePreviewLoading(false)
    }
  }

  const handleRefreshStatus = async (camera: Camera) => {
    try {
      setRefreshingCameras(prev => ({ ...prev, [camera.id]: true }))
      const response = await apiClient.get<DecodeStatusResponse>(`/api/v1/cameras/${camera.id}/decode-status/`)
      if (response) {
        setCameras(prev => prev.map(c => 
          c.id === camera.id 
            ? { 
                ...c, 
                stream_status: response.status === 'completed' ? 'active' : response.status,
                frame_count: response.frame_count,
                is_active: response.status === 'active' || response.status === 'completed'
              }
            : c
        ))
        
        toast({
          title: "Status Updated",
          description: `Camera status refreshed successfully. Current status: ${response.status}`,
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to refresh status",
        variant: "destructive",
      })
    } finally {
      setRefreshingCameras(prev => {
        const newRefreshing = { ...prev }
        delete newRefreshing[camera.id]
        return newRefreshing
      })
    }
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
              <TableHead>Streaming Controls & Status</TableHead>
              <TableHead>Video Info</TableHead>
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
                  <div className="flex items-center gap-2">
                    <div className="flex flex-col gap-2">
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant={(camera.stream_status === 'active' || (camera.frame_count && camera.frame_count > 0)) ? 'destructive' : 'default'}
                          onClick={() => handleToggleStreaming(camera)}
                          disabled={
                            camera.stream_status === 'starting' || 
                            camera.stream_status === 'stopping' || 
                            processingCameras[camera.id]
                          }
                        >
                          {(camera.stream_status === 'active' || (camera.frame_count && camera.frame_count > 0)) ? 'Stop' : 'Start'} Streaming
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleRefreshStatus(camera)}
                          disabled={processingCameras[camera.id] || refreshingCameras[camera.id]}
                        >
                          <RefreshCw className={`h-3 w-3 mr-1 ${refreshingCameras[camera.id] ? 'animate-spin' : ''}`} />
                          Refresh
                        </Button>
                      </div>
                      <div className="text-sm">
                        <span className="font-medium">Status: </span>
                        <span className={
                          camera.stream_status === 'active' || (camera.frame_count && camera.frame_count > 0) ? 'text-green-600' :
                          camera.stream_status === 'starting' ? 'text-yellow-600' :
                          camera.stream_status === 'stopping' ? 'text-yellow-600' :
                          camera.stream_status === 'error' ? 'text-red-600' :
                          'text-gray-600'
                        }>
                          {(camera.stream_status === 'active' || (camera.frame_count && camera.frame_count > 0)) && 'Active'}
                          {camera.stream_status === 'starting' && 'Starting...'}
                          {camera.stream_status === 'stopping' && 'Stopping...'}
                          {camera.stream_status === 'stopped' && 'Stopped'}
                          {camera.stream_status === 'error' && 'Error'}
                          {!camera.stream_status && !camera.frame_count && (camera.is_active ? 'Active' : 'Stopped')}
                          {processingCameras[camera.id] && 'Processing...'}
                        </span>
                      </div>
                      {camera.frame_count !== undefined && camera.frame_count > 0 && (
                        <div className="text-xs text-muted-foreground">
                          {camera.frame_count} frames decoded
                        </div>
                      )}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  {camera.video_info ? (
                    <div className="text-sm space-y-1">
                      <div>Codec: {camera.video_info.info?.codec || "Unknown"}</div>
                      <div>Resolution: {camera.video_info.info?.width || "?"}x{camera.video_info.info?.height || "?"}</div>
                      <div>FPS: {camera.video_info.info?.fps || "?"}</div>
                    </div>
                  ) : (
                    <span className="text-sm text-muted-foreground">No video info</span>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleSnapshotPreview(camera)}
                      title="View Latest Snapshot"
                      disabled={!camera.frame_count || camera.frame_count === 0}
                    >
                      <Camera className="h-4 w-4" />
                    </Button>
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
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Frame Preview Dialog */}
      <Dialog open={isFramePreviewOpen} onOpenChange={setIsFramePreviewOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>
              Latest Snapshot - {selectedCameraForPreview?.name}
            </DialogTitle>
            <DialogDescription>
              View the most recently decoded snapshot from the camera stream.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center p-4">
            {framePreviewLoading ? (
              <div className="flex items-center justify-center h-64">
                <RefreshCw className="h-8 w-8 animate-spin" />
                <span className="ml-2">Loading snapshot...</span>
              </div>
            ) : framePreviewData ? (
              <div className="space-y-4">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">
                    Frame Count: {framePreviewData.frameCount}
                  </p>
                </div>
                <div className="border rounded-lg overflow-hidden">
                  <img 
                    src={framePreviewData.imageUrl} 
                    alt="Latest snapshot" 
                    className="max-w-full h-auto"
                    style={{ maxHeight: '400px' }}
                  />
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-64">
                <span className="text-muted-foreground">No snapshot available</span>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button 
              onClick={() => {
                if (framePreviewData?.imageUrl) {
                  URL.revokeObjectURL(framePreviewData.imageUrl)
                }
                setIsFramePreviewOpen(false)
                setFramePreviewData(null)
                setSelectedCameraForPreview(null)
              }}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
