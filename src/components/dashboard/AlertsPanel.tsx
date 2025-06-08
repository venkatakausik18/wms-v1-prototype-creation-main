import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  AlertTriangle, 
  AlertCircle, 
  Info, 
  CheckCircle, 
  Clock,
  TrendingDown,
  DollarSign,
  Package
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Alert {
  id: string;
  type: "critical" | "warning" | "info" | "success";
  title: string;
  description: string;
  time: string;
  action?: string;
}

const AlertsPanel = () => {
  const alerts: Alert[] = [
    {
      id: "1",
      type: "critical",
      title: "Stock Out Alert",
      description: "Men's T-Shirt (SKU: MT001) is out of stock",
      time: "5 minutes ago",
      action: "Reorder Now"
    },
    {
      id: "2",
      type: "warning",
      title: "Low Stock Warning",
      description: "Women's Jeans running low (12 units remaining)",
      time: "15 minutes ago",
      action: "Check Stock"
    },
    {
      id: "3",
      type: "critical",
      title: "Overdue Payment",
      description: "Invoice #INV-2024-001 overdue by 45 days (₹25,000)",
      time: "1 hour ago",
      action: "Follow Up"
    },
    {
      id: "4",
      type: "info",
      title: "New Order Received",
      description: "Order #ORD-2024-156 from Retail Customer (₹12,500)",
      time: "2 hours ago"
    },
    {
      id: "5",
      type: "success",
      title: "Payment Received",
      description: "₹45,000 payment received from ABC Wholesale",
      time: "3 hours ago"
    },
    {
      id: "6",
      type: "warning",
      title: "Delivery Delay",
      description: "Purchase Order #PO-2024-089 delayed by 2 days",
      time: "4 hours ago",
      action: "Contact Vendor"
    }
  ];

  const getAlertIcon = (type: string) => {
    switch (type) {
      case "critical":
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case "warning":
        return <AlertCircle className="h-4 w-4 text-orange-600" />;
      case "info":
        return <Info className="h-4 w-4 text-blue-600" />;
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      default:
        return <Info className="h-4 w-4 text-slate-600" />;
    }
  };

  const getAlertBadge = (type: string) => {
    switch (type) {
      case "critical":
        return <Badge variant="destructive" className="text-xs">Critical</Badge>;
      case "warning":
        return <Badge variant="outline" className="text-xs border-orange-300 text-orange-700">Warning</Badge>;
      case "info":
        return <Badge variant="outline" className="text-xs border-blue-300 text-blue-700">Info</Badge>;
      case "success":
        return <Badge variant="outline" className="text-xs border-green-300 text-green-700">Success</Badge>;
      default:
        return <Badge variant="outline" className="text-xs">Unknown</Badge>;
    }
  };

  const criticalAlerts = alerts.filter(alert => alert.type === "critical").length;
  const warningAlerts = alerts.filter(alert => alert.type === "warning").length;

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">Alerts & Notifications</CardTitle>
            <CardDescription>Recent system alerts and important updates</CardDescription>
          </div>
          <div className="flex items-center space-x-2">
            {criticalAlerts > 0 && (
              <Badge variant="destructive" className="text-xs">
                {criticalAlerts} Critical
              </Badge>
            )}
            {warningAlerts > 0 && (
              <Badge variant="outline" className="text-xs border-orange-300 text-orange-700">
                {warningAlerts} Warning
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 max-h-[400px] overflow-y-auto">
          {alerts.map((alert) => (
            <div 
              key={alert.id} 
              className={cn(
                "flex items-start space-x-3 p-3 rounded-lg border-l-4 bg-slate-50",
                alert.type === "critical" && "border-l-red-500 bg-red-50",
                alert.type === "warning" && "border-l-orange-500 bg-orange-50",
                alert.type === "info" && "border-l-blue-500 bg-blue-50",
                alert.type === "success" && "border-l-green-500 bg-green-50"
              )}
            >
              <div className="flex-shrink-0 mt-0.5">
                {getAlertIcon(alert.type)}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <p className="text-sm font-medium text-slate-900">{alert.title}</p>
                      {getAlertBadge(alert.type)}
                    </div>
                    <p className="text-sm text-slate-600 mb-2">{alert.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-500 flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        {alert.time}
                      </span>
                      {alert.action && (
                        <Button variant="outline" size="sm" className="text-xs h-7">
                          {alert.action}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-4 pt-4 border-t">
          <Button variant="outline" className="w-full">
            View All Alerts
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default AlertsPanel;
