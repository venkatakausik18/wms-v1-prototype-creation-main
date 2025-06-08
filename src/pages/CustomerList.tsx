
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Eye, Edit, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Customer {
  customer_id: number;
  customer_code: string;
  customer_name: string;
  customer_type: string;
  primary_phone: string;
  email: string;
  credit_limit: number;
  opening_balance: number;
  opening_balance_type: string;
  is_active: boolean;
  outstanding_amount?: number;
}

const CustomerList = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [customerTypeFilter, setCustomerTypeFilter] = useState("all");
  const [activeFilter, setActiveFilter] = useState("all");

  // Fetch customers with outstanding amounts
  const { data: customers, isLoading, error } = useQuery({
    queryKey: ['customers', searchTerm, customerTypeFilter, activeFilter],
    queryFn: async () => {
      console.log('Fetching customers with filters:', { searchTerm, customerTypeFilter, activeFilter });
      
      let query = supabase
        .from('customers')
        .select(`
          customer_id,
          customer_code,
          customer_name,
          company_name,
          customer_type,
          primary_phone,
          email,
          credit_limit,
          opening_balance,
          opening_balance_type,
          is_active
        `)
        .eq('company_id', 1); // You might want to get this from context/auth

      // Apply filters
      if (searchTerm) {
        query = query.or(`customer_name.ilike.%${searchTerm}%,company_name.ilike.%${searchTerm}%`);
      }

      if (customerTypeFilter !== "all") {
        query = query.eq('customer_type', customerTypeFilter);
      }

      if (activeFilter !== "all") {
        query = query.eq('is_active', activeFilter === "active");
      }

      query = query.order('customer_name');

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching customers:', error);
        throw error;
      }

      // Calculate outstanding amounts for each customer
      const customersWithOutstanding = await Promise.all(
        (data || []).map(async (customer) => {
          const { data: outstandingData } = await supabase.rpc('calculate_customer_outstanding', {
            p_customer_id: customer.customer_id
          }).single();

          return {
            ...customer,
            outstanding_amount: outstandingData || 0
          };
        })
      );

      console.log('Fetched customers:', customersWithOutstanding);
      return customersWithOutstanding;
    },
  });

  const getOutstandingStatus = (customer: Customer) => {
    const outstanding = customer.outstanding_amount || 0;
    if (outstanding > customer.credit_limit) {
      return { status: 'over-limit', label: 'Over Limit', color: 'destructive' };
    }
    if (outstanding > 0) {
      return { status: 'outstanding', label: 'Outstanding', color: 'secondary' };
    }
    return { status: 'clear', label: 'Clear', color: 'default' };
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };

  if (error) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-destructive">Error loading customers: {error.message}</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
            <p className="text-gray-600">Manage your customer database</p>
          </div>
          <Button onClick={() => navigate('/masters/customers/add')}>
            <Plus className="h-4 w-4 mr-2" />
            Add Customer
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Customer List</CardTitle>
            <CardDescription>View and manage all customers</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search by customer name or company name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={customerTypeFilter} onValueChange={setCustomerTypeFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Customer Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="individual">Individual</SelectItem>
                  <SelectItem value="company">Company</SelectItem>
                </SelectContent>
              </Select>
              <Select value={activeFilter} onValueChange={setActiveFilter}>
                <SelectTrigger className="w-full sm:w-32">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center h-32">
                <div className="text-center">Loading customers...</div>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Credit Limit</TableHead>
                    <TableHead>Outstanding</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {customers?.map((customer) => {
                    const outstandingStatus = getOutstandingStatus(customer);
                    return (
                      <TableRow key={customer.customer_id}>
                        <TableCell className="font-medium">
                          {customer.customer_code}
                        </TableCell>
                        <TableCell>{customer.customer_name}</TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {customer.customer_type}
                          </Badge>
                        </TableCell>
                        <TableCell>{customer.primary_phone || '-'}</TableCell>
                        <TableCell>{customer.email || '-'}</TableCell>
                        <TableCell>{formatCurrency(customer.credit_limit || 0)}</TableCell>
                        <TableCell>
                          <span className={outstandingStatus.status === 'over-limit' ? 'text-destructive font-semibold' : ''}>
                            {formatCurrency(customer.outstanding_amount || 0)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Badge variant={customer.is_active ? "default" : "secondary"}>
                              {customer.is_active ? 'Active' : 'Inactive'}
                            </Badge>
                            <Badge variant={outstandingStatus.color as any}>
                              {outstandingStatus.label}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => navigate(`/masters/customers/view/${customer.customer_id}`)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => navigate(`/masters/customers/edit/${customer.customer_id}`)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => navigate(`/reports/sales/customers/${customer.customer_id}`)}
                            >
                              <FileText className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {customers?.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center text-gray-500 py-8">
                        No customers found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default CustomerList;
