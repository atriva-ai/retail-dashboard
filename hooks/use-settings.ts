import { useState, useEffect, useCallback } from 'react'
import { apiClient } from '@/lib/api'

export interface Settings {
  store_name: string
  store_description: string
  store_timezone: string
  store_language: string
  store_theme: string
  store_notifications_enabled: boolean
  store_analytics_enabled: boolean
  // AI Inference settings
  ai_inference_fps?: number
  person_detection_enabled_by_default?: boolean
}

// Create a global state for settings
let globalSettings: Settings | null = null
let listeners: Set<() => void> = new Set()

// Function to notify all listeners
const notifyListeners = () => {
  listeners.forEach(listener => listener())
}

export function useSettings() {
  const [settings, setSettings] = useState<Settings | null>(globalSettings)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [pendingChanges, setPendingChanges] = useState<Partial<Settings>>({})

  // Subscribe to global settings changes
  useEffect(() => {
    const listener = () => {
      setSettings(globalSettings)
    }
    listeners.add(listener)
    return () => {
      listeners.delete(listener)
    }
  }, [])

  const fetchSettings = useCallback(async () => {
    try {
      setLoading(true)
      const data = await apiClient.get<Settings>('/api/v1/settings/')
      globalSettings = data
      setSettings(data)
      notifyListeners()
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch settings'))
    } finally {
      setLoading(false)
    }
  }, [])

  const updateSettings = useCallback((newSettings: Partial<Settings>) => {
    // Only update local state and pending changes
    setPendingChanges(prev => ({ ...prev, ...newSettings }))
    if (settings) {
      // Update local state only, don't update global state
      setSettings(prev => ({ ...prev!, ...newSettings }))
    }
  }, [settings])

  const saveChanges = useCallback(async () => {
    if (Object.keys(pendingChanges).length === 0) return
    
    try {
      setLoading(true)
      // Send all pending changes to the API
      const data = await apiClient.put<Settings>('/api/v1/settings/', {
        ...settings,
        ...pendingChanges
      })
      
      // Update global state with the response from the API
      globalSettings = data
      setSettings(data)
      notifyListeners()
      
      // Clear pending changes
      setPendingChanges({})
      setError(null)

      // Force a refresh of settings
      await fetchSettings()
      
      return data
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to update settings')
      setError(error)
      // Revert local state on error
      if (settings) {
        setSettings({ ...settings })
      }
      throw error
    } finally {
      setLoading(false)
    }
  }, [pendingChanges, settings, fetchSettings])

  useEffect(() => {
    fetchSettings()
  }, [fetchSettings])

  return {
    settings,
    loading,
    error,
    updateSettings,
    saveChanges,
    refreshSettings: fetchSettings,
    hasPendingChanges: Object.keys(pendingChanges).length > 0
  }
} 