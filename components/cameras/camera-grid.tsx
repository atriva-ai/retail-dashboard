"use client"

import { useEffect, useState, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { apiClient } from "@/lib/api"
import { Camera, CameraDisplay } from "@/types"
import { Wifi, WifiOff, Activity, Bell, BellOff, Eye, EyeOff } from "lucide-react"

// Utility function to extract IP address from RTSP URL
const extractIpFromRtsp = (rtspUrl: string): string => {
  try {
    // Handle different RTSP URL formats
    // rtsp://user:pass@192.168.1.100:554/stream
    // rtsp://192.168.1.100:554/stream
    const url = new URL(rtspUrl)
    return url.hostname
  } catch (error) {
    // Fallback: try to extract IP using regex
    const ipMatch = rtspUrl.match(/(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})/)
    return ipMatch ? ipMatch[1] : "Unknown"
  }
}

// Utility function to get status icon
const getStatusIcon = (status: string, isActive: boolean) => {
  if (status === "active" && isActive) {
    return <Wifi className="h-4 w-4 text-green-500" />
  } else if (status === "starting") {
    return <Activity className="h-4 w-4 text-yellow-500 animate-pulse" />
  } else {
    return <WifiOff className="h-4 w-4 text-red-500" />
  }
}

export default function CameraGrid() {
  const [cameras, setCameras] = useState<CameraDisplay[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  // Fetch cameras with all related data (metadata only, no snapshots)
  const fetchCamerasWithData = useCallback(async () => {
    try {
      console.log("CameraGrid: Fetching camera metadata...")
      const response = await apiClient.get<Camera[]>('/api/v1/cameras/')
      console.log("CameraGrid: Received cameras:", response)
      
      if (!response || response.length === 0) {
        setCameras([])
        return
      }

      // Fetch analytics and alert data for all cameras (metadata only)
      const camerasWithData = await Promise.all(
        (response || []).map(async (camera) => {
          try {
            // Fetch decoder status
            const decoderStatus = await apiClient.get<any>(`/api/v1/cameras/${camera.id}/decode-status/`)
            
            // Fetch analytics for this camera
            const analytics = await apiClient.get<any[]>(`/api/v1/analytics/camera/${camera.id}/`)
            
            // Fetch alert engines for this camera
            const alertEngines = await apiClient.get<any[]>(`/api/v1/alert-engines/camera/${camera.id}/`)
            
            // Extract IP from RTSP URL
            const ipAddress = extractIpFromRtsp(camera.rtsp_url)
            
            // Determine status based on decoder status
            let status: "online" | "offline" | "warning" = "offline"
            if (decoderStatus?.is_active && decoderStatus?.streaming_status === "streaming") {
              status = "online"
            } else if (decoderStatus?.streaming_status === "starting") {
              status = "warning"
            }

            return {
              id: camera.id,
              name: camera.name,
              zone: camera.location || "Unknown Zone",
              ipAddress,
              status,
              analyticsEnabled: Array.isArray(analytics) && analytics.length > 0,
              alertEnabled: Array.isArray(alertEngines) && alertEngines.length > 0,
              video_info: camera.video_info,
              decoderStatus: {
                is_active: decoderStatus?.is_active || false,
                status: decoderStatus?.status || "unknown",
                streaming_status: decoderStatus?.streaming_status || "unknown"
              },
              snapshotUrl: undefined // Don't fetch snapshots in metadata updates
            }
          } catch (error) {
            console.error(`Error fetching data for camera ${camera.id}:`, error)
            // Return camera with default values if data fetching fails
            return {
              id: camera.id,
              name: camera.name,
              zone: camera.location || "Unknown Zone",
              ipAddress: extractIpFromRtsp(camera.rtsp_url),
              status: "offline" as const,
              analyticsEnabled: false,
              alertEnabled: false,
              video_info: camera.video_info,
              decoderStatus: {
                is_active: false,
                status: "unknown"
              },
              snapshotUrl: undefined
            }
          }
        })
      )

      // Preserve existing snapshot URLs when updating metadata
      setCameras(prevCameras => {
        return camerasWithData.map(newCamera => {
          const existingCamera = prevCameras.find(c => c.id === newCamera.id)
          return {
            ...newCamera,
            snapshotUrl: existingCamera?.snapshotUrl || newCamera.snapshotUrl
          }
        })
      })
      setError(null)
    } catch (err) {
      console.error("CameraGrid: Error fetching cameras:", err)
      setError(err instanceof Error ? err : new Error("Failed to fetch cameras"))
      setCameras([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Fetch snapshot for a specific camera
  const fetchSnapshot = useCallback(async (cameraId: number) => {
    try {
      const response = await apiClient.get<Blob>(`/api/v1/cameras/${cameraId}/latest-frame/`, { responseType: 'blob' })
      if (response instanceof Blob) {
        return URL.createObjectURL(response)
      }
      return null
    } catch (error) {
      console.error(`Error fetching snapshot for camera ${cameraId}:`, error)
      return null
    }
  }, [])

  // Update snapshots for all cameras
  const updateSnapshots = useCallback(async () => {
    const updatedCameras = await Promise.all(
      cameras.map(async (camera) => {
        const snapshotUrl = await fetchSnapshot(camera.id)
        return {
          ...camera,
          snapshotUrl: snapshotUrl || camera.snapshotUrl
        }
      })
    )
    setCameras(updatedCameras)
  }, [cameras, fetchSnapshot])

  // Initial data fetch
  useEffect(() => {
    fetchCamerasWithData()
  }, [fetchCamerasWithData])

  // Set up snapshot refresh interval
  useEffect(() => {
    if (cameras.length === 0) return

    // Initial snapshot fetch
    updateSnapshots()

    // Set up 5-second interval for snapshots only
    const snapshotInterval = setInterval(updateSnapshots, 5000)

    return () => {
      clearInterval(snapshotInterval)
    }
  }, [cameras.length, updateSnapshots])

  // Set up status refresh interval (separate from snapshots)
  useEffect(() => {
    if (cameras.length === 0) return

    // Set up 10-second interval for status updates (metadata only, no snapshots)
    const statusInterval = setInterval(fetchCamerasWithData, 10000)

    return () => {
      clearInterval(statusInterval)
    }
  }, [cameras.length, fetchCamerasWithData])

  if (isLoading) {
    return <div className="text-center p-4">Loading cameras...</div>
  }

  if (error) {
    return <div className="text-center p-4 text-red-500">Failed to load cameras</div>
  }

  if (!cameras || cameras.length === 0) {
    return <div className="text-center p-4">No cameras found.</div>
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {cameras.map((camera) => (
        <Card key={camera.id} className="overflow-hidden">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {getStatusIcon(camera.decoderStatus?.status || "unknown", camera.decoderStatus?.is_active || false)}
                <CardTitle className="text-sm font-medium">{camera.name}</CardTitle>
              </div>
              <Badge
                variant="outline"
                className={cn(
                  "text-xs",
                  camera.status === "online" && "bg-green-500/10 text-green-500 border-green-500/20",
                  camera.status === "warning" && "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
                  camera.status === "offline" && "bg-red-500/10 text-red-500 border-red-500/20",
                )}
              >
                {camera.status}
              </Badge>
            </div>
          </CardHeader>
          
          <CardContent className="pt-0">
            {/* Snapshot Image */}
            <div className="relative mb-4">
              {camera.snapshotUrl ? (
                <img
                  src={camera.snapshotUrl}
                  alt={`Snapshot from ${camera.name}`}
                  className="w-full h-48 object-cover rounded-md"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none'
                  }}
                />
              ) : (
                <div className="w-full h-48 bg-gray-200 rounded-md flex items-center justify-center">
                  <span className="text-gray-500 text-sm">No snapshot available</span>
                </div>
              )}
            </div>

            {/* Camera Information */}
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Location:</span>
                <span>{camera.zone}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-muted-foreground">IP Address:</span>
                <span className="font-mono text-xs">{camera.ipAddress}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Analytics:</span>
                <div className="flex items-center space-x-1">
                  {camera.analyticsEnabled ? (
                    <Eye className="h-4 w-4 text-green-500" />
                  ) : (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  )}
                  <Badge variant={camera.analyticsEnabled ? "default" : "secondary"}>
                    {camera.analyticsEnabled ? "Enabled" : "Disabled"}
                  </Badge>
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Alerts:</span>
                <div className="flex items-center space-x-1">
                  {camera.alertEnabled ? (
                    <Bell className="h-4 w-4 text-red-500" />
                  ) : (
                    <BellOff className="h-4 w-4 text-gray-400" />
                  )}
                  <Badge variant={camera.alertEnabled ? "default" : "secondary"}>
                    {camera.alertEnabled ? "Enabled" : "Disabled"}
                  </Badge>
                </div>
              </div>
              
              {/* Video Info - Resolution and FPS only */}
              {camera.video_info && (
                <div className="border-t pt-2 mt-2">
                  <div className="text-xs text-muted-foreground mb-1">Video Info:</div>
                  <div className="space-y-1 text-xs">
                    <div>Resolution: {camera.video_info.info?.width || "?"}x{camera.video_info.info?.height || "?"}</div>
                    <div>FPS: {camera.video_info.info?.fps || "?"}</div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
