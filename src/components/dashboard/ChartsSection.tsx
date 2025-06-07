
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";

const ChartsSection = () => {
  // Mock data for charts
  const salesTrendData = [
    { month: "Jan", sales: 45000, purchases: 32000 },
    { month: "Feb", sales: 52000, purchases: 35000 },
    { month: "Mar", sales: 48000, purchases: 38000 },
    { month: "Apr", sales: 61000, purchases: 42000 },
    { month: "May", sales: 55000, purchases: 39000 },
    { month: "Jun", sales: 67000, purchases: 45000 },
  ];

  const revenueComparisonData = [
    { month: "Jan", current: 45000, previous: 38000 },
    { month: "Feb", current: 52000, previous: 42000 },
    { month: "Mar", current: 48000, previous: 45000 },
    { month: "Apr", current: 61000, previous: 52000 },
    { month: "May", current: 55000, previous: 48000 },
    { month: "Jun", current: 67000, previous: 55000 },
  ];

  const topMovingItems = [
    { item: "Men's T-Shirt", quantity: 245 },
    { item: "Women's Jeans", quantity: 198 },
    { item: "Sneakers", quantity: 176 },
    { item: "Hoodies", quantity: 154 },
    { item: "Casual Shirts", quantity: 132 },
  ];

  const customerDistribution = [
    { name: "Retail", value: 45, color: "#2563EB" },
    { name: "Wholesale", value: 30, color: "#10B981" },
    { name: "Online", value: 25, color: "#F59E0B" },
  ];

  const chartConfig = {
    sales: { label: "Sales", color: "#2563EB" },
    purchases: { label: "Purchases", color: "#10B981" },
    current: { label: "Current Year", color: "#2563EB" },
    previous: { label: "Previous Year", color: "#64748B" },
  };

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      {/* Sales vs Purchase Trend */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Sales vs Purchase Trend</CardTitle>
          <CardDescription>6-month comparison of sales and purchase amounts</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={salesTrendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line 
                  type="monotone" 
                  dataKey="sales" 
                  stroke="#2563EB" 
                  strokeWidth={2}
                  dot={{ fill: "#2563EB", strokeWidth: 2 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="purchases" 
                  stroke="#10B981" 
                  strokeWidth={2}
                  dot={{ fill: "#10B981", strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Monthly Revenue Comparison */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Monthly Revenue Comparison</CardTitle>
          <CardDescription>Current year vs previous year revenue</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueComparisonData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="current" fill="#2563EB" radius={[4, 4, 0, 0]} />
                <Bar dataKey="previous" fill="#64748B" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Top Moving Items */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Top Moving Items</CardTitle>
          <CardDescription>Best selling products this month</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {topMovingItems.map((item, index) => (
              <div key={item.item} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                    <span className="text-sm font-medium text-blue-600">{index + 1}</span>
                  </div>
                  <span className="font-medium text-slate-900">{item.item}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-slate-900">{item.quantity}</span>
                  <div className="w-20 h-2 bg-slate-200 rounded-full">
                    <div 
                      className="h-2 bg-blue-600 rounded-full"
                      style={{ width: `${(item.quantity / 250) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Customer Revenue Distribution */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Customer Revenue Distribution</CardTitle>
          <CardDescription>Revenue breakdown by customer type</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={customerDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {customerDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <ChartTooltip 
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-white p-2 border rounded shadow">
                          <p className="font-medium">{payload[0].payload.name}</p>
                          <p className="text-sm">{payload[0].value}%</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </ChartContainer>
          <div className="flex justify-center space-x-4 mt-4">
            {customerDistribution.map((item) => (
              <div key={item.name} className="flex items-center space-x-2">
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-sm text-slate-600">{item.name} ({item.value}%)</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ChartsSection;
