
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
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
