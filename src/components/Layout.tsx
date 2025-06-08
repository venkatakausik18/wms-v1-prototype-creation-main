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
  UserPlus,
  ChevronDown,
  ChevronRight,
  ArrowLeft
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate, useLocation } from "react-router-dom";
import { DropdownNavigation } from "@/components/ui/dropdown-navigation";

const NAV_ITEMS = [
  {
    id: 1,
    label: "Dashboard",
    link: "/dashboard",
  },
  {
    id: 2,
    label: "Masters",
    subMenus: [
      {
        title: "Masters",
        items: [
          { label: "Warehouses", description: "Manage warehouses", icon: Boxes, link: "/masters/warehouse/list" },
          { label: "Products", description: "All products", icon: Package, link: "/masters/products/list" },
          { label: "Brands", description: "Product brands", icon: Archive, link: "/masters/brands/list" },
          { label: "Categories", description: "Product categories", icon: Archive, link: "/masters/categories/list" },
          { label: "Customers", description: "Manage customers", icon: Users, link: "/masters/customers/list" },
          { label: "Vendors", description: "Manage vendors", icon: Users, link: "/masters/vendors/list" },
        ],
      },
    ],
  },
  {
    id: 3,
    label: "Purchase",
    subMenus: [
      {
        title: "Purchase",
        items: [
          { label: "Orders", description: "Purchase orders", icon: ShoppingCart, link: "/purchase/orders" },
          { label: "GRN", description: "Goods receipt notes", icon: Calendar, link: "/purchase/grn" },
          { label: "Returns", description: "Purchase returns", icon: Archive, link: "/purchase/returns" },
          { label: "Payments", description: "Vendor payments", icon: BarChart3, link: "/purchase/payments" },
        ],
      },
    ],
  },
  {
    id: 4,
    label: "Sales",
    subMenus: [
      {
        title: "Sales",
        items: [
          { label: "Invoices", description: "Sales invoices", icon: BarChart3, link: "/sales/invoices" },
          { label: "Returns", description: "Sales returns", icon: Archive, link: "/sales/returns" },
          { label: "Receipts", description: "Customer receipts", icon: Calendar, link: "/sales/receipts" },
        ],
      },
    ],
  },
  {
    id: 5,
    label: "Inventory",
    subMenus: [
      {
        title: "Inventory",
        items: [
          { label: "Stock Entry", description: "Add stock entries", icon: Boxes, link: "/inventory/stock-entry" },
          { label: "Transfer", description: "Stock transfer", icon: Archive, link: "/inventory/transfer" },
          { label: "Physical Count", description: "Physical stock count", icon: Archive, link: "/inventory/physical-count" },
          { label: "Adjustment", description: "Stock adjustment", icon: Settings, link: "/inventory/adjustment" },
        ],
      },
    ],
  },
  {
    id: 6,
    label: "Reports",
    subMenus: [
      {
        title: "Reports",
        items: [
          { label: "Inventory Reports", description: "Inventory analytics", icon: BarChart3, link: "/reports/inventory" },
          { label: "Financial Reports", description: "Financial analytics", icon: BarChart3, link: "/reports/financial" },
          { label: "Purchase Reports", description: "Purchase analytics", icon: BarChart3, link: "/reports/purchase" },
          { label: "Sales Reports", description: "Sales analytics", icon: BarChart3, link: "/reports/sales" },
        ],
      },
    ],
  },
  {
    id: 7,
    label: "User Management",
    subMenus: [
      {
        title: "User Management",
        items: [
          { label: "Register User", description: "Add a new user", icon: UserPlus, link: "/users/register" },
          { label: "Manage Users", description: "View and edit users", icon: Users, link: "/users/manage" },
          { label: "Roles & Permissions", description: "Set roles and permissions", icon: Settings, link: "/users/roles" },
        ],
      },
    ],
  },
  {
    id: 8,
    label: "Settings",
    subMenus: [
      {
        title: "Settings",
        items: [
          { label: "Company", description: "Company settings", icon: Warehouse, link: "/settings/company" },
          { label: "System", description: "System configuration", icon: Settings, link: "/settings/system" },
        ],
      },
    ],
  },
];

function AppHeader() {
  return (
    <header className="w-full bg-white border-b shadow-sm flex items-center px-8 py-3 justify-between">
      <div className="flex items-center gap-4">
        <div className="bg-primary rounded-xl p-2 flex items-center justify-center">
          <Warehouse className="h-8 w-8 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">WarehouseFlow</h1>
          <p className="text-xs text-muted-foreground">Management System</p>
        </div>
      </div>
      <nav className="flex-1 flex justify-center">
        <DropdownNavigation navItems={NAV_ITEMS} />
      </nav>
      <div className="flex items-center gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <input
            className="pl-10 pr-4 py-2 rounded-md border bg-background text-sm"
            placeholder="Search..."
          />
        </div>
        <span className="flex items-center gap-1 text-sm">
          <span className="h-2 w-2 rounded-full bg-green-500 inline-block" />
          Online
        </span>
      </div>
    </header>
  );
}

const pageTitles: Record<string, { title: string; subtitle?: string; backUrl?: string }> = {
  "/dashboard": { title: "Dashboard", subtitle: "Welcome to your warehouse management system" },
  "/masters/customers/list": { title: "Customers", subtitle: "View and manage customers" },
  "/masters/customers/add": { title: "Add Customer", subtitle: "Create a new customer", backUrl: "/masters/customers/list" },
  "/masters/vendors/list": { title: "Vendors", subtitle: "View and manage vendors" },
  "/masters/vendors/add": { title: "Add Vendor", subtitle: "Create a new vendor", backUrl: "/masters/vendors/list" },
  // ...add more routes as needed...
};

const AppSidebar = () => {
  const navigate = useNavigate();
  const [openGroup, setOpenGroup] = useState<string | null>(null);

  const handleGroupClick = (title: string, hasItems: boolean) => {
    if (!hasItems) return;
    setOpenGroup(openGroup === title ? null : title);
  };

  return (
    <Sidebar className="border-r bg-slate-50">
      <SidebarHeader className="border-b bg-white p-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg shadow">
            <Boxes className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="font-bold text-slate-900">InventControl Suite</h2>
            <p className="text-xs text-slate-600">Warehouse Management</p>
          </div>
        </div>
      </SidebarHeader>
      
      <SidebarContent className="p-2">
        {NAV_ITEMS.map((item) => {
          const hasSubMenus = !!item.subMenus && item.subMenus.length > 0;
          const isOpen = openGroup === item.label;
          return (
            <SidebarGroup key={item.label}>
              <button
                className={`flex items-center w-full px-2 py-2 rounded-md text-slate-700 hover:bg-blue-100 hover:text-blue-700 transition font-medium focus:outline-none ${isOpen ? 'bg-blue-50 text-blue-700' : ''}`}
                onClick={() => handleGroupClick(item.label, hasSubMenus)}
                type="button"
                style={{ cursor: hasSubMenus ? 'pointer' : 'default' }}
              >
                <span className="flex-1 text-left">{item.label}</span>
                {hasSubMenus && (
                  isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />
                )}
              </button>
              {hasSubMenus && isOpen && (
                <SidebarGroupContent>
                  {item.subMenus.map((subMenu, idx) => (
                    <div key={subMenu.title || idx}>
                      {item.subMenus.length > 1 && subMenu.title && (
                        <SidebarGroupLabel className="pl-8 text-xs text-muted-foreground font-semibold mb-1 mt-2">
                          {subMenu.title}
                        </SidebarGroupLabel>
                      )}
                      <SidebarMenu>
                        {subMenu.items.map((subItem) => (
                          <SidebarMenuItem key={subItem.label}>
                            <SidebarMenuButton asChild>
                              <a
                                href={subItem.link}
                                className="block pl-8 pr-2 py-2 rounded-md text-slate-600 hover:bg-blue-50 hover:text-blue-700 transition"
                              >
                                {subItem.label}
                              </a>
                            </SidebarMenuButton>
                          </SidebarMenuItem>
                        ))}
                      </SidebarMenu>
                    </div>
                  ))}
                </SidebarGroupContent>
              )}
            </SidebarGroup>
          );
        })}
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
  const location = useLocation();
  const navigate = useNavigate();
  const page = pageTitles[location.pathname] || { title: "InventControl Suite", subtitle: "" };
  return (
    <SidebarProvider>
      <div className="min-h-screen flex flex-col w-full bg-slate-50">
        <AppHeader />
        <main className="flex-1">
          <div className="p-6">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Layout;
