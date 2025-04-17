import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import ProductHeatmap from "@/components/product-heatmap"
import ProductDwellTime from "@/components/product-dwell-time"
import ProductComparison from "@/components/product-comparison"

export default function ProductAnalyticsPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Product Analytics</h2>
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
              <SelectValue placeholder="Select Zone" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Zones</SelectItem>
              <SelectItem value="product-a">Product Area A</SelectItem>
              <SelectItem value="product-b">Product Area B</SelectItem>
              <SelectItem value="product-c">Product Area C</SelectItem>
              <SelectItem value="product-d">Product Area D</SelectItem>
              <SelectItem value="product-e">Product Area E</SelectItem>
              <SelectItem value="product-f">Product Area F</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="w-full md:w-1/3">
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

        <div className="w-full md:w-1/3">
          <Select defaultValue="all-metrics">
            <SelectTrigger>
              <SelectValue placeholder="Select Metric" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all-metrics">All Metrics</SelectItem>
              <SelectItem value="traffic">Traffic Density</SelectItem>
              <SelectItem value="dwell">Dwell Time</SelectItem>
              <SelectItem value="conversion">Conversion Rate</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="col-span-full">
          <CardHeader>
            <CardTitle>Traffic Density Heatmap</CardTitle>
            <CardDescription>Showing traffic density across all product zones</CardDescription>
          </CardHeader>
          <CardContent className="h-[400px]">
            <ProductHeatmap />
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Dwell Time by Zone</CardTitle>
            <CardDescription>Average time spent in each product zone</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ProductDwellTime />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Zone Comparison</CardTitle>
            <CardDescription>Visitor population by zone</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ProductComparison />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
