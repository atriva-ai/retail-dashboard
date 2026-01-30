"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { ArrowUpDown, ArrowUp, ArrowDown, Download } from "lucide-react"
import { apiClient } from "@/lib/api"
import { Camera } from "@/types"
import { cn } from "@/lib/utils"
import EntranceExitCounts from "@/components/person-activity/entrance-exit-counts"

interface ActivityRecord {
  sessionId: string
  camera: string
  duration: string
  zoneVisited: string
  longestZone: string
}

type SortField = "sessionId" | "camera" | "duration" | "zoneVisited" | "longestZone"
type SortDirection = "asc" | "desc" | null

// Mock data - replace with API call when backend is ready
const mockActivityData: ActivityRecord[] = [
  { sessionId: "SESS-001", camera: "Entrance 1", duration: "12m 34s", zoneVisited: "Entrance, Product A, Checkout", longestZone: "Product A (8m 12s)" },
  { sessionId: "SESS-002", camera: "Entrance 2", duration: "8m 45s", zoneVisited: "Entrance, Product B", longestZone: "Product B (6m 20s)" },
  { sessionId: "SESS-003", camera: "Product Area A", duration: "15m 22s", zoneVisited: "Product A, Product B, Product C", longestZone: "Product B (9m 45s)" },
  { sessionId: "SESS-004", camera: "Entrance 1", duration: "5m 12s", zoneVisited: "Entrance, Exit", longestZone: "Entrance (3m 10s)" },
  { sessionId: "SESS-005", camera: "Product Area B", duration: "22m 15s", zoneVisited: "Product A, Product B, Product D, Checkout", longestZone: "Product D (12m 30s)" },
  { sessionId: "SESS-006", camera: "Checkout 1", duration: "3m 45s", zoneVisited: "Checkout", longestZone: "Checkout (3m 45s)" },
  { sessionId: "SESS-007", camera: "Entrance 2", duration: "18m 30s", zoneVisited: "Entrance, Product A, Product C, Checkout", longestZone: "Product C (10m 15s)" },
  { sessionId: "SESS-008", camera: "Product Area C", duration: "9m 20s", zoneVisited: "Product C, Product D", longestZone: "Product C (5m 45s)" },
  { sessionId: "SESS-009", camera: "Entrance 1", duration: "14m 55s", zoneVisited: "Entrance, Product A, Product B, Checkout", longestZone: "Product A (8m 20s)" },
  { sessionId: "SESS-010", camera: "Product Area A", duration: "7m 10s", zoneVisited: "Product A, Exit", longestZone: "Product A (5m 30s)" },
  { sessionId: "SESS-011", camera: "Checkout 2", duration: "4m 25s", zoneVisited: "Checkout", longestZone: "Checkout (4m 25s)" },
  { sessionId: "SESS-012", camera: "Entrance 2", duration: "11m 40s", zoneVisited: "Entrance, Product B, Product C", longestZone: "Product B (7m 15s)" },
  { sessionId: "SESS-013", camera: "Product Area B", duration: "16m 18s", zoneVisited: "Product A, Product B, Product D, Checkout", longestZone: "Product B (9m 45s)" },
  { sessionId: "SESS-014", camera: "Entrance 1", duration: "6m 30s", zoneVisited: "Entrance, Exit", longestZone: "Entrance (4m 20s)" },
  { sessionId: "SESS-015", camera: "Product Area C", duration: "20m 50s", zoneVisited: "Product C, Product D, Product E, Checkout", longestZone: "Product E (12m 10s)" },
  { sessionId: "SESS-016", camera: "Checkout 1", duration: "2m 55s", zoneVisited: "Checkout", longestZone: "Checkout (2m 55s)" },
  { sessionId: "SESS-017", camera: "Entrance 2", duration: "13m 25s", zoneVisited: "Entrance, Product A, Product B", longestZone: "Product A (8m 40s)" },
  { sessionId: "SESS-018", camera: "Product Area A", duration: "10m 15s", zoneVisited: "Product A, Product C", longestZone: "Product A (6m 20s)" },
  { sessionId: "SESS-019", camera: "Entrance 1", duration: "19m 45s", zoneVisited: "Entrance, Product A, Product B, Product C, Checkout", longestZone: "Product B (10m 30s)" },
  { sessionId: "SESS-020", camera: "Product Area B", duration: "8m 50s", zoneVisited: "Product B, Product D", longestZone: "Product B (5m 15s)" },
]

