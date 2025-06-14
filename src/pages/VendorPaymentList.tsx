
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

interface VendorPayment {
  payment_id: number;
  payment_number: string;
  payment_date: string;
  vendor_id: number;
  vendor_name: string;
  amount_paid: number;
  payment_mode: string;
  created_by: number;
}

interface Vendor {
  vendor_id: number;
  vendor_name: string;
}

const VendorPaymentList = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedVendor, setSelectedVendor] = useState<string>("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Fetch vendor payments with vendor information
  const { data: vendorPayments, isLoading, error, refetch } = useQuery({
    queryKey: ['vendor-payments', searchTerm, selectedVendor, startDate, endDate],
    queryFn: async () => {
      let query = supabase
        .from('vendor_payments')
        .select(`
          *,
          vendors(vendor_name)
        `)
        .order('payment_date', { ascending: false });

      // Apply filters
      if (searchTerm) {
        query = query.ilike('payment_number', `%${searchTerm}%`);
      }
      
      if (selectedVendor && selectedVendor !== "all") {
        query = query.eq('vendor_id', parseInt(selectedVendor));
      }
      
      if (startDate) {
        query = query.gte('payment_date', startDate);
      }
      
      if (endDate) {
        query = query.lte('payment_date', endDate);
      }

      const { data, error } = await query;
      
      if (error) {
        console.error('Error fetching vendor payments:', error);
        throw error;
      }
      
      return data?.map(item => ({
        payment_id: item.payment_id,
        payment_number: item.payment_number,
        payment_date: item.payment_date,
        vendor_id: item.vendor_id,
        vendor_name: item.vendors?.vendor_name || 'Unknown Vendor',
        amount_paid: item.amount_paid,
        payment_mode: item.payment_mode,
        created_by: item.created_by
      })) || [];
    },
  });

  // Fetch vendors for filter dropdown
  const { data: vendors } = useQuery({
    queryKey: ['vendors-for-payment-filter'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vendors')
        .select('vendor_id, vendor_name')
        .eq('is_active', true)
        .order('vendor_name');
      
      if (error) throw error;
      return data;
    },
  });

  const handleEdit = (paymentId: number) => {
    navigate(`/purchase/payments/edit/${paymentId}`);
  };

  const handlePrint = (paymentId: number) => {
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
    setSelectedVendor("all");
    setStartDate("");
    setEndDate("");
  };

  if (error) {
    return (
      <Layout>
        <div className="container mx-auto p-6">
          <div className="text-center text-red-600">
            Error loading vendor payments: {error.message}
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Vendor Payments</h1>
          <Button onClick={() => navigate('/purchase/payments/add')} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Payment
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
                  placeholder="Search by payment number..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <Select value={selectedVendor} onValueChange={setSelectedVendor}>
                <SelectTrigger>
                  <SelectValue placeholder="Select vendor" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Vendors</SelectItem>
                  {vendors?.map((vendor) => (
                    <SelectItem key={vendor.vendor_id} value={vendor.vendor_id.toString()}>
                      {vendor.vendor_name}
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

        {/* Vendor Payments Table */}
        <Card>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-6 text-center">Loading vendor payments...</div>
            ) : vendorPayments && vendorPayments.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Payment Number</TableHead>
                    <TableHead>Payment Date</TableHead>
                    <TableHead>Vendor</TableHead>
                    <TableHead>Amount Paid</TableHead>
                    <TableHead>Payment Mode</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {vendorPayments.map((payment) => (
                    <TableRow key={payment.payment_id}>
                      <TableCell className="font-medium">{payment.payment_number}</TableCell>
                      <TableCell>{new Date(payment.payment_date).toLocaleDateString()}</TableCell>
                      <TableCell>{payment.vendor_name}</TableCell>
                      <TableCell>₹{payment.amount_paid.toFixed(2)}</TableCell>
                      <TableCell className="capitalize">{payment.payment_mode}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(payment.payment_id)}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePrint(payment.payment_id)}
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
                No vendor payments found. {searchTerm || selectedVendor !== "all" || startDate || endDate ? 'Try adjusting your filters.' : ''}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default VendorPaymentList;
