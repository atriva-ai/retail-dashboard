// Backend camera interface
export interface Camera {
  id: number
  name: string
  rtsp_url: string
  location: string | null
  is_active: boolean
  streaming_status: string // "stopped", "starting", "streaming", "stopping", "error"
  video_info: any
  created_at: string
  updated_at: string
  zone_ids: number[]
  stream_status?: string // e.g., 'active', 'stopped', 'starting', 'error' (legacy field)
}

// Frontend-specific interface for display
export interface CameraDisplay {
  id: number
  name: string
  zone: string
  ipAddress: string
  status: "online" | "offline" | "warning"
  analyticsEnabled: boolean
  alertEnabled: boolean
  video_info?: any
  stream_status?: string // e.g., 'active', 'stopped', 'starting', 'error'
  snapshotUrl?: string
  decoderStatus?: {
    is_active: boolean
    status: string
    streaming_status?: string
  }
} 