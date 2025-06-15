
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
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
import GrnEdit from "./pages/GrnEdit";
import PurchaseReturnList from "./pages/PurchaseReturnList";
import PurchaseReturnEdit from "./pages/PurchaseReturnEdit";
import VendorPaymentList from "./pages/VendorPaymentList";
import VendorPaymentEdit from "./pages/VendorPaymentEdit";
import SalesInvoiceList from "./pages/SalesInvoiceList";
import SalesInvoiceEdit from "./pages/SalesInvoiceEdit";
import SalesReturnList from "./pages/SalesReturnList";
import SalesReturnEdit from "./pages/SalesReturnEdit";
import CustomerReceiptList from "./pages/CustomerReceiptList";
import CustomerReceiptEdit from "./pages/CustomerReceiptEdit";
import StockEntryList from "./pages/StockEntryList";
import StockEntryEdit from "./pages/StockEntryEdit";
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
            {/* GRN Routes */}
            <Route path="/purchase/grn" element={<Navigate to="/purchase/grn/list" replace />} />
            <Route path="/purchase/grn/list" element={<GrnList />} />
            <Route path="/purchase/grn/add" element={<GrnEdit />} />
            <Route path="/purchase/grn/edit/:grnId" element={<GrnEdit />} />
            <Route path="/purchase/grn/view/:grnId" element={<GrnEdit />} />
            {/* Purchase Return Routes */}
            <Route path="/purchase/returns" element={<Navigate to="/purchase/returns/list" replace />} />
            <Route path="/purchase/returns/list" element={<PurchaseReturnList />} />
            <Route path="/purchase/returns/add" element={<PurchaseReturnEdit />} />
            <Route path="/purchase/returns/edit/:prId" element={<PurchaseReturnEdit />} />
            <Route path="/purchase/returns/view/:prId" element={<PurchaseReturnEdit />} />
            {/* Vendor Payment Routes */}
            <Route path="/purchase/payments" element={<Navigate to="/purchase/payments/list" replace />} />
            <Route path="/purchase/payments/list" element={<VendorPaymentList />} />
            <Route path="/purchase/payments/add" element={<VendorPaymentEdit />} />
            <Route path="/purchase/payments/edit/:paymentId" element={<VendorPaymentEdit />} />
            <Route path="/purchase/payments/view/:paymentId" element={<VendorPaymentEdit />} />
            {/* Sales Invoice Routes */}
            <Route path="/sales/invoices" element={<Navigate to="/sales/invoices/list" replace />} />
            <Route path="/sales/invoices/list" element={<SalesInvoiceList />} />
            <Route path="/sales/invoices/add" element={<SalesInvoiceEdit />} />
            <Route path="/sales/invoices/edit/:salesId" element={<SalesInvoiceEdit />} />
            <Route path="/sales/invoices/view/:salesId" element={<SalesInvoiceEdit />} />
            {/* Sales Return Routes */}
            <Route path="/sales/returns" element={<Navigate to="/sales/returns/list" replace />} />
            <Route path="/sales/returns/list" element={<SalesReturnList />} />
            <Route path="/sales/returns/add" element={<SalesReturnEdit />} />
            <Route path="/sales/returns/edit/:returnId" element={<SalesReturnEdit />} />
            <Route path="/sales/returns/view/:returnId" element={<SalesReturnEdit />} />
            {/* Customer Receipt Routes */}
            <Route path="/sales/receipts" element={<Navigate to="/sales/receipts/list" replace />} />
            <Route path="/sales/receipts/list" element={<CustomerReceiptList />} />
            <Route path="/sales/receipts/add" element={<CustomerReceiptEdit />} />
            <Route path="/sales/receipts/edit/:receiptId" element={<CustomerReceiptEdit />} />
            <Route path="/sales/receipts/view/:receiptId" element={<CustomerReceiptEdit />} />
            {/* Stock Entry Routes */}
            <Route path="/inventory/stock-entry" element={<Navigate to="/inventory/stock-entry/list" replace />} />
            <Route path="/inventory/stock-entry/list" element={<StockEntryList />} />
            <Route path="/inventory/stock-entry/add" element={<StockEntryEdit />} />
            <Route path="/inventory/stock-entry/edit/:txnId" element={<StockEntryEdit />} />
            <Route path="/inventory/stock-entry/view/:txnId" element={<StockEntryEdit />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
