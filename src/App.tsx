
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import Index from "./pages/Index";
import DashboardPage from "./pages/DashboardPage";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ResetPassword from "./pages/ResetPassword";
import CompanySettings from "./pages/CompanySettings";
import CompanyEdit from "./pages/CompanyEdit";
import UserList from "./pages/UserList";
import UserEdit from "./pages/UserEdit";
import WarehouseList from "./pages/WarehouseList";
import WarehouseEdit from "./pages/WarehouseEdit";
import WarehouseZones from "./pages/WarehouseZones";
import WarehouseZoneEdit from "./pages/WarehouseZoneEdit";
import StorageBins from "./pages/StorageBins";
import StorageBinEdit from "./pages/StorageBinEdit";
import ProductList from "./pages/ProductList";
import ProductEdit from "./pages/ProductEdit";
import BrandList from "./pages/BrandList";
import BrandEdit from "./pages/BrandEdit";
import CategoryList from "./pages/CategoryList";
import CategoryEdit from "./pages/CategoryEdit";
import CustomerList from "./pages/CustomerList";
import CustomerEdit from "./pages/CustomerEdit";
import CustomerAddresses from "./pages/CustomerAddresses";
import VendorList from "./pages/VendorList";
import VendorEdit from "./pages/VendorEdit";
import PurchaseOrderList from "./pages/PurchaseOrderList";
import PurchaseOrderEdit from "./pages/PurchaseOrderEdit";
import GrnList from "./pages/GrnList";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/settings/company" element={<CompanySettings />} />
            <Route path="/settings/company/edit/:companyId" element={<CompanyEdit />} />
            <Route path="/settings/users/list" element={<UserList />} />
            <Route path="/settings/users/add" element={<UserEdit />} />
            <Route path="/settings/users/edit/:userId" element={<UserEdit />} />
            <Route path="/settings/users/view/:userId" element={<UserEdit />} />
            <Route path="/masters/warehouse/list" element={<WarehouseList />} />
            <Route path="/masters/warehouse/add" element={<WarehouseEdit />} />
            <Route path="/masters/warehouse/edit/:warehouseId" element={<WarehouseEdit />} />
            <Route path="/masters/warehouse/:warehouseId/zones" element={<WarehouseZones />} />
            <Route path="/masters/warehouse/:warehouseId/zones/add" element={<WarehouseZoneEdit />} />
            <Route path="/masters/warehouse/zones/:zoneId/edit" element={<WarehouseZoneEdit />} />
            <Route path="/masters/warehouse/zones/:zoneId/bins" element={<StorageBins />} />
            <Route path="/masters/warehouse/zones/:zoneId/bins/add" element={<StorageBinEdit />} />
            <Route path="/masters/warehouse/bins/:binId/edit" element={<StorageBinEdit />} />
            <Route path="/masters/products/list" element={<ProductList />} />
            <Route path="/masters/products/add" element={<ProductEdit />} />
            <Route path="/masters/products/edit/:productId" element={<ProductEdit />} />
            <Route path="/masters/brands/list" element={<BrandList />} />
            <Route path="/masters/brands/add" element={<BrandEdit />} />
            <Route path="/masters/brands/edit/:brandId" element={<BrandEdit />} />
            <Route path="/masters/categories/list" element={<CategoryList />} />
            <Route path="/masters/categories/add" element={<CategoryEdit />} />
            <Route path="/masters/categories/edit/:categoryId" element={<CategoryEdit />} />
            <Route path="/masters/customers/list" element={<CustomerList />} />
            <Route path="/masters/customers/add" element={<CustomerEdit />} />
            <Route path="/masters/customers/edit/:customerId" element={<CustomerEdit />} />
            <Route path="/masters/customers/view/:customerId" element={<CustomerEdit />} />
            <Route path="/masters/customers/:customerId/addresses" element={<CustomerAddresses />} />
            <Route path="/masters/vendors/list" element={<VendorList />} />
            <Route path="/masters/vendors/add" element={<VendorEdit />} />
            <Route path="/masters/vendors/edit/:vendorId" element={<VendorEdit />} />
            <Route path="/purchase/orders/list" element={<PurchaseOrderList />} />
            <Route path="/purchase/orders/add" element={<PurchaseOrderEdit />} />
            <Route path="/purchase/orders/edit/:poId" element={<PurchaseOrderEdit />} />
            <Route path="/purchase/orders/view/:poId" element={<PurchaseOrderEdit />} />
            <Route path="/purchase/grn/list" element={<GrnList />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
