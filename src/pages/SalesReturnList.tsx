
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { Plus, Search, Filter, FileText, Download } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import Layout from "@/components/Layout";

interface SalesReturn {
  sales_return_id: number;
  return_number: string;
  return_date: string;
  original_invoice_id: number;
  invoice_number: string;
  customer_id: string;
  customer_name: string;
  total_amount: number;
  refund_mode: string;
  return_status: string;
}

interface Customer {
  customer_id: string;
  customer_name: string;
}

const SalesReturnList = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<string>("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Fetch sales returns with related invoice and customer data
  const { data: salesReturns, isLoading, error, refetch } = useQuery({
    queryKey: ['sales-returns', searchTerm, selectedCustomer, startDate, endDate],
    queryFn: async () => {
      let query = supabase
        .from('sales_returns')
        .select(`
          *,
          sales_invoices(invoice_number),
          customers(customer_name)
        `)
        .order('return_date', { ascending: false });

      // Apply filters
      if (searchTerm) {
        query = query.ilike('return_number', `%${searchTerm}%`);
      }
      
      if (selectedCustomer && selectedCustomer !== "all") {
        query = query.eq('customer_id', selectedCustomer);
      }
      
      if (startDate) {
        query = query.gte('return_date', startDate);
      }
      
      if (endDate) {
        query = query.lte('return_date', endDate);
      }

      const { data, error } = await query;
      
      if (error) {
        console.error('Error fetching sales returns:', error);
        throw error;
      }
      
      return data?.map(item => ({
        sales_return_id: item.sales_return_id,
        return_number: item.return_number,
        return_date: item.return_date,
        original_invoice_id: item.original_invoice_id,
        invoice_number: item.sales_invoices?.invoice_number || 'N/A',
        customer_id: item.customer_id,
        customer_name: item.customers?.customer_name || 'Unknown Customer',
        total_amount: item.total_amount,
        refund_mode: item.refund_mode,
        return_status: item.return_status || 'draft'
      })) || [];
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

  const handleEdit = (returnId: number) => {
    navigate(`/sales/returns/edit/${returnId}`);
  };

  const handlePrint = (returnId: number) => {
    toast({
      title: "Print functionality",
      description: "Print feature will be implemented soon.",
    });
  };

  const handleRefund = (returnId: number, refundMode: string) => {
    if (refundMode === 'credit_note') {
      toast({
        title: "Credit Note",
        description: "Credit note functionality will be implemented soon.",
      });
    } else {
      toast({
        title: "Process Refund",
        description: "Refund processing functionality will be implemented soon.",
      });
    }
  };

  const handleExport = () => {
    toast({
      title: "Export functionality",
      description: "Export feature will be implemented soon.",
    });
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedCustomer("all");
    setStartDate("");
    setEndDate("");
  };

  if (error) {
    return (
      <Layout>
        <div className="container mx-auto p-6">
          <div className="text-center text-red-600">
            Error loading sales returns: {error.message}
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Sales Returns</h1>
          <Button onClick={() => navigate('/sales/returns/add')} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Return
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="flex items-center gap-2">
                <Search className="h-4 w-4 text-gray-500" />
                <Input
                  placeholder="Search by return number..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <Select value={selectedCustomer} onValueChange={setSelectedCustomer}>
                <SelectTrigger>
                  <SelectValue placeholder="Select customer" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Customers</SelectItem>
                  {customers?.map((customer) => (
                    <SelectItem key={customer.customer_id} value={customer.customer_id}>
                      {customer.customer_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Input
                type="date"
                placeholder="Start date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />

              <Input
                type="date"
                placeholder="End date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />

              <Button variant="outline" onClick={clearFilters}>
                Clear Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex justify-end gap-2 mb-4">
          <Button variant="outline" onClick={handleExport} className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>

        {/* Sales Returns Table */}
        <Card>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-6 text-center">Loading sales returns...</div>
            ) : salesReturns && salesReturns.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Return Number</TableHead>
                    <TableHead>Return Date</TableHead>
                    <TableHead>Original Invoice</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Total Amount</TableHead>
                    <TableHead>Refund Mode</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {salesReturns.map((returnItem) => (
                    <TableRow key={returnItem.sales_return_id}>
                      <TableCell className="font-medium">{returnItem.return_number}</TableCell>
                      <TableCell>{new Date(returnItem.return_date).toLocaleDateString()}</TableCell>
                      <TableCell>{returnItem.invoice_number}</TableCell>
                      <TableCell>{returnItem.customer_name}</TableCell>
                      <TableCell>₹{returnItem.total_amount.toFixed(2)}</TableCell>
                      <TableCell className="capitalize">{returnItem.refund_mode}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          {returnItem.return_status !== 'completed' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(returnItem.sales_return_id)}
                            >
                              Edit
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePrint(returnItem.sales_return_id)}
                            className="flex items-center gap-1"
                          >
                            <FileText className="h-3 w-3" />
                            Print
                          </Button>
                          {returnItem.refund_mode !== 'credit_note' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleRefund(returnItem.sales_return_id, returnItem.refund_mode)}
                            >
                              Refund
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="p-6 text-center text-gray-500">
                No sales returns found. {searchTerm || selectedCustomer !== "all" || startDate || endDate ? 'Try adjusting your filters.' : ''}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default SalesReturnList;
