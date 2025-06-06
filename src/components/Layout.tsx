
import { useState } from "react";
import { 
  Sidebar, 
  SidebarContent, 
  SidebarGroup, 
  SidebarGroupContent, 
  SidebarGroupLabel, 
  SidebarMenu, 
  SidebarMenuButton, 
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  SidebarHeader,
  SidebarFooter
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Warehouse, 
  Settings, 
  Package, 
  Users, 
  ShoppingCart, 
  BarChart3, 
  Archive,
  LogOut,
  Boxes,
  Calendar,
  Search,
  UserPlus
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";

const navigationItems = [
  {
    title: "Dashboard",
    icon: BarChart3,
    url: "/dashboard",
  },
  {
    title: "Masters",
    icon: Archive,
    items: [
      { title: "Warehouses", url: "/masters/warehouses" },
      { title: "Products", url: "/masters/products" },
      { title: "Brands", url: "/masters/brands" },
      { title: "Categories", url: "/masters/categories" },
      { title: "Customers", url: "/masters/customers" },
      { title: "Vendors", url: "/masters/vendors" },
    ]
  },
  {
    title: "Purchase",
    icon: ShoppingCart,
    items: [
      { title: "Orders", url: "/purchase/orders" },
      { title: "GRN", url: "/purchase/grn" },
      { title: "Returns", url: "/purchase/returns" },
      { title: "Payments", url: "/purchase/payments" },
    ]
  },
  {
    title: "Sales",
    icon: Package,
    items: [
      { title: "Invoices", url: "/sales/invoices" },
      { title: "Returns", url: "/sales/returns" },
      { title: "Receipts", url: "/sales/receipts" },
    ]
  },
  {
    title: "Inventory",
    icon: Boxes,
    items: [
      { title: "Stock Entry", url: "/inventory/stock-entry" },
      { title: "Transfer", url: "/inventory/transfer" },
      { title: "Physical Count", url: "/inventory/physical-count" },
      { title: "Adjustment", url: "/inventory/adjustment" },
    ]
  },
  {
    title: "Reports",
    icon: BarChart3,
    items: [
      { title: "Inventory Reports", url: "/reports/inventory" },
      { title: "Financial Reports", url: "/reports/financial" },
      { title: "Purchase Reports", url: "/reports/purchase" },
      { title: "Sales Reports", url: "/reports/sales" },
    ]
  },
  {
    title: "User Management",
    icon: Users,
    items: [
      { title: "Register User", url: "/register" },
      { title: "Manage Users", url: "/users/manage" },
      { title: "Roles & Permissions", url: "/users/roles" },
    ]
  },
  {
    title: "Settings",
    icon: Settings,
    items: [
      { title: "Company", url: "/settings/company" },
      { title: "System", url: "/settings/system" },
    ]
  }
];

const AppSidebar = () => {
  const navigate = useNavigate();
  
  return (
    <Sidebar className="border-r bg-slate-50">
      <SidebarHeader className="border-b bg-white p-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-600 rounded-lg">
            <Warehouse className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="font-bold text-slate-900">InventControl</h2>
            <p className="text-xs text-slate-600">Warehouse Management</p>
          </div>
        </div>
      </SidebarHeader>
      
      <SidebarContent className="p-2">
        {navigationItems.map((item) => (
          <SidebarGroup key={item.title}>
            <SidebarGroupLabel className="text-slate-600 font-medium">
              <item.icon className="h-4 w-4 mr-2" />
              {item.title}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {item.items ? (
                  item.items.map((subItem) => (
                    <SidebarMenuItem key={subItem.title}>
                      <SidebarMenuButton asChild>
                        <a href={subItem.url} className="text-slate-700 hover:text-blue-600 hover:bg-blue-50">
                          <span>{subItem.title}</span>
                        </a>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))
                ) : (
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <a href={item.url} className="text-slate-700 hover:text-blue-600 hover:bg-blue-50">
                        <span>{item.title}</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      
      <SidebarFooter className="border-t bg-white p-4">
        <UserFooter />
      </SidebarFooter>
    </Sidebar>
  );
};

const UserFooter = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
          <Users className="h-4 w-4 text-white" />
        </div>
        <div>
          <p className="text-sm font-medium text-slate-900">
            {user?.email?.split('@')[0] || 'User'}
          </p>
          <p className="text-xs text-slate-600">System User</p>
        </div>
      </div>
      <Button variant="ghost" size="sm" onClick={handleSignOut}>
        <LogOut className="h-4 w-4" />
      </Button>
    </div>
  );
};

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-slate-50">
        <AppSidebar />
        <main className="flex-1">
          <div className="bg-white border-b px-6 py-4 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <SidebarTrigger />
              <div>
                <h1 className="text-lg font-semibold text-slate-900">Dashboard</h1>
                <p className="text-sm text-slate-600">Welcome to your warehouse management system</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm">
                <Search className="h-4 w-4 mr-2" />
                Search
              </Button>
              <Badge variant="secondary">Online</Badge>
            </div>
          </div>
          <div className="p-6">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Layout;
