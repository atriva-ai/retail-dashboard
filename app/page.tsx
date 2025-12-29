"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, ArrowDown, ArrowUp, Clock, Users, UserCheck, TrendingUp } from "lucide-react"
import { ChartWrapper } from "@/components/ui/chart"
import { DashboardChart, ZoneEngagement } from "@/components/dashboard"
import { CameraStatusTable } from "@/components/cameras"

export default function Dashboard() {
  const [timeFilter, setTimeFilter] = useState<"today" | "week" | "month">("today")

  // Calculate values based on filter (only for Total Visitors and Average Dwell Time)
  const getTotalVisitors = () => {
    switch (timeFilter) {
      case "today":
        return "1,248"
      case "week":
        return "8,456"
      case "month":
        return "34,892"
      default:
        return "1,248"
    }
  }

  const getAverageDwellTime = () => {
    switch (timeFilter) {
      case "today":
        return "8m 24s"
      case "week":
        return "9m 12s"
      case "month":
        return "8m 45s"
      default:
        return "8m 24s"
    }
  }

  const getDwellTimeChange = () => {
    switch (timeFilter) {
      case "today":
        return { value: "-2.1%", isPositive: false }
      case "week":
        return { value: "+5.3%", isPositive: true }
      case "month":
        return { value: "+1.8%", isPositive: true }
      default:
        return { value: "-2.1%", isPositive: false }
    }
  }

  const getVisitorsChange = () => {
    switch (timeFilter) {
      case "today":
        return { value: "+12.5%", isPositive: true }
      case "week":
        return { value: "+8.2%", isPositive: true }
      case "month":
        return { value: "+15.7%", isPositive: true }
      default:
        return { value: "+12.5%", isPositive: true }
    }
  }

  const dwellTimeChange = getDwellTimeChange()
  const visitorsChange = getVisitorsChange()

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <div className="flex items-center space-x-2">
          <Tabs value={timeFilter} onValueChange={(value) => setTimeFilter(value as "today" | "week" | "month")} className="w-[300px]">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="today">Today</TabsTrigger>
              <TabsTrigger value="week">Week</TabsTrigger>
              <TabsTrigger value="month">Month</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Occupancy</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">142</div>
            <p className="text-xs text-muted-foreground">
              People currently in store
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Visitors</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getTotalVisitors()}</div>
            <p className="text-xs text-muted-foreground">
              <span className={`flex items-center ${visitorsChange.isPositive ? "text-green-500" : "text-red-500"}`}>
                {visitorsChange.isPositive ? <ArrowUp className="mr-1 h-4 w-4" /> : <ArrowDown className="mr-1 h-4 w-4" />}
                {visitorsChange.value} from previous period
              </span>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Dwell Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getAverageDwellTime()}</div>
            <p className="text-xs text-muted-foreground">
              <span className={`flex items-center ${dwellTimeChange.isPositive ? "text-green-500" : "text-red-500"}`}>
                {dwellTimeChange.isPositive ? <ArrowUp className="mr-1 h-4 w-4" /> : <ArrowDown className="mr-1 h-4 w-4" />}
                {dwellTimeChange.value} from previous period
              </span>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Peak Hour (Today)</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2:00 PM</div>
            <p className="text-xs text-muted-foreground">
              245 visitors during peak
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Visitors Over Time</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <ChartWrapper className="h-[300px]" title="Visitors Over Time">
              <DashboardChart />
            </ChartWrapper>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Zone Engagement</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <ChartWrapper className="h-[300px]" title="Zone Engagement">
              <ZoneEngagement />
            </ChartWrapper>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 grid-cols-1">
        <Card>
          <CardHeader>
            <CardTitle>Camera Status</CardTitle>
          </CardHeader>
          <CardContent>
            <CameraStatusTable />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 grid-cols-1">
        <Card>
          <CardHeader>
            <CardTitle>Recent Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Queue Congestion</AlertTitle>
                <AlertDescription>
                  Checkout area has 8+ customers waiting. Consider opening additional registers.
                </AlertDescription>
              </Alert>

              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Camera Offline</AlertTitle>
                <AlertDescription>Camera in "Electronics Section" has been offline for 15 minutes.</AlertDescription>
              </Alert>

              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>High Traffic Alert</AlertTitle>
                <AlertDescription>
                  Entrance 2 is experiencing 35% higher traffic than normal for this time.
                </AlertDescription>
              </Alert>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
