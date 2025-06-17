'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import CameraGrid from "@/components/camera-grid"

export default function CamerasPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Live Cameras</h2>
        <div className="flex items-center space-x-2">
          <Tabs defaultValue="all" className="w-[300px]">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="entrance">Entrance</TabsTrigger>
              <TabsTrigger value="product">Product</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Camera Feeds</CardTitle>
          <CardDescription>Viewing 16 cameras across all store zones</CardDescription>
        </CardHeader>
        <CardContent>
          <CameraGrid />
        </CardContent>
      </Card>
    </div>
  )
}
