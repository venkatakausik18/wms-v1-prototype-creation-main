
import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Package, 
  ArrowUp, 
  ArrowDown, 
  RefreshCw, 
  Calculator,
  FileText,
  TrendingUp,
  TrendingDown,
  BarChart3
} from "lucide-react";
import Layout from "@/components/Layout";

const InventoryPage = () => {
  const navigate = useNavigate();

  const stockOperations = [
    {
      title: "Stock Entry - Inward",
      description: "Record incoming stock from purchases, returns, or adjustments",
      icon: ArrowUp,
      path: "/inventory/stock-entry/inward",
      color: "bg-green-500"
    },
    {
      title: "Stock Entry - Outward",
      description: "Record outgoing stock for sales, returns, or adjustments",
      icon: ArrowDown,
      path: "/inventory/stock-entry/outward",
      color: "bg-red-500"
    },
    {
      title: "Stock Transfer",
      description: "Transfer stock between warehouses",
      icon: RefreshCw,
      path: "/inventory/transfer",
      color: "bg-blue-500"
    },
    {
      title: "Physical Count",
      description: "Conduct physical stock counting and reconciliation",
      icon: Calculator,
      path: "/inventory/physical-count",
      color: "bg-purple-500"
    }
  ];

  const reports = [
    {
      title: "Stock Transactions",
      description: "View all inventory transactions",
      icon: FileText,
      path: "/inventory/transactions",
      color: "bg-gray-500"
    },
    {
      title: "Stock Position",
      description: "Current stock levels by warehouse",
      icon: Package,
      path: "/inventory/stock-position",
      color: "bg-orange-500"
    },
    {
      title: "Stock Movements",
      description: "Track stock movement history",
      icon: TrendingUp,
      path: "/inventory/movements",
      color: "bg-indigo-500"
    },
    {
      title: "Inventory Reports",
      description: "Various inventory analysis reports",
      icon: BarChart3,
      path: "/inventory/reports",
      color: "bg-teal-500"
    }
  ];

  return (
    <Layout>
      <div className="container mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Inventory Management</h1>
          <p className="text-gray-600">
            Manage your stock operations, transfers, and physical counts
          </p>
        </div>

        {/* Stock Operations */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Stock Operations</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stockOperations.map((operation) => {
              const Icon = operation.icon;
              return (
                <Card 
                  key={operation.path}
                  className="hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => navigate(operation.path)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${operation.color} text-white`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{operation.title}</CardTitle>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 mb-4">
                      {operation.description}
                    </p>
                    <Button 
                      className="w-full" 
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(operation.path);
                      }}
                    >
                      Start
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Reports & Analysis */}
        <div>
          <h2 className="text-2xl font-semibold mb-4">Reports & Analysis</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {reports.map((report) => {
              const Icon = report.icon;
              return (
                <Card 
                  key={report.path}
                  className="hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => navigate(report.path)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${report.color} text-white`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{report.title}</CardTitle>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 mb-4">
                      {report.description}
                    </p>
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(report.path);
                      }}
                    >
                      View
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total SKUs</p>
                  <p className="text-2xl font-bold">1,234</p>
                </div>
                <Package className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Low Stock Items</p>
                  <p className="text-2xl font-bold text-red-500">23</p>
                </div>
                <TrendingDown className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Value</p>
                  <p className="text-2xl font-bold">₹12.5L</p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Pending Counts</p>
                  <p className="text-2xl font-bold">3</p>
                </div>
                <Calculator className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default InventoryPage;
