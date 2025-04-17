"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertCircle, BarChart } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface AnalyticsEngine {
  id: string
  name: string
  enabled: boolean
  sensitivity: number
  processingMode: "real-time" | "batch" | "hybrid"
}

const initialEngines: AnalyticsEngine[] = [
  {
    id: "people-counting",
    name: "People Counting",
    enabled: true,
    sensitivity: 75,
    processingMode: "real-time",
  },
  {
    id: "dwell-time",
    name: "Dwell Time Analysis",
    enabled: true,
    sensitivity: 65,
    processingMode: "hybrid",
  },
  {
    id: "heatmap",
    name: "Traffic Heatmap",
    enabled: true,
    sensitivity: 60,
    processingMode: "batch",
  },
  {
    id: "demographics",
    name: "Demographics Analysis",
    enabled: true,
    sensitivity: 70,
    processingMode: "hybrid",
  },
  {
    id: "queue-management",
    name: "Queue Management",
    enabled: true,
    sensitivity: 80,
    processingMode: "real-time",
  },
  {
    id: "staff-monitoring",
    name: "Staff Activity",
    enabled: true,
    sensitivity: 65,
    processingMode: "real-time",
  },
]

export default function AnalyticsSettings() {
  const [engines, setEngines] = useState<AnalyticsEngine[]>(initialEngines)
  const [dataRetention, setDataRetention] = useState("90")
  const [processingPower, setProcessingPower] = useState(70)
  const [alertThreshold, setAlertThreshold] = useState("5")

  const handleEngineToggle = (id: string) => {
    setEngines(engines.map((engine) => (engine.id === id ? { ...engine, enabled: !engine.enabled } : engine)))
  }

  const handleSensitivityChange = (id: string, value: number[]) => {
    setEngines(engines.map((engine) => (engine.id === id ? { ...engine, sensitivity: value[0] } : engine)))
  }

  const handleProcessingModeChange = (id: string, value: "real-time" | "batch" | "hybrid") => {
    setEngines(engines.map((engine) => (engine.id === id ? { ...engine, processingMode: value } : engine)))
  }

  return (
    <div className="space-y-6">
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Analytics Engine Configuration</AlertTitle>
        <AlertDescription>
          Changes to analytics engines may affect system performance and data collection. Adjust settings carefully
          based on your store's needs.
        </AlertDescription>
      </Alert>

      <Tabs defaultValue="engines" className="space-y-4">
        <TabsList>
          <TabsTrigger value="engines">Analytics Engines</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="alerts">Alerts & Thresholds</TabsTrigger>
        </TabsList>

        <TabsContent value="engines" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {engines.map((engine) => (
              <Card key={engine.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{engine.name}</CardTitle>
                    <Switch checked={engine.enabled} onCheckedChange={() => handleEngineToggle(engine.id)} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <Label>Sensitivity</Label>
                        <span className="text-sm">{engine.sensitivity}%</span>
                      </div>
                      <Slider
                        disabled={!engine.enabled}
                        value={[engine.sensitivity]}
                        min={0}
                        max={100}
                        step={5}
                        onValueChange={(value) => handleSensitivityChange(engine.id, value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Processing Mode</Label>
                      <Select
                        disabled={!engine.enabled}
                        value={engine.processingMode}
                        onValueChange={(value: "real-time" | "batch" | "hybrid") =>
                          handleProcessingModeChange(engine.id, value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select processing mode" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="real-time">Real-time</SelectItem>
                          <SelectItem value="batch">Batch</SelectItem>
                          <SelectItem value="hybrid">Hybrid</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Performance Settings</CardTitle>
              <CardDescription>Configure how analytics engines utilize system resources</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label>Processing Power Allocation</Label>
                  <span className="text-sm">{processingPower}%</span>
                </div>
                <Slider
                  value={[processingPower]}
                  min={10}
                  max={90}
                  step={10}
                  onValueChange={(value) => setProcessingPower(value[0])}
                />
                <p className="text-sm text-muted-foreground">
                  Higher values improve analytics accuracy but may impact system responsiveness
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="data-retention">Data Retention Period (days)</Label>
                <Input
                  id="data-retention"
                  type="number"
                  value={dataRetention}
                  onChange={(e) => setDataRetention(e.target.value)}
                />
                <p className="text-sm text-muted-foreground">
                  How long to keep detailed analytics data before aggregation
                </p>
              </div>

              <div className="space-y-2">
                <Label>Processing Schedule</Label>
                <Select defaultValue="always">
                  <SelectTrigger>
                    <SelectValue placeholder="Select schedule" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="always">Always On</SelectItem>
                    <SelectItem value="business-hours">Business Hours Only</SelectItem>
                    <SelectItem value="custom">Custom Schedule</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Alert Configuration</CardTitle>
              <CardDescription>Configure thresholds for system alerts and notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="queue-threshold">Queue Length Alert Threshold</Label>
                <Input
                  id="queue-threshold"
                  type="number"
                  value={alertThreshold}
                  onChange={(e) => setAlertThreshold(e.target.value)}
                />
                <p className="text-sm text-muted-foreground">Number of customers in queue before triggering an alert</p>
              </div>

              <div className="space-y-2">
                <Label>Alert Recipients</Label>
                <Select defaultValue="manager">
                  <SelectTrigger>
                    <SelectValue placeholder="Select recipients" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="manager">Store Manager</SelectItem>
                    <SelectItem value="all-staff">All Staff</SelectItem>
                    <SelectItem value="custom">Custom Group</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <Switch id="email-alerts" defaultChecked />
                <Label htmlFor="email-alerts">Email Alerts</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch id="sms-alerts" />
                <Label htmlFor="sms-alerts">SMS Alerts</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch id="dashboard-alerts" defaultChecked />
                <Label htmlFor="dashboard-alerts">Dashboard Alerts</Label>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="bg-muted p-4 rounded-md">
        <div className="flex items-start space-x-3">
          <BarChart className="h-5 w-5 mt-0.5 text-muted-foreground" />
          <div>
            <h4 className="font-medium">Analytics Engine Tips</h4>
            <ul className="text-sm text-muted-foreground mt-1 list-disc pl-4 space-y-1">
              <li>Higher sensitivity may increase false positives</li>
              <li>Real-time processing provides immediate insights but uses more resources</li>
              <li>Batch processing is more efficient but introduces data delays</li>
              <li>Balance processing power with system performance needs</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
