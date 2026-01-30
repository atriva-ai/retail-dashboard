"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { toast } from "sonner"
import { useSettings, Settings } from "@/hooks/use-settings"

export default function GeneralSettings() {
  const { settings, loading, error, updateSettings, saveChanges, hasPendingChanges } = useSettings()
  const [isSaving, setIsSaving] = useState(false)

  if (loading) return <div>Loading settings...</div>
  if (error) return <div>Error loading settings: {error.message}</div>
  if (!settings) return <div>No settings found</div>

  const handleSave = async () => {
    try {
      setIsSaving(true)
      await saveChanges()
      toast.success("Settings saved successfully")
    } catch (err) {
      console.error("Error saving settings:", err)
      toast.error("Failed to save settings")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>General Settings</CardTitle>
          <CardDescription>Configure your store settings and preferences</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="store-name">Store Name</Label>
            <Input
              id="store-name"
              value={settings.store_name}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                updateSettings({ store_name: e.target.value })}
              placeholder="Enter your store name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="store-description">Store Description</Label>
            <Textarea
              id="store-description"
              value={settings.store_description || ""}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => 
                updateSettings({ store_description: e.target.value })}
              placeholder="Enter your store description"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="timezone">Timezone</Label>
            <Select
              value={settings.store_timezone}
              onValueChange={(value: string) => 
                updateSettings({ store_timezone: value })}
            >
              <SelectTrigger id="timezone">
                <SelectValue placeholder="Select timezone" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="UTC">UTC</SelectItem>
                <SelectItem value="America/New_York">Eastern Time</SelectItem>
                <SelectItem value="America/Chicago">Central Time</SelectItem>
                <SelectItem value="America/Denver">Mountain Time</SelectItem>
                <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="language">Language</Label>
            <Select
              value={settings.store_language}
              onValueChange={(value: string) => 
                updateSettings({ store_language: value })}
            >
              <SelectTrigger id="language">
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="es">Spanish</SelectItem>
                <SelectItem value="fr">French</SelectItem>
                <SelectItem value="de">German</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="theme">Theme</Label>
            <Select
              value={settings.store_theme}
              onValueChange={(value: string) => 
                updateSettings({ store_theme: value })}
            >
              <SelectTrigger id="theme">
                <SelectValue placeholder="Select theme" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">Light</SelectItem>
                <SelectItem value="dark">Dark</SelectItem>
                <SelectItem value="system">System</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="notifications" className="font-normal">
                Enable Notifications
              </Label>
              <p className="text-xs text-muted-foreground">
                Enable or disable store notifications
              </p>
            </div>
            <Switch
              id="notifications"
              checked={settings.store_notifications_enabled}
              onCheckedChange={(checked: boolean) =>
                updateSettings({ store_notifications_enabled: checked })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="analytics" className="font-normal">
                Enable Analytics
              </Label>
              <p className="text-xs text-muted-foreground">
                Enable or disable store analytics
              </p>
            </div>
            <Switch
              id="analytics"
              checked={settings.store_analytics_enabled}
              onCheckedChange={(checked: boolean) =>
                updateSettings({ store_analytics_enabled: checked })
              }
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>AI Inference Settings</CardTitle>
          <CardDescription>Configure AI person detection settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="person-detection-default" className="font-normal">
                Person Detection Enabled by Default
              </Label>
              <p className="text-xs text-muted-foreground">
                Enable person detection by default for new cameras
              </p>
            </div>
            <Switch
              id="person-detection-default"
              checked={settings.person_detection_enabled_by_default ?? true}
              onCheckedChange={(checked: boolean) =>
                updateSettings({ person_detection_enabled_by_default: checked })
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="ai-inference-fps">AI Inference FPS</Label>
            <Select
              value={String(settings.ai_inference_fps ?? 5)}
              onValueChange={(value: string) => 
                updateSettings({ ai_inference_fps: parseFloat(value) })}
            >
              <SelectTrigger id="ai-inference-fps">
                <SelectValue placeholder="Select FPS" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 FPS</SelectItem>
                <SelectItem value="2">2 FPS</SelectItem>
                <SelectItem value="5">5 FPS (Default)</SelectItem>
                <SelectItem value="10">10 FPS</SelectItem>
                <SelectItem value="15">15 FPS</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Target frames per second for AI person detection inference. Higher FPS provides more frequent detection but uses more resources.
            </p>
          </div>

          <div className="flex justify-end">
            <Button 
              onClick={handleSave} 
              disabled={!hasPendingChanges || isSaving}
            >
              {isSaving ? "Saving..." : hasPendingChanges ? "Save Changes" : "No Changes"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
