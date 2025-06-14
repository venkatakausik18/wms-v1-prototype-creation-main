
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

interface CustomerReceipt {
  receipt_id: number;
  receipt_number: string;
  receipt_date: string;
  customer_id: number;
  customer_name: string;
  total_amount_received: number;
  payment_mode: string;
}

interface Customer {
  customer_id: string;
  customer_name: string;
}

const CustomerReceiptList = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<string>("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Fetch customer receipts with related customer data
  const { data: customerReceipts, isLoading, error, refetch } = useQuery({
    queryKey: ['customer-receipts', searchTerm, selectedCustomer, startDate, endDate],
    queryFn: async () => {
      console.log('Fetching customer receipts with filters:', { searchTerm, selectedCustomer, startDate, endDate });
      
      let query = supabase
        .from('customer_receipts')
        .select(`
          receipt_id,
          receipt_number,
          receipt_date,
          customer_id,
          total_amount_received,
          payment_mode
        `)
        .order('receipt_date', { ascending: false });

      // Apply filters
      if (searchTerm) {
        query = query.ilike('receipt_number', `%${searchTerm}%`);
      }
      
      if (selectedCustomer && selectedCustomer !== "all") {
        query = query.eq('customer_id', parseInt(selectedCustomer));
      }
      
      if (startDate) {
        query = query.gte('receipt_date', startDate);
      }
      
      if (endDate) {
        query = query.lte('receipt_date', endDate);
      }

      const { data: receipts, error: receiptsError } = await query;
      
      if (receiptsError) {
        console.error('Error fetching customer receipts:', receiptsError);
        throw receiptsError;
      }

      // Get customer names separately to avoid relationship issues
      const customerIds = [...new Set(receipts?.map(r => r.customer_id) || [])];
      const { data: customers, error: customersError } = await supabase
        .from('customers')
        .select('customer_id, customer_name')
        .in('customer_id', customerIds);

      if (customersError) {
        console.error('Error fetching customers:', customersError);
        throw customersError;
      }

      // Create a map for quick customer lookup
      const customerMap = new Map(customers?.map(c => [c.customer_id, c.customer_name]) || []);
      
      return receipts?.map(receipt => ({
        receipt_id: receipt.receipt_id,
        receipt_number: receipt.receipt_number,
        receipt_date: receipt.receipt_date,
        customer_id: receipt.customer_id,
        customer_name: customerMap.get(receipt.customer_id) || 'Unknown Customer',
        total_amount_received: receipt.total_amount_received,
        payment_mode: receipt.payment_mode
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

  const handleEdit = (receiptId: number) => {
    navigate(`/sales/receipts/edit/${receiptId}`);
  };

  const handlePrint = (receiptId: number) => {
    toast({
      title: "Print functionality",
      description: "Print feature will be implemented soon.",
    });
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
            Error loading customer receipts: {error.message}
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Customer Receipts</h1>
          <Button onClick={() => navigate('/sales/receipts/add')} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Receipt
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
                  placeholder="Search by receipt number..."
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

        {/* Customer Receipts Table */}
        <Card>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-6 text-center">Loading customer receipts...</div>
            ) : customerReceipts && customerReceipts.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Receipt Number</TableHead>
                    <TableHead>Receipt Date</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Amount Received</TableHead>
                    <TableHead>Payment Mode</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {customerReceipts.map((receipt) => (
                    <TableRow key={receipt.receipt_id}>
                      <TableCell className="font-medium">{receipt.receipt_number}</TableCell>
                      <TableCell>{new Date(receipt.receipt_date).toLocaleDateString()}</TableCell>
                      <TableCell>{receipt.customer_name}</TableCell>
                      <TableCell>₹{receipt.total_amount_received.toFixed(2)}</TableCell>
                      <TableCell className="capitalize">{receipt.payment_mode}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(receipt.receipt_id)}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePrint(receipt.receipt_id)}
                            className="flex items-center gap-1"
                          >
                            <FileText className="h-3 w-3" />
                            Print
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="p-6 text-center text-gray-500">
                No customer receipts found. {searchTerm || selectedCustomer !== "all" || startDate || endDate ? 'Try adjusting your filters.' : ''}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default CustomerReceiptList;
