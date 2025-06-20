'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CameraGrid } from "@/components/cameras"

export default function CamerasPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Live Cameras</h2>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Camera Feeds</CardTitle>
        </CardHeader>
        <CardContent>
          <CameraGrid />
        </CardContent>
      </Card>
    </div>
  )
}