export default function PersonActivityPage() {
  const [cameras, setCameras] = useState<Camera[]>([])
  const [selectedCamera, setSelectedCamera] = useState<string>("all")
  const [selectedHour, setSelectedHour] = useState<string>("all")
  const [sortField, setSortField] = useState<SortField | null>(null)
  const [sortDirection, setSortDirection] = useState<SortDirection>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  
  const itemsPerPage = 10

  // Fetch cameras for the filter
  useEffect(() => {
    const fetchCameras = async () => {
      try {
        const response = await apiClient.get<Camera[]>('/api/v1/cameras/')
        setCameras(response || [])
      } catch (err) {
        console.error("Error fetching cameras:", err)
      } finally {
        setIsLoading(false)
      }
    }
    fetchCameras()
  }, [])

  // Generate hourly options for today
  const hourlyOptions = useMemo(() => {
    const hours = []
    for (let i = 0; i < 24; i++) {
      const hour = i.toString().padStart(2, '0')
      hours.push({ value: hour, label: `${hour}:00` })
    }
    return hours
  }, [])

  // Filter and sort data
  const filteredAndSortedData = useMemo(() => {
    let data = [...mockActivityData]

    // Apply camera filter
    if (selectedCamera !== "all") {
      const camera = cameras.find(c => c.id.toString() === selectedCamera)
      if (camera) {
        data = data.filter(record => record.camera === camera.name)
      }
    }

    // Apply hour filter (if needed - for now just using all)
    // This would filter by time when backend provides timestamp data

    // Apply sorting
    if (sortField && sortDirection) {
      data.sort((a, b) => {
        let aVal = a[sortField]
        let bVal = b[sortField]

        // Handle duration sorting (convert to seconds)
        if (sortField === "duration") {
          const parseDuration = (dur: string) => {
            const match = dur.match(/(\d+)m\s*(\d+)s/)
            if (match) {
              return parseInt(match[1]) * 60 + parseInt(match[2])
            }
            return 0
          }
          aVal = parseDuration(a.duration)
          bVal = parseDuration(b.duration)
        }

        if (aVal < bVal) return sortDirection === "asc" ? -1 : 1
        if (aVal > bVal) return sortDirection === "asc" ? 1 : -1
        return 0
      })
    }

    return data
  }, [selectedCamera, selectedHour, sortField, sortDirection, cameras])

  // Paginate data
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    return filteredAndSortedData.slice(startIndex, endIndex)
  }, [filteredAndSortedData, currentPage])

  const totalPages = Math.ceil(filteredAndSortedData.length / itemsPerPage)

  // Generate pagination page numbers
  const getPaginationPages = (): (number | string)[] => {
    const maxVisible = 7
    const pages: (number | string)[] = []
    
    if (totalPages <= maxVisible) {
      // Show all pages if total is less than max
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      // Show first page
      pages.push(1)
      
      if (currentPage <= 3) {
        // Show first few pages
        for (let i = 2; i <= 5; i++) {
          pages.push(i)
        }
        pages.push("ellipsis")
        pages.push(totalPages)
      } else if (currentPage >= totalPages - 2) {
        // Show last few pages
        pages.push("ellipsis")
        for (let i = totalPages - 4; i <= totalPages; i++) {
          pages.push(i)
        }
      } else {
        // Show pages around current
        pages.push("ellipsis")
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i)
        }
        pages.push("ellipsis")
        pages.push(totalPages)
      }
    }
    
    return pages
  }

  // Handle column sorting
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      if (sortDirection === "asc") {
        setSortDirection("desc")
      } else if (sortDirection === "desc") {
        setSortField(null)
        setSortDirection(null)
      } else {
        setSortDirection("asc")
      }
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
    setCurrentPage(1) // Reset to first page when sorting changes
  }

  // Get sort icon for column
  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="ml-2 h-4 w-4 opacity-50" />
    }
    if (sortDirection === "asc") {
      return <ArrowUp className="ml-2 h-4 w-4" />
    }
    if (sortDirection === "desc") {
      return <ArrowDown className="ml-2 h-4 w-4" />
    }
    return <ArrowUpDown className="ml-2 h-4 w-4 opacity-50" />
  }

  // Export to CSV
  const handleExportCSV = () => {
    const headers = ["Session ID", "Camera", "Duration", "Zone Visited", "Longest Zone"]
    const csvRows = [
      headers.join(","),
      ...filteredAndSortedData.map(row => [
        row.sessionId,
        row.camera,
        row.duration,
        `"${row.zoneVisited}"`,
        `"${row.longestZone}"`
      ].join(","))
    ]
    const csvContent = csvRows.join("\n")
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", `activity-data-${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Retail Analytics Overview</h2>
        <p className="text-muted-foreground">
          Real-time and historical insights from in-store cameras
        </p>
      </div>

      {/* Entrance/Exit Counts */}
      <EntranceExitCounts />

      {/* Filter Bar */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div className="w-full md:w-1/3">
              <label className="text-sm font-medium mb-2 block">Camera</label>
              <Select value={selectedCamera} onValueChange={setSelectedCamera}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Camera" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Cameras</SelectItem>
                  {cameras.map((camera) => (
                    <SelectItem key={camera.id} value={camera.id.toString()}>
                      {camera.name} {camera.location ? `(${camera.location})` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="w-full md:w-1/3">
              <label className="text-sm font-medium mb-2 block">Time Range (Today - Hourly)</label>
              <Select value={selectedHour} onValueChange={setSelectedHour}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Hour" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Hours</SelectItem>
                  {hourlyOptions.map((hour) => (
                    <SelectItem key={hour.value} value={hour.value}>
                      {hour.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="w-full md:w-1/3">
              <Button onClick={handleExportCSV} variant="outline" className="w-full">
                <Download className="mr-2 h-4 w-4" />
                Export CSV
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Activity Table */}
      <Card>
        <CardHeader>
          <CardTitle>Activity Table</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSort("sessionId")}
                  >
                    <div className="flex items-center">
                      Session ID
                      {getSortIcon("sessionId")}
                    </div>
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSort("camera")}
                  >
                    <div className="flex items-center">
                      Camera
                      {getSortIcon("camera")}
                    </div>
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSort("duration")}
                  >
                    <div className="flex items-center">
                      Duration
                      {getSortIcon("duration")}
                    </div>
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSort("zoneVisited")}
                  >
                    <div className="flex items-center">
                      Zone Visited
                      {getSortIcon("zoneVisited")}
                    </div>
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSort("longestZone")}
                  >
                    <div className="flex items-center">
                      Longest Zone
                      {getSortIcon("longestZone")}
                    </div>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      Loading activity data...
                    </TableCell>
                  </TableRow>
                ) : paginatedData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      No activity data found for the selected filters.
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedData.map((record) => (
                    <TableRow key={record.sessionId}>
                      <TableCell className="font-medium">{record.sessionId}</TableCell>
                      <TableCell>{record.camera}</TableCell>
                      <TableCell>{record.duration}</TableCell>
                      <TableCell>{record.zoneVisited}</TableCell>
                      <TableCell>{record.longestZone}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-4">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      href="#"
                      onClick={(e) => {
                        e.preventDefault()
                        if (currentPage > 1) {
                          setCurrentPage(prev => prev - 1)
                        }
                      }}
                      className={cn(currentPage === 1 && "pointer-events-none opacity-50")}
                    />
                  </PaginationItem>
                  {getPaginationPages().map((page, idx) => {
                    if (page === "ellipsis") {
                      return (
                        <PaginationItem key={`ellipsis-${idx}`}>
                          <PaginationEllipsis />
                        </PaginationItem>
                      )
                    }
                    const pageNum = page as number
                    return (
                      <PaginationItem key={pageNum}>
                        <PaginationLink
                          href="#"
                          onClick={(e) => {
                            e.preventDefault()
                            setCurrentPage(pageNum)
                          }}
                          isActive={currentPage === pageNum}
                        >
                          {pageNum}
                        </PaginationLink>
                      </PaginationItem>
                    )
                  })}
                  <PaginationItem>
                    <PaginationNext
                      href="#"
                      onClick={(e) => {
                        e.preventDefault()
                        if (currentPage < totalPages) {
                          setCurrentPage(prev => prev + 1)
                        }
                      }}
                      className={cn(currentPage === totalPages && "pointer-events-none opacity-50")}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}

          {/* Results count */}
          <div className="mt-4 text-sm text-muted-foreground">
            Showing {paginatedData.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} to{" "}
            {Math.min(currentPage * itemsPerPage, filteredAndSortedData.length)} of{" "}
            {filteredAndSortedData.length} results
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
