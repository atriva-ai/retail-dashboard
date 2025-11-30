import { useState, useEffect } from 'react'
import { apiClient } from '@/lib/api'
import { getAllAnalyticsTypes, type AnalyticsTypeConfig } from '@/lib/constants/analytics'

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

export function useAnalyticsManagement() {
  const [analytics, setAnalytics] = useState<Analytics[]>([])
  const [analyticsTypes, setAnalyticsTypes] = useState<Record<string, AnalyticsTypeConfig>>({})
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

  const fetchAnalyticsTypes = async () => {
    try {
      const response = await apiClient.get<Record<string, AnalyticsTypeConfig>>('/api/analytics/types')
      setAnalyticsTypes(response || {})
    } catch (err) {
      console.error('Error fetching analytics types:', err)
      // Fallback to local constants if API fails
      const localTypes = getAllAnalyticsTypes().reduce((acc, type) => {
        acc[type.type] = type
        return acc
      }, {} as Record<string, AnalyticsTypeConfig>)
      setAnalyticsTypes(localTypes)
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
    fetchAnalyticsTypes()
  }, [])

  return {
    analytics,
    analyticsTypes,
    loading,
    error,
    fetchAnalytics,
    fetchAnalyticsTypes,
    createAnalytics,
    updateAnalytics,
    deleteAnalytics,
    getCameraAnalytics,
    addAnalyticsToCamera,
    removeAnalyticsFromCamera,
  }
} 