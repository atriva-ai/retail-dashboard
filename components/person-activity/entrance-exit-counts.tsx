"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowRight, ArrowLeft, Users } from "lucide-react"
import { apiClient } from "@/lib/api"

interface EntranceExitCount {
  camera_id: number
  camera_name: string
  camera_location: string | null
  enter_count: number
  exit_count: number
  total_count: number
}

interface EntranceExitCountsResponse {
  date: string
  counts: EntranceExitCount[]
}

export default function EntranceExitCounts() {
  const [counts, setCounts] = useState<EntranceExitCount[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  const fetchCounts = async () => {
    try {
      setError(null)
      const response = await apiClient.get<EntranceExitCountsResponse>('/api/v1/entrance-exit/counts')
      if (response && response.counts) {
        setCounts(response.counts)
        setLastUpdated(new Date())
      }
    } catch (err) {
      console.error("Error fetching entrance/exit counts:", err)
      setError("Failed to load counts")
    } finally {
      setLoading(false)
    }
  }

  // Fetch on mount and poll every 5 seconds
  useEffect(() => {
    fetchCounts()
    const interval = setInterval(fetchCounts, 5000)
    return () => clearInterval(interval)
  }, [])

  if (loading && counts.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Entrance / Exit Analytics</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Loading counts...</p>
        </CardContent>
      </Card>
    )
  }

  if (error && counts.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Entrance / Exit Analytics</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-destructive">{error}</p>
        </CardContent>
      </Card>
    )
  }

  if (counts.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Entrance / Exit Analytics</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            No entrance/exit data available. Make sure entrance/exit analytics is enabled for at least one camera.
          </p>
        </CardContent>
      </Card>
    )
  }

  // Calculate totals
  const totalEnters = counts.reduce((sum, c) => sum + c.enter_count, 0)
  const totalExits = counts.reduce((sum, c) => sum + c.exit_count, 0)
  const grandTotal = totalEnters + totalExits

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">Entrance / Exit Analytics (Today)</CardTitle>
          {lastUpdated && (
            <span className="text-xs text-muted-foreground">
              Updated {lastUpdated.toLocaleTimeString()}
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Summary Cards */}
          <div className="grid grid-cols-3 gap-4">
            <div className="flex flex-col items-center justify-center p-3 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
              <ArrowRight className="h-5 w-5 text-green-600 dark:text-green-400 mb-1" />
              <div className="text-2xl font-bold text-green-700 dark:text-green-300">{totalEnters}</div>
              <div className="text-xs text-green-600 dark:text-green-400">Total Entrances</div>
            </div>
            <div className="flex flex-col items-center justify-center p-3 bg-red-50 dark:bg-red-950 rounded-lg border border-red-200 dark:border-red-800">
              <ArrowLeft className="h-5 w-5 text-red-600 dark:text-red-400 mb-1" />
              <div className="text-2xl font-bold text-red-700 dark:text-red-300">{totalExits}</div>
              <div className="text-xs text-red-600 dark:text-red-400">Total Exits</div>
            </div>
            <div className="flex flex-col items-center justify-center p-3 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
              <Users className="h-5 w-5 text-blue-600 dark:text-blue-400 mb-1" />
              <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">{grandTotal}</div>
              <div className="text-xs text-blue-600 dark:text-blue-400">Total Events</div>
            </div>
          </div>

          {/* Per-Camera Breakdown */}
          <div className="space-y-2">
            <h4 className="text-sm font-semibold">By Camera</h4>
            <div className="space-y-2">
              {counts.map((count) => (
                <div
                  key={count.camera_id}
                  className="flex items-center justify-between p-3 bg-muted rounded-lg"
                >
                  <div className="flex-1">
                    <div className="font-medium text-sm">{count.camera_name}</div>
                    {count.camera_location && (
                      <div className="text-xs text-muted-foreground">{count.camera_location}</div>
                    )}
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <ArrowRight className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium">{count.enter_count}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <ArrowLeft className="h-4 w-4 text-red-600" />
                      <span className="text-sm font-medium">{count.exit_count}</span>
                    </div>
                    <div className="text-sm font-semibold text-muted-foreground">
                      {count.total_count} total
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

