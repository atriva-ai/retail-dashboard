"use client"

import { useState, useCallback } from "react"
import { apiClient } from "@/lib/api"
import { useApi } from "./use-api"

export interface Camera {
  id: number
  name: string
  zone: string
  ipAddress: string
  status: "online" | "offline" | "warning"
  analyticsEnabled: boolean
}

/**
 * Hook for fetching all cameras
 */
export function useCameras(immediate = true) {
  return useApi<Camera[]>(() => apiClient.get<Camera[]>("/api/v1/cameras"), immediate)
}

/**
 * Hook for fetching a single camera by ID
 */
export function useCamera(id: number, immediate = true) {
  return useApi<Camera>(() => apiClient.get<Camera>(`/api/v1/cameras/${id}`), immediate)
}

/**
 * Hook for camera CRUD operations
 */
export function useCameraOperations() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const createCamera = useCallback(async (cameraData: Omit<Camera, "id">) => {
    setIsLoading(true)
    setError(null)
    try {
      const result = await apiClient.post<Camera>("/api/v1/cameras", cameraData)
      setIsLoading(false)
      return result
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Failed to create camera")
      setError(error)
      setIsLoading(false)
      throw error
    }
  }, [])

  const updateCamera = useCallback(async (id: number, cameraData: Partial<Camera>) => {
    setIsLoading(true)
    setError(null)
    try {
      const result = await apiClient.put<Camera>(`/api/v1/cameras/${id}`, cameraData)
      setIsLoading(false)
      return result
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Failed to update camera")
      setError(error)
      setIsLoading(false)
      throw error
    }
  }, [])

  const deleteCamera = useCallback(async (id: number) => {
    setIsLoading(true)
    setError(null)
    try {
      const result = await apiClient.delete<{ success: boolean }>(`/api/v1/cameras/${id}`)
      setIsLoading(false)
      return result
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Failed to delete camera")
      setError(error)
      setIsLoading(false)
      throw error
    }
  }, [])

  return {
    isLoading,
    error,
    createCamera,
    updateCamera,
    deleteCamera,
  }
}
