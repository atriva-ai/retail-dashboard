"use client"

import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { apiClient } from "@/lib/api"
import { Camera, CameraDisplay } from "@/types"

// Fallback data in case API fails
const fallbackCameras = [
  { id: 1, zone: "Entrance 1", status: "online" },
  { id: 2, zone: "Entrance 2", status: "online" },
  { id: 3, zone: "Product Area A", status: "online" },
  { id: 4, zone: "Product Area B", status: "online" },
  { id: 5, zone: "Product Area C", status: "warning" },
  { id: 6, zone: "Cashier 1", status: "online" },
  { id: 7, zone: "Cashier 2", status: "online" },
  { id: 8, zone: "Cashier 3", status: "offline" },
  { id: 9, zone: "Inventory A", status: "online" },
  { id: 10, zone: "Inventory B", status: "online" },
  { id: 11, zone: "Product Area D", status: "online" },
  { id: 12, zone: "Product Area E", status: "online" },
  { id: 13, zone: "Product Area F", status: "online" },
  { id: 14, zone: "Staff Area", status: "online" },
  { id: 15, zone: "Exit 1", status: "online" },
  { id: 16, zone: "Exit 2", status: "online" },
]

export default function CameraStatusGrid() {
  const [cameraData, setCameraData] = useState<CameraDisplay[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const fetchCameras = async () => {
      try {
        console.log("CameraStatusGrid: Fetching cameras from API...")
        const response = await apiClient.get<Camera[]>('/api/v1/cameras/')
        console.log("CameraStatusGrid: Received cameras:", response)
        
        // Transform backend data to frontend format
        const transformedCameras: CameraDisplay[] = (response || []).map(camera => ({
          id: camera.id,
          name: camera.name,
          zone: camera.location || "Unknown Zone",
          ipAddress: camera.rtsp_url,
          status: camera.is_active ? "online" : "offline",
          analyticsEnabled: camera.zone_ids.length > 0
        }))
        
        setCameraData(transformedCameras)
        setError(null)
      } catch (err) {
        console.error("CameraStatusGrid: Error fetching cameras:", err)
        setError(err instanceof Error ? err : new Error("Failed to fetch cameras"))
        setCameraData([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchCameras()
  }, [])

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
    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
      {cameraData.map((camera) => (
        <div key={camera.id} className="border rounded-md p-2 flex flex-col">
          <div className="text-xs font-medium truncate">{camera.zone}</div>
          <div className="flex items-center justify-between mt-1">
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
            <div
              className={cn(
                "w-2 h-2 rounded-full",
                camera.status === "online" && "bg-green-500",
                camera.status === "warning" && "bg-yellow-500",
                camera.status === "offline" && "bg-red-500",
              )}
            />
          </div>
        </div>
      ))}
    </div>
  )
}
