import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
<<<<<<< HEAD
import { AlertCircle, ArrowDown, ArrowUp, Clock, Package, ShoppingCart, Users } from "lucide-react"
=======
import { AlertCircle, ArrowDown, ArrowUp, Clock, Users } from "lucide-react"
>>>>>>> origin/main
import { ChartWrapper } from "@/components/ui/chart"
import { DashboardChart } from "@/components/dashboard"
import { CameraStatusGrid, CameraStatusHeader } from "@/components/cameras"

export default function Dashboard() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <div className="flex items-center space-x-2">
          <Tabs defaultValue="today" className="w-[300px]">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="today">Today</TabsTrigger>
              <TabsTrigger value="week">Week</TabsTrigger>
              <TabsTrigger value="month">Month</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

<<<<<<< HEAD
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
=======
      <div className="grid gap-4 md:grid-cols-2">
>>>>>>> origin/main
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Foot Traffic</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,248</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-500 flex items-center">
                <ArrowUp className="mr-1 h-4 w-4" />
                +12.5% from yesterday
              </span>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Dwell Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8m 24s</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-red-500 flex items-center">
                <ArrowDown className="mr-1 h-4 w-4" />
                -2.1% from yesterday
              </span>
            </p>
          </CardContent>
        </Card>
<<<<<<< HEAD

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Staff Efficiency</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">92%</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-500 flex items-center">
                <ArrowUp className="mr-1 h-4 w-4" />
                +4.3% from yesterday
              </span>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inventory Activity</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">37</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-muted-foreground flex items-center">+2 events in last hour</span>
            </p>
          </CardContent>
        </Card>
=======
>>>>>>> origin/main
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Hourly Traffic</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <ChartWrapper className="h-[300px]" title="Hourly Traffic">
              <DashboardChart />
            </ChartWrapper>
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Camera Status</CardTitle>
            <CardDescription><CameraStatusHeader /></CardDescription>
          </CardHeader>
          <CardContent>
            <CameraStatusGrid />
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
