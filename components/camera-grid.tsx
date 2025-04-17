"use client"

import { useState } from "react"
import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"

interface CameraData {
  id: number
  zone: string
  activity: string
  status: "online" | "offline"
}

const cameras: CameraData[] = [
  { id: 1, zone: "Entrance 1", activity: "Counting Visitors", status: "online" },
  { id: 2, zone: "Entrance 2", activity: "Detecting Demography", status: "online" },
  { id: 3, zone: "Product Area A", activity: "Tracking Dwell Time", status: "online" },
  { id: 4, zone: "Product Area B", activity: "Heat Mapping", status: "online" },
  { id: 5, zone: "Product Area C", activity: "Tracking Dwell Time", status: "online" },
  { id: 6, zone: "Cashier 1", activity: "Queue Management", status: "online" },
  { id: 7, zone: "Cashier 2", activity: "Service Time Analysis", status: "online" },
  { id: 8, zone: "Cashier 3", activity: "Queue Management", status: "offline" },
  { id: 9, zone: "Inventory A", activity: "Staff Monitoring", status: "online" },
  { id: 10, zone: "Inventory B", activity: "Activity Tracking", status: "online" },
  { id: 11, zone: "Product Area D", activity: "Heat Mapping", status: "online" },
  { id: 12, zone: "Product Area E", activity: "Tracking Dwell Time", status: "online" },
  { id: 13, zone: "Product Area F", activity: "Detecting Demography", status: "online" },
  { id: 14, zone: "Staff Area", activity: "Staff Monitoring", status: "online" },
  { id: 15, zone: "Exit 1", activity: "Counting Visitors", status: "online" },
  { id: 16, zone: "Exit 2", activity: "Counting Visitors", status: "online" },
]

const zones = [
  "Entrance 1",
  "Entrance 2",
  "Product Area A",
  "Product Area B",
  "Product Area C",
  "Cashier 1",
  "Cashier 2",
  "Cashier 3",
  "Inventory A",
  "Inventory B",
  "Product Area D",
  "Product Area E",
  "Product Area F",
  "Staff Area",
  "Exit 1",
  "Exit 2",
]

export default function CameraGrid() {
  const [cameraData, setCameraData] = useState(cameras)

  const handleZoneChange = (id: number, zone: string) => {
    setCameraData((prev) => prev.map((camera) => (camera.id === id ? { ...camera, zone } : camera)))
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {cameraData.map((camera) => (
        <Card key={camera.id} className={cn("overflow-hidden", camera.status === "offline" && "opacity-60")}>
          <div className="relative aspect-video bg-muted">
            <Image
              src={`/placeholder.svg?height=180&width=320&text=Camera+${camera.id}`}
              alt={`Camera ${camera.id}`}
              fill
              className="object-cover"
            />
            <Badge className={cn("absolute top-2 right-2", camera.status === "online" ? "bg-green-500" : "bg-red-500")}>
              {camera.status}
            </Badge>
          </div>
          <CardContent className="p-3">
            <div className="flex flex-col space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-sm">{camera.zone}</h3>
                <span className="text-xs text-muted-foreground">ID: {camera.id}</span>
              </div>
              <p className="text-xs text-muted-foreground">{camera.activity}</p>
              <Select defaultValue={camera.zone} onValueChange={(value) => handleZoneChange(camera.id, value)}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue placeholder="Assign Zone" />
                </SelectTrigger>
                <SelectContent>
                  {zones.map((zone) => (
                    <SelectItem key={zone} value={zone} className="text-xs">
                      {zone}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
