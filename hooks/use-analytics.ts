"use client"

import { useState, useEffect } from 'react'
import { apiClient } from "@/lib/api"
import { useApi } from "./use-api"

export interface AnalyticsEngine {
  id: string
  name: string
  enabled: boolean
  sensitivity: number
  processingMode: "real-time" | "batch" | "hybrid"
}

export interface TrafficData {
  time: string
  entrance: number
  productArea: number
  checkout: number
}

export interface DwellTimeData {
  zone: string
  avgTime: number
  peakTime: number
}

export interface Analytics {
  id: number
  name: string
  type: string
  config?: Record<string, any>
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface AnalyticsCreate {
  name: string
  type: string
  config?: Record<string, any>
  is_active?: boolean
}

export interface AnalyticsUpdate {
  name?: string
  type?: string
  config?: Record<string, any>
  is_active?: boolean
}

export interface CameraAnalytics {
  camera_id: number
  analytics_id: number
}

/**
 * Hook for fetching analytics engines
 */
export function useAnalyticsEngines(immediate = true) {
  return useApi<AnalyticsEngine[]>(() => apiClient.get<AnalyticsEngine[]>("/analytics/engines"), immediate)
}

/**
 * Hook for updating analytics engine settings
 */
export function useUpdateAnalyticsEngine() {
  return useApi<AnalyticsEngine, { id: string; data: Partial<AnalyticsEngine> }>(({ id, data }) =>
    apiClient.put<AnalyticsEngine>(`/analytics/engines/${id}`, data),
  )
}

/**
 * Hook for fetching traffic data
 */
export function useTrafficData(timeframe: "today" | "week" | "month" = "today", immediate = true) {
  return useApi<TrafficData[]>(() => apiClient.get<TrafficData[]>("/analytics/traffic", { timeframe }), immediate)
}

/**
 * Hook for fetching dwell time data
 */
export function useDwellTimeData(timeframe: "today" | "week" | "month" = "today", immediate = true) {
  return useApi<DwellTimeData[]>(
    () => apiClient.get<DwellTimeData[]>("/analytics/dwell-time", { timeframe }),
    immediate,
  )
}

/**
 * Hook for fetching heatmap data
 */
export function useHeatmapData(zone = "all", timeframe: "today" | "week" | "month" = "today") {
  return useApi<{ x: number; y: number; value: number }[]>(
    () => apiClient.get("/analytics/heatmap", { zone, timeframe }),
    true,
  )
}

export function useAnalytics() {
  const [analytics, setAnalytics] = useState<Analytics[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchAnalytics = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await apiClient.get<Analytics[]>('/api/analytics')
      setAnalytics(response || [])
    } catch (err) {
      setError('Failed to fetch analytics')
      console.error('Error fetching analytics:', err)
    } finally {
      setLoading(false)
    }
  }

  const createAnalytics = async (data: AnalyticsCreate): Promise<Analytics | null> => {
    try {
      setError(null)
      const response = await apiClient.post<Analytics>('/api/analytics', data)
      await fetchAnalytics() // Refresh the list
      return response
    } catch (err) {
      setError('Failed to create analytics')
      console.error('Error creating analytics:', err)
      return null
    }
  }

  const updateAnalytics = async (id: number, data: AnalyticsUpdate): Promise<Analytics | null> => {
    try {
      setError(null)
      const response = await apiClient.put<Analytics>(`/api/analytics/${id}`, data)
      await fetchAnalytics() // Refresh the list
      return response
    } catch (err) {
      setError('Failed to update analytics')
      console.error('Error updating analytics:', err)
      return null
    }
  }

  const deleteAnalytics = async (id: number): Promise<boolean> => {
    try {
      setError(null)
      await apiClient.delete(`/api/analytics/${id}`)
      await fetchAnalytics() // Refresh the list
      return true
    } catch (err) {
      setError('Failed to delete analytics')
      console.error('Error deleting analytics:', err)
      return false
    }
  }

  const getCameraAnalytics = async (cameraId: number): Promise<Analytics[]> => {
    try {
      const response = await apiClient.get<Analytics[]>(`/api/analytics/camera/${cameraId}`)
      return response || []
    } catch (err) {
      console.error('Error fetching camera analytics:', err)
      return []
    }
  }

  const addAnalyticsToCamera = async (cameraId: number, analyticsId: number): Promise<boolean> => {
    try {
      await apiClient.post('/api/analytics/camera', {
        camera_id: cameraId,
        analytics_id: analyticsId
      })
      return true
    } catch (err) {
      console.error('Error adding analytics to camera:', err)
      return false
    }
  }

  const removeAnalyticsFromCamera = async (cameraId: number, analyticsId: number): Promise<boolean> => {
    try {
      await apiClient.delete(`/api/analytics/camera/${cameraId}/${analyticsId}`)
      return true
    } catch (err) {
      console.error('Error removing analytics from camera:', err)
      return false
    }
  }

  useEffect(() => {
    fetchAnalytics()
  }, [])

  return {
    analytics,
    loading,
    error,
    fetchAnalytics,
    createAnalytics,
    updateAnalytics,
    deleteAnalytics,
    getCameraAnalytics,
    addAnalyticsToCamera,
    removeAnalyticsFromCamera,
  }
}
