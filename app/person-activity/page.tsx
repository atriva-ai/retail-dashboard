import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import PersonJourneyMap from "@/components/person-journey-map"
import PersonDemographics from "@/components/person-demographics"
import EntryExitTracking from "@/components/entry-exit-tracking"

export default function PersonActivityPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Person Activity</h2>
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
        <div className="w-full md:w-1/3">
          <Select defaultValue="all">
            <SelectTrigger>
              <SelectValue placeholder="Select Time" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Day</SelectItem>
              <SelectItem value="morning">Morning (8AM-12PM)</SelectItem>
              <SelectItem value="afternoon">Afternoon (12PM-5PM)</SelectItem>
              <SelectItem value="evening">Evening (5PM-9PM)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="w-full md:w-1/3">
          <Select defaultValue="all-zones">
            <SelectTrigger>
              <SelectValue placeholder="Select Zone" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all-zones">All Zones</SelectItem>
              <SelectItem value="entrance">Entrance</SelectItem>
              <SelectItem value="product">Product Areas</SelectItem>
              <SelectItem value="checkout">Checkout</SelectItem>
              <SelectItem value="exit">Exit</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="w-full md:w-1/3">
          <Select defaultValue="all-visitors">
            <SelectTrigger>
              <SelectValue placeholder="Visitor Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all-visitors">All Visitors</SelectItem>
              <SelectItem value="solo">Solo</SelectItem>
              <SelectItem value="family">Family</SelectItem>
              <SelectItem value="stroller">With Stroller</SelectItem>
              <SelectItem value="elderly">Elderly</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="col-span-full">
          <CardHeader>
            <CardTitle>Customer Journey Tracking</CardTitle>
            <CardDescription>Visual journey of customers through the store</CardDescription>
          </CardHeader>
          <CardContent className="h-[400px]">
            <PersonJourneyMap />
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Entry/Exit Tracking</CardTitle>
            <CardDescription>Hourly entry and exit patterns</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <EntryExitTracking />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Demographics</CardTitle>
            <CardDescription>Visitor demographics breakdown</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <PersonDemographics />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
