
import React, { useState, useEffect } from "react";
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

interface PurchaseReturn {
  pr_id: number;
  return_number: string;
  return_date: string;
  vendor_id: number;
  vendor_name: string;
  created_by: number;
  return_reason: string;
  return_type: string;
}

interface Vendor {
  vendor_id: number;
  vendor_name: string;
}

const PurchaseReturnList = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedVendor, setSelectedVendor] = useState<string>("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Fetch purchase returns with vendor information
  const { data: purchaseReturns, isLoading, error, refetch } = useQuery({
    queryKey: ['purchase-returns', searchTerm, selectedVendor, startDate, endDate],
    queryFn: async () => {
      let query = supabase
        .from('purchase_returns')
        .select(`
          *,
          vendors(vendor_name)
        `)
        .order('return_date', { ascending: false });

      // Apply filters
      if (searchTerm) {
        query = query.ilike('return_number', `%${searchTerm}%`);
      }
      
      if (selectedVendor && selectedVendor !== "all") {
        query = query.eq('vendor_id', parseInt(selectedVendor));
      }
      
      if (startDate) {
        query = query.gte('return_date', startDate);
      }
      
      if (endDate) {
        query = query.lte('return_date', endDate);
      }

      const { data, error } = await query;
      
      if (error) {
        console.error('Error fetching purchase returns:', error);
        throw error;
      }
      
      return data?.map(item => ({
        pr_id: item.pr_id,
        return_number: item.return_number,
        return_date: item.return_date,
        vendor_id: item.vendor_id,
        vendor_name: item.vendors?.vendor_name || 'Unknown Vendor',
        created_by: item.created_by,
        return_reason: item.return_reason,
        return_type: item.return_type
      })) || [];
    },
  });

  // Fetch vendors for filter dropdown
  const { data: vendors } = useQuery({
    queryKey: ['vendors-for-filter'],
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

  const handleEdit = (prId: number) => {
    navigate(`/purchase/returns/edit/${prId}`);
  };

  const handlePrint = (prId: number) => {
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
            Error loading purchase returns: {error.message}
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Purchase Returns</h1>
          <Button onClick={() => navigate('/purchase/returns/add')} className="flex items-center gap-2">
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

        {/* Purchase Returns Table */}
        <Card>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-6 text-center">Loading purchase returns...</div>
            ) : purchaseReturns && purchaseReturns.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Return Number</TableHead>
                    <TableHead>Return Date</TableHead>
                    <TableHead>Vendor</TableHead>
                    <TableHead>Return Type</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {purchaseReturns.map((returnItem) => (
                    <TableRow key={returnItem.pr_id}>
                      <TableCell className="font-medium">{returnItem.return_number}</TableCell>
                      <TableCell>{new Date(returnItem.return_date).toLocaleDateString()}</TableCell>
                      <TableCell>{returnItem.vendor_name}</TableCell>
                      <TableCell className="capitalize">{returnItem.return_type}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(returnItem.pr_id)}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePrint(returnItem.pr_id)}
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
                No purchase returns found. {searchTerm || selectedVendor !== "all" || startDate || endDate ? 'Try adjusting your filters.' : ''}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default PurchaseReturnList;
