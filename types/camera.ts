// Backend camera interface
export interface Camera {
  id: number
  name: string
  rtsp_url: string
  location: string | null
  is_active: boolean
  video_info: any
  created_at: string
  updated_at: string
  zone_ids: number[]
}

// Frontend-specific interface for display
export interface CameraDisplay {
  id: number
  name: string
  zone: string
  ipAddress: string
  status: "online" | "offline" | "warning"
  analyticsEnabled: boolean
  video_info?: any
} 