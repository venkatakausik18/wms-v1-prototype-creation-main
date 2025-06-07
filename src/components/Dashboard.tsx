
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  BarChart3,
  DollarSign,
  Wallet,
  CreditCard,
  Percent
} from "lucide-react";
import KPICard from "./dashboard/KPICard";
import ChartsSection from "./dashboard/ChartsSection";
import AlertsPanel from "./dashboard/AlertsPanel";

const Dashboard = () => {
  // Primary KPIs data
  const primaryKPIs = [
    {
      title: "Today's Sales Revenue",
      value: "₹2,45,678",
      change: "+12.5%",
      trend: "up" as const,
      icon: DollarSign,
      color: "text-green-600",
      bgColor: "bg-green-100",
      subtitle: "vs yesterday ₹2,18,340"
    },
    {
      title: "Current Stock Value",
      value: "₹45,67,890",
      change: "+3.2%",
      trend: "up" as const,
      icon: Package,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
      subtitle: "across all warehouses"
    },
    {
      title: "Pending Orders",
      value: "156",
      change: "+15.3%",
      trend: "up" as const,
      icon: Clock,
      color: "text-orange-600",
      bgColor: "bg-orange-100",
      badge: { text: "23 Urgent", variant: "destructive" as const }
    },
    {
      title: "Cash + Bank Balance",
      value: "₹12,34,567",
      change: "-5.1%",
      trend: "down" as const,
      icon: Wallet,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
      subtitle: "Cash: ₹2,34,567 | Bank: ₹10,00,000"
    }
  ];

  // Secondary KPIs data
  const secondaryKPIs = [
    {
      title: "Today's Purchase Amount",
      value: "₹1,23,456",
      change: "+8.7%",
      trend: "up" as const,
      icon: ShoppingCart,
      color: "text-indigo-600",
      bgColor: "bg-indigo-100"
    },
    {
      title: "Low Stock Alerts",
      value: "23",
      change: "-12.0%",
      trend: "down" as const,
      icon: AlertTriangle,
      color: "text-red-600",
      bgColor: "bg-red-100",
      badge: { text: "5 Critical", variant: "destructive" as const }
    },
    {
      title: "Overdue Payments",
      value: "₹89,456",
      change: "+23.1%",
      trend: "up" as const,
      icon: CreditCard,
      color: "text-yellow-600",
      bgColor: "bg-yellow-100",
      subtitle: "32 invoices pending"
    },
    {
      title: "Profit Margin",
      value: "18.5%",
      change: "+2.3%",
      trend: "up" as const,
      icon: Percent,
      color: "text-emerald-600",
      bgColor: "bg-emerald-100",
      subtitle: "Monthly average"
    }
  ];

  const recentTransactions = [
    { id: "GRN-001", type: "Goods Receipt", amount: "₹45,230", status: "Completed", time: "2 hours ago" },
    { id: "SO-156", type: "Sales Order", amount: "₹23,450", status: "Processing", time: "4 hours ago" },
    { id: "PO-789", type: "Purchase Order", amount: "₹67,890", status: "Pending", time: "6 hours ago" },
    { id: "ST-045", type: "Stock Transfer", amount: "₹12,340", status: "Completed", time: "8 hours ago" },
  ];

  return (
    <div className="space-y-8">
      {/* Primary KPIs */}
      <div>
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Key Performance Indicators</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {primaryKPIs.map((kpi, index) => (
            <KPICard key={index} {...kpi} />
          ))}
        </div>
      </div>

      {/* Secondary KPIs */}
      <div>
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Business Metrics</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {secondaryKPIs.map((kpi, index) => (
            <KPICard key={index} {...kpi} />
          ))}
        </div>
      </div>

      {/* Charts & Analytics Section */}
      <div>
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Analytics & Insights</h2>
        <ChartsSection />
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
                <div key={transaction.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-white rounded-lg shadow-sm">
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

        {/* Alerts Panel */}
        <AlertsPanel />
      </div>

      {/* Quick Actions */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Frequently used warehouse operations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            <Button variant="outline" className="h-20 flex flex-col space-y-2 hover:bg-blue-50 hover:border-blue-200">
              <Package className="h-5 w-5" />
              <span className="text-xs">Add Product</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col space-y-2 hover:bg-green-50 hover:border-green-200">
              <ShoppingCart className="h-5 w-5" />
              <span className="text-xs">Create Order</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col space-y-2 hover:bg-purple-50 hover:border-purple-200">
              <Archive className="h-5 w-5" />
              <span className="text-xs">Stock Entry</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col space-y-2 hover:bg-orange-50 hover:border-orange-200">
              <Users className="h-5 w-5" />
              <span className="text-xs">Add Customer</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col space-y-2 hover:bg-indigo-50 hover:border-indigo-200">
              <BarChart3 className="h-5 w-5" />
              <span className="text-xs">View Reports</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col space-y-2 hover:bg-emerald-50 hover:border-emerald-200">
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
