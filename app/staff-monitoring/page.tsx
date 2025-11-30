import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { StaffServiceTime } from "@/components/staff-monitoring"
import { QueueLength } from "@/components/dashboard"
import { InventoryActivity } from "@/components/product-analytics"

export default function StaffMonitoringPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Staff Monitoring</h2>
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

      <div className="flex flex-col md:flex-row gap-4 items-center">
        <div className="w-full md:w-1/2">
          <Select defaultValue="all-staff">
            <SelectTrigger>
              <SelectValue placeholder="Select Staff Zone" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all-staff">All Staff Zones</SelectItem>
              <SelectItem value="cashier">Cashier Area</SelectItem>
              <SelectItem value="inventory">Inventory Area</SelectItem>
              <SelectItem value="customer-service">Customer Service</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="w-full md:w-1/2">
          <Select defaultValue="all-day">
            <SelectTrigger>
              <SelectValue placeholder="Select Time" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all-day">All Day</SelectItem>
              <SelectItem value="morning">Morning (8AM-12PM)</SelectItem>
              <SelectItem value="afternoon">Afternoon (12PM-5PM)</SelectItem>
              <SelectItem value="evening">Evening (5PM-9PM)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="col-span-full">
          <CardHeader>
            <CardTitle>Average Service Time</CardTitle>
            <CardDescription>Average time spent servicing customers per hour</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <StaffServiceTime />
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Queue Length</CardTitle>
            <CardDescription>Average queue length at checkout throughout the day</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <QueueLength />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Inventory Activity</CardTitle>
            <CardDescription>Staff activity in inventory areas</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <InventoryActivity />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
