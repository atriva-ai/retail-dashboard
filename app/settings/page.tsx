'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import CameraSettings from "@/components/settings/camera-settings"
import AnalyticsEnginesSettings from "@/components/settings/analytics-engines-settings"
import AlertEnginesSettings from "@/components/settings/alert-engines-settings"
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
          <TabsTrigger value="alerts">Alert Engines</TabsTrigger>
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
              <AnalyticsEnginesSettings />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Alert Engine Configuration</CardTitle>
              <CardDescription>Configure alert engines for real-time monitoring and notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <AlertEnginesSettings />
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
