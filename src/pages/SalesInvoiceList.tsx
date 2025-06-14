

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Filter, FileText, Mail, Eye } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/Layout";

const SalesInvoiceList = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [customerFilter, setCustomerFilter] = useState("");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  // Fetch sales invoices with filters
  const { data: invoices, isLoading } = useQuery({
    queryKey: ['sales-invoices', searchTerm, customerFilter, paymentStatusFilter, dateFrom, dateTo, currentPage],
    queryFn: async () => {
      let query = supabase
        .from('sales_invoices')
        .select(`
          sales_id,
          invoice_number,
          invoice_date,
          grand_total,
          payment_status,
          created_by,
          customer_id,
          customers!inner(customer_id, customer_name)
        `)
        .order('invoice_date', { ascending: false });

      // Apply filters
      if (searchTerm) {
        query = query.ilike('invoice_number', `%${searchTerm}%`);
      }
      
      if (customerFilter && customerFilter !== "all") {
        query = query.eq('customer_id', parseInt(customerFilter));
      }
      
      if (paymentStatusFilter && paymentStatusFilter !== "all") {
        query = query.eq('payment_status', paymentStatusFilter as 'unpaid' | 'partial' | 'paid');
      }
      
      if (dateFrom) {
        query = query.gte('invoice_date', dateFrom);
      }
      
      if (dateTo) {
        query = query.lte('invoice_date', dateTo);
      }

      // Pagination
      const from = (currentPage - 1) * itemsPerPage;
      const to = from + itemsPerPage - 1;
      query = query.range(from, to);

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  // Fetch customers for filter dropdown
  const { data: customers } = useQuery({
    queryKey: ['customers-for-filter'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('customers')
        .select('customer_id, customer_name')
        .eq('is_active', true)
        .order('customer_name');
      
      if (error) throw error;
      return data;
    },
  });

  const getPaymentStatusBadge = (status: string) => {
    const statusConfig = {
      unpaid: { label: 'Unpaid', variant: 'destructive' as const },
      partial: { label: 'Partial', variant: 'secondary' as const },
      paid: { label: 'Paid', variant: 'default' as const },
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.unpaid;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const handleEdit = (salesId: number, paymentStatus: string) => {
    if (paymentStatus === 'paid') {
      alert('Cannot edit paid invoices');
      return;
    }
    navigate(`/sales/invoices/edit/${salesId}`);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setCustomerFilter("");
    setPaymentStatusFilter("");
    setDateFrom("");
    setDateTo("");
    setCurrentPage(1);
  };

  return (
    <Layout>
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Sales Invoices</h1>
          <Button onClick={() => navigate('/sales/invoices/add')}>
            <Plus className="h-4 w-4 mr-2" />
            New Invoice
          </Button>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search invoice number..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Select value={customerFilter} onValueChange={setCustomerFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All customers" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All customers</SelectItem>
                  {customers?.map((customer) => (
                    <SelectItem key={customer.customer_id} value={customer.customer_id.toString()}>
                      {customer.customer_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={paymentStatusFilter} onValueChange={setPaymentStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Payment status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value="unpaid">Unpaid</SelectItem>
                  <SelectItem value="partial">Partial</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                </SelectContent>
              </Select>

              <Input
                type="date"
                placeholder="From date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
              />

              <Input
                type="date"
                placeholder="To date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
              />

              <Button variant="outline" onClick={clearFilters}>
                Clear
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Invoice Table */}
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice Number</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Grand Total</TableHead>
                    <TableHead>Payment Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        Loading...
                      </TableCell>
                    </TableRow>
                  ) : invoices?.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        No invoices found
                      </TableCell>
                    </TableRow>
                  ) : (
                    invoices?.map((invoice) => {
                      // Safe type guard for customers with proper null checking
                      const customer = invoice.customers && 
                        typeof invoice.customers === "object" &&
                        "customer_name" in invoice.customers 
                          ? (invoice.customers as { customer_id: string; customer_name: string })
                          : null;
                          
                      return (
                        <TableRow key={invoice.sales_id}>
                          <TableCell className="font-medium">
                            {invoice.invoice_number}
                          </TableCell>
                          <TableCell>
                            {new Date(invoice.invoice_date).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            {customer?.customer_name || 'Unknown Customer'}
                          </TableCell>
                          <TableCell>
                            ₹{Number(invoice.grand_total || 0).toFixed(2)}
                          </TableCell>
                          <TableCell>
                            {getPaymentStatusBadge(invoice.payment_status)}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEdit(invoice.sales_id, invoice.payment_status)}
                              >
                                <FileText className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  if (customer?.customer_id) {
                                    navigate(`/sales/receipts/${customer.customer_id}`);
                                  }
                                }}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => console.log('Print invoice:', invoice.sales_id)}
                              >
                                <Mail className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            {invoices && invoices.length > 0 && (
              <div className="flex items-center justify-between px-6 py-4 border-t">
                <div className="text-sm text-gray-500">
                  Page {currentPage} - Showing {invoices.length} invoices
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={invoices.length < itemsPerPage}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default SalesInvoiceList;
