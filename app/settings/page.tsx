'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import CameraSettings from "@/components/settings/camera-settings"
import AnalyticsSettings from "@/components/settings/analytics-settings"
import ZoneSettings from "@/components/settings/zone-settings"
import GeneralSettings from "@/components/settings/general-settings"

export default function SettingsPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
      </div>

      <Tabs defaultValue="cameras" className="space-y-4">
        <TabsList>
          <TabsTrigger value="cameras">Cameras</TabsTrigger>
          <TabsTrigger value="analytics">Analytics Engines</TabsTrigger>
          <TabsTrigger value="zones">Zones</TabsTrigger>
          <TabsTrigger value="general">General</TabsTrigger>
        </TabsList>

        <TabsContent value="cameras" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Camera Configuration</CardTitle>
              <CardDescription>Add, edit, and configure cameras across your store</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <CameraSettings />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Analytics Engine Configuration</CardTitle>
              <CardDescription>Configure analytics engines and detection parameters</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <AnalyticsSettings />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="zones" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Zone Configuration</CardTitle>
              <CardDescription>Create and manage zones for analytics and monitoring</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <ZoneSettings />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>Configure system-wide settings and preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <GeneralSettings />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
