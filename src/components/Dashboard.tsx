
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  Package, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  ShoppingCart, 
  Archive,
  AlertTriangle,
  CheckCircle,
  Clock,
  BarChart3
} from "lucide-react";

const Dashboard = () => {
  // Mock data for demonstration
  const kpiData = [
    {
      title: "Total Products",
      value: "2,847",
      change: "+12.5%",
      trend: "up",
      icon: Package,
      color: "text-blue-600",
      bgColor: "bg-blue-100"
    },
    {
      title: "Low Stock Items",
      value: "23",
      change: "-8.2%",
      trend: "down",
      icon: AlertTriangle,
      color: "text-orange-600",
      bgColor: "bg-orange-100"
    },
    {
      title: "Pending Orders",
      value: "156",
      change: "+15.3%",
      trend: "up",
      icon: Clock,
      color: "text-purple-600",
      bgColor: "bg-purple-100"
    },
    {
      title: "Active Users",
      value: "42",
      change: "+2.1%",
      trend: "up",
      icon: Users,
      color: "text-green-600",
      bgColor: "bg-green-100"
    }
  ];

  const recentTransactions = [
    { id: "GRN-001", type: "Goods Receipt", amount: "₹45,230", status: "Completed", time: "2 hours ago" },
    { id: "SO-156", type: "Sales Order", amount: "₹23,450", status: "Processing", time: "4 hours ago" },
    { id: "PO-789", type: "Purchase Order", amount: "₹67,890", status: "Pending", time: "6 hours ago" },
    { id: "ST-045", type: "Stock Transfer", amount: "₹12,340", status: "Completed", time: "8 hours ago" },
  ];

  const warehouseStatus = [
    { name: "Main Warehouse", capacity: 85, available: "850 sq ft", status: "High" },
    { name: "Secondary Storage", capacity: 62, available: "1,200 sq ft", status: "Medium" },
    { name: "Cold Storage", capacity: 94, available: "150 sq ft", status: "Critical" },
  ];

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpiData.map((kpi) => (
          <Card key={kpi.title} className="border-0 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">{kpi.title}</p>
                  <p className="text-2xl font-bold text-slate-900 mt-1">{kpi.value}</p>
                  <div className="flex items-center mt-2">
                    {kpi.trend === "up" ? (
                      <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-red-600 mr-1" />
                    )}
                    <span className={`text-sm ${kpi.trend === "up" ? "text-green-600" : "text-red-600"}`}>
                      {kpi.change}
                    </span>
                  </div>
                </div>
                <div className={`p-3 rounded-lg ${kpi.bgColor}`}>
                  <kpi.icon className={`h-6 w-6 ${kpi.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Transactions */}
        <Card className="lg:col-span-2 border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="h-5 w-5 mr-2" />
              Recent Transactions
            </CardTitle>
            <CardDescription>Latest warehouse activities and transactions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentTransactions.map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-white rounded-lg">
                      <Archive className="h-4 w-4 text-slate-600" />
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">{transaction.id}</p>
                      <p className="text-sm text-slate-600">{transaction.type}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-slate-900">{transaction.amount}</p>
                    <div className="flex items-center space-x-2">
                      <Badge 
                        variant={transaction.status === "Completed" ? "default" : 
                                transaction.status === "Processing" ? "secondary" : "outline"}
                        className="text-xs"
                      >
                        {transaction.status}
                      </Badge>
                      <span className="text-xs text-slate-500">{transaction.time}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <Button variant="outline" className="w-full mt-4">
              View All Transactions
            </Button>
          </CardContent>
        </Card>

        {/* Warehouse Status */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Package className="h-5 w-5 mr-2" />
              Warehouse Status
            </CardTitle>
            <CardDescription>Current capacity and availability</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {warehouseStatus.map((warehouse) => (
              <div key={warehouse.name} className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="font-medium text-slate-900">{warehouse.name}</p>
                  <Badge 
                    variant={warehouse.status === "Critical" ? "destructive" : 
                            warehouse.status === "High" ? "secondary" : "outline"}
                    className="text-xs"
                  >
                    {warehouse.status}
                  </Badge>
                </div>
                <Progress value={warehouse.capacity} className="h-2" />
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600">{warehouse.capacity}% used</span>
                  <span className="text-slate-600">{warehouse.available} available</span>
                </div>
              </div>
            ))}
            <Button variant="outline" className="w-full mt-4">
              Manage Warehouses
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Frequently used warehouse operations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            <Button variant="outline" className="h-20 flex flex-col space-y-2">
              <Package className="h-5 w-5" />
              <span className="text-xs">Add Product</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col space-y-2">
              <ShoppingCart className="h-5 w-5" />
              <span className="text-xs">Create Order</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col space-y-2">
              <Archive className="h-5 w-5" />
              <span className="text-xs">Stock Entry</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col space-y-2">
              <Users className="h-5 w-5" />
              <span className="text-xs">Add Customer</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col space-y-2">
              <BarChart3 className="h-5 w-5" />
              <span className="text-xs">View Reports</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col space-y-2">
              <CheckCircle className="h-5 w-5" />
              <span className="text-xs">Audit Trail</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
