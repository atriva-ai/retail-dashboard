"use client"

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
