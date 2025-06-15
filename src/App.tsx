
import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";

// Lazy load pages
const Index = lazy(() => import("./pages/Index"));
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const DashboardPage = lazy(() => import("./pages/DashboardPage"));
const NotFound = lazy(() => import("./pages/NotFound"));

// Product Management
const ProductList = lazy(() => import("./pages/ProductList"));
const ProductEdit = lazy(() => import("./pages/ProductEdit"));

// Category Management
const CategoryList = lazy(() => import("./pages/CategoryList"));
const CategoryEdit = lazy(() => import("./pages/CategoryEdit"));

// Warehouse Management
const WarehouseList = lazy(() => import("./pages/WarehouseList"));
const WarehouseEdit = lazy(() => import("./pages/WarehouseEdit"));

// Stock Entry Management
const StockEntryList = lazy(() => import("./pages/StockEntryList"));
const StockEntryEdit = lazy(() => import("./pages/StockEntryEdit"));

// Stock Transfer imports
const StockTransferList = lazy(() => import("./pages/StockTransferList"));
const StockTransferEdit = lazy(() => import("./pages/StockTransferEdit"));

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <BrowserRouter>
          <Suspense fallback={<div>Loading...</div>}>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <Layout>
                    <DashboardPage />
                  </Layout>
                </ProtectedRoute>
              } />

              {/* Product Routes */}
              <Route path="/products" element={
                <ProtectedRoute>
                  <Layout>
                    <ProductList />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/products/new" element={
                <ProtectedRoute>
                  <Layout>
                    <ProductEdit />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/products/edit/:id" element={
                <ProtectedRoute>
                  <Layout>
                    <ProductEdit />
                  </Layout>
                </ProtectedRoute>
              } />

              {/* Category Routes */}
              <Route path="/categories" element={
                <ProtectedRoute>
                  <Layout>
                    <CategoryList />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/categories/new" element={
                <ProtectedRoute>
                  <Layout>
                    <CategoryEdit />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/categories/edit/:id" element={
                <ProtectedRoute>
                  <Layout>
                    <CategoryEdit />
                  </Layout>
                </ProtectedRoute>
              } />

              {/* Warehouse Routes */}
              <Route path="/warehouses" element={
                <ProtectedRoute>
                  <Layout>
                    <WarehouseList />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/warehouses/new" element={
                <ProtectedRoute>
                  <Layout>
                    <WarehouseEdit />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/warehouses/edit/:id" element={
                <ProtectedRoute>
                  <Layout>
                    <WarehouseEdit />
                  </Layout>
                </ProtectedRoute>
              } />

              {/* Stock Entry Routes */}
              <Route path="/inventory/stock-entry" element={
                <ProtectedRoute>
                  <Layout>
                    <StockEntryList />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/inventory/stock-entry/new" element={
                <ProtectedRoute>
                  <Layout>
                    <StockEntryEdit />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/inventory/stock-entry/edit/:id" element={
                <ProtectedRoute>
                  <Layout>
                    <StockEntryEdit />
                  </Layout>
                </ProtectedRoute>
              } />

              {/* Stock Transfer Routes */}
              <Route path="/inventory/transfer" element={
                <ProtectedRoute>
                  <Layout>
                    <StockTransferList />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/inventory/transfer/new" element={
                <ProtectedRoute>
                  <Layout>
                    <StockTransferEdit />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/inventory/transfer/edit/:id" element={
                <ProtectedRoute>
                  <Layout>
                    <StockTransferEdit />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/inventory/transfer/view/:id" element={
                <ProtectedRoute>
                  <Layout>
                    <StockTransferEdit />
                  </Layout>
                </ProtectedRoute>
              } />

              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
