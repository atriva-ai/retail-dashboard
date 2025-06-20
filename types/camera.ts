export interface Camera {
  id: number
  name: string
  rtsp_url: string
  location: string | null
  is_active: boolean
  zone_ids: number[]
  created_at: string
  updated_at: string
}

// Frontend-specific interface for display
export interface CameraDisplay {
  id: number
  name: string
  zone: string
  ipAddress: string
  status: "online" | "offline" | "warning"
  analyticsEnabled: boolean
} 