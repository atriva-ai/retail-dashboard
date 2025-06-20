"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { apiClient } from "@/lib/api"
import { Camera, CameraDisplay } from "@/types"

export default function CameraGrid() {
  const [cameras, setCameras] = useState<CameraDisplay[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const fetchCameras = async () => {
      try {
        console.log("CameraGrid: Fetching cameras from API...")
        const response = await apiClient.get<Camera[]>('/api/v1/cameras/')
        console.log("CameraGrid: Received cameras:", response)
        
        // Transform backend data to frontend format
        const transformedCameras: CameraDisplay[] = (response || []).map(camera => ({
          id: camera.id,
          name: camera.name,
          zone: camera.location || "Unknown Zone",
          ipAddress: camera.rtsp_url,
          status: camera.is_active ? "online" : "offline",
          analyticsEnabled: camera.zone_ids.length > 0
        }))
        
        setCameras(transformedCameras)
        setError(null)
      } catch (err) {
        console.error("CameraGrid: Error fetching cameras:", err)
        setError(err instanceof Error ? err : new Error("Failed to fetch cameras"))
        setCameras([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchCameras()
  }, [])

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
              <CardTitle className="text-sm font-medium">{camera.name}</CardTitle>
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
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Zone:</span>
                <span>{camera.zone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">IP Address:</span>
                <span className="font-mono text-xs">{camera.ipAddress}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Analytics:</span>
                <Badge variant={camera.analyticsEnabled ? "default" : "secondary"}>
                  {camera.analyticsEnabled ? "Enabled" : "Disabled"}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
