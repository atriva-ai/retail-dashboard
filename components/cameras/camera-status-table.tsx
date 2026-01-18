"use client"

import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { cn } from "@/lib/utils"
import { apiClient } from "@/lib/api"
import { Camera, CameraDisplay } from "@/types"

export default function CameraStatusTable() {
  const [cameraData, setCameraData] = useState<CameraDisplay[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const fetchCameras = async () => {
      try {
        console.log("CameraStatusTable: Fetching cameras from API...")
        const response = await apiClient.get<Camera[]>('/api/v1/cameras/')
        console.log("CameraStatusTable: Received cameras:", response)
        
        // Transform backend data to frontend format
        const transformedCameras: CameraDisplay[] = (response || []).map(camera => ({
          id: camera.id,
          name: camera.name,
          zone: camera.location || "Unknown Zone",
          ipAddress: camera.rtsp_url,
          status: camera.is_active ? "online" : "offline",
          analyticsEnabled: camera.zone_ids.length > 0,
          video_info: camera.video_info
        }))
        
        setCameraData(transformedCameras)
        setError(null)
      } catch (err) {
        console.error("CameraStatusTable: Error fetching cameras:", err)
        setError(err instanceof Error ? err : new Error("Failed to fetch cameras"))
        setCameraData([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchCameras()
  }, [])

  // Extract FPS from video_info
  const getFPS = (videoInfo: any): string => {
    if (!videoInfo) return "N/A"
    if (typeof videoInfo === 'object' && videoInfo.fps) {
      return `${videoInfo.fps}`
    }
    if (typeof videoInfo === 'string') {
      try {
        const parsed = JSON.parse(videoInfo)
        return parsed.fps ? `${parsed.fps}` : "N/A"
      } catch {
        return "N/A"
      }
    }
    return "N/A"
  }

  if (isLoading) {
    return <div className="text-center p-4">Loading camera status...</div>
  }
  if (error) {
    return <div className="text-center p-4 text-red-500">Failed to load camera status</div>
  }
  if (!cameraData || cameraData.length === 0) {
    return <div className="text-center p-4">No cameras found.</div>
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Camera Name</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>FPS</TableHead>
          <TableHead>Analytics</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {cameraData.map((camera) => (
          <TableRow key={camera.id}>
            <TableCell className="font-medium">{camera.name}</TableCell>
            <TableCell>
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
            </TableCell>
            <TableCell>{getFPS(camera.video_info)}</TableCell>
            <TableCell>
              <Badge
                variant="outline"
                className={cn(
                  "text-xs",
                  camera.analyticsEnabled 
                    ? "bg-green-500/10 text-green-500 border-green-500/20" 
                    : "bg-gray-500/10 text-gray-500 border-gray-500/20"
                )}
              >
                {camera.analyticsEnabled ? "Enabled" : "Disabled"}
              </Badge>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}


