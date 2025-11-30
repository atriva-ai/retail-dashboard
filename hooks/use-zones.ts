import { useState, useEffect } from 'react'
import { apiClient } from '@/lib/api'

export interface Zone {
  id: number
  name: string
  camera_id: number
  analytics_id: number
  is_active: boolean
  created_at: string
  updated_at: string
  analytics?: {
    id: number
    name: string
    type: string
    is_active: boolean
  }
}

export interface ZoneCreate {
  name: string
  camera_id: number
  analytics_id: number
  is_active?: boolean
}

export interface ZoneUpdate {
  name?: string
  camera_id?: number
  analytics_id?: number
  is_active?: boolean
}

export function useZones() {
  const [zones, setZones] = useState<Zone[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchZones = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await apiClient.get<Zone[]>('/api/v1/zones')
      setZones(response || [])
    } catch (err) {
      setError('Failed to fetch zones')
      console.error('Error fetching zones:', err)
    } finally {
      setLoading(false)
    }
  }

  const createZone = async (data: ZoneCreate): Promise<Zone | null> => {
    try {
      setError(null)
      const response = await apiClient.post<Zone>('/api/v1/zones', data)
      await fetchZones() // Refresh the list
      return response
    } catch (err) {
      setError('Failed to create zone')
      console.error('Error creating zone:', err)
      return null
    }
  }

  const updateZone = async (id: number, data: ZoneUpdate): Promise<Zone | null> => {
    try {
      setError(null)
      const response = await apiClient.put<Zone>(`/api/v1/zones/${id}`, data)
      await fetchZones() // Refresh the list
      return response
    } catch (err) {
      setError('Failed to update zone')
      console.error('Error updating zone:', err)
      return null
    }
  }

  const deleteZone = async (id: number): Promise<boolean> => {
    try {
      setError(null)
      await apiClient.delete(`/api/v1/zones/${id}`)
      await fetchZones() // Refresh the list
      return true
    } catch (err) {
      setError('Failed to delete zone')
      console.error('Error deleting zone:', err)
      return false
    }
  }

  const toggleZoneActive = async (id: number): Promise<Zone | null> => {
    try {
      setError(null)
      // Get current zone to toggle its status
      const currentZone = zones.find(zone => zone.id === id)
      if (!currentZone) {
        setError('Zone not found')
        return null
      }
      
      const response = await apiClient.put<Zone>(`/api/v1/zones/${id}`, {
        is_active: !currentZone.is_active
      })
      await fetchZones() // Refresh the list
      return response
    } catch (err) {
      setError('Failed to toggle zone status')
      console.error('Error toggling zone status:', err)
      return null
    }
  }

  const getZonesByCamera = async (cameraId: number): Promise<Zone[]> => {
    try {
      const response = await apiClient.get<Zone[]>(`/api/v1/zones/camera/${cameraId}`)
      return response || []
    } catch (err) {
      console.error('Error fetching zones by camera:', err)
      return []
    }
  }

  useEffect(() => {
    fetchZones()
  }, [])

  return {
    zones,
    loading,
    error,
    fetchZones,
    createZone,
    updateZone,
    deleteZone,
    toggleZoneActive,
    getZonesByCamera,
  }
} 