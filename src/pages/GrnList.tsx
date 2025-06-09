import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Plus, Search, Edit, Eye, FileText, Printer, CheckCircle } from "lucide-react";
import Layout from "@/components/Layout";
import { toast } from "sonner";

type GrnStatus = "draft" | "completed" | "cancelled";

interface GoodsReceiptNote {
  grn_id: number;
  grn_number: string;
  grn_date: string;
  po_id: number;
  vendor_id: number;
  warehouse_id: number;
  total_amount: number;
  grn_status: string; // This comes as string from database
  po_number?: string;
  vendor_name?: string;
  warehouse_name?: string;
}

interface Vendor {
  vendor_id: number;
  vendor_name: string;
}

interface Warehouse {
  warehouse_id: number;
  warehouse_name: string;
}

const GrnList = () => {
  const navigate = useNavigate();
  const [grns, setGrns] = useState<GoodsReceiptNote[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedVendor, setSelectedVendor] = useState<string>("all");
  const [selectedWarehouse, setSelectedWarehouse] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchGrns();
    fetchVendors();
    fetchWarehouses();
  }, [currentPage, searchTerm, selectedVendor, selectedWarehouse, selectedStatus]);

  const fetchGrns = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('goods_receipt_notes')
        .select(`
          grn_id,
          grn_number,
          grn_date,
          po_id,
          vendor_id,
          warehouse_id,
          total_amount,
          grn_status
        `)
        .order('grn_date', { ascending: false });

      // Apply filters
      if (searchTerm) {
        query = query.ilike('grn_number', `%${searchTerm}%`);
      }
      if (selectedVendor && selectedVendor !== "all") {
        query = query.eq('vendor_id', parseInt(selectedVendor));
      }
      if (selectedWarehouse && selectedWarehouse !== "all") {
        query = query.eq('warehouse_id', parseInt(selectedWarehouse));
      }
      if (selectedStatus && selectedStatus !== "all") {
        query = query.eq('grn_status', selectedStatus);
      }

      // Count total records for pagination
      const { count } = await supabase
        .from('goods_receipt_notes')
        .select('*', { count: 'exact', head: true });
      
      if (count) {
        setTotalPages(Math.ceil(count / itemsPerPage));
      }

      // Fetch paginated results
      const { data, error } = await query
        .range((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage - 1);

      if (error) throw error;

      // Fetch related data (PO numbers, vendor names, warehouse names)
      const enrichedData = await Promise.all(
        (data || []).map(async (grn) => {
          const [poResult, vendorResult, warehouseResult] = await Promise.all([
            supabase.from('purchase_orders').select('po_number').eq('po_id', grn.po_id).single(),
            supabase.from('vendors').select('vendor_name').eq('vendor_id', grn.vendor_id).single(),
            supabase.from('warehouses').select('warehouse_name').eq('warehouse_id', grn.warehouse_id).single()
          ]);

          return {
            ...grn,
            po_number: poResult.data?.po_number || 'Unknown',
            vendor_name: vendorResult.data?.vendor_name || 'Unknown',
            warehouse_name: warehouseResult.data?.warehouse_name || 'Unknown'
          };
        })
      );

      setGrns(enrichedData);
    } catch (error) {
      console.error('Error fetching GRNs:', error);
      toast.error('Failed to fetch GRNs');
    } finally {
      setLoading(false);
    }
  };

  const fetchVendors = async () => {
    try {
      const { data, error } = await supabase
        .from('vendors')
        .select('vendor_id, vendor_name')
        .eq('is_active', true)
        .order('vendor_name');

      if (error) throw error;
      setVendors(data || []);
    } catch (error) {
      console.error('Error fetching vendors:', error);
    }
  };

  const fetchWarehouses = async () => {
    try {
      const { data, error } = await supabase
        .from('warehouses')
        .select('warehouse_id, warehouse_name')
        .eq('is_active', true)
        .order('warehouse_name');

      if (error) throw error;
      setWarehouses(data || []);
    } catch (error) {
      console.error('Error fetching warehouses:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "draft":
        return <Badge variant="secondary">DRAFT</Badge>;
      case "completed":
        return <Badge variant="default">COMPLETED</Badge>;
      case "cancelled":
        return <Badge variant="destructive">CANCELLED</Badge>;
      default:
        return <Badge variant="secondary">UNKNOWN</Badge>;
    }
  };

  const handlePrint = (grnId: number) => {
    // Implement print functionality
    toast.info('Print functionality will be implemented');
  };

  const handleExport = () => {
    // Implement export functionality
    toast.info('Export functionality will be implemented');
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Goods Receipt Notes</h1>
            <p className="text-muted-foreground">Manage your goods receipt notes</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleExport}>
              <Printer className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button onClick={() => navigate('/purchase/grn/add')}>
              <Plus className="h-4 w-4 mr-2" />
              Add GRN
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by GRN number..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={selectedVendor} onValueChange={setSelectedVendor}>
                <SelectTrigger>
                  <SelectValue placeholder="All Vendors" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Vendors</SelectItem>
                  {vendors.filter(vendor => vendor.vendor_id && vendor.vendor_name).map((vendor) => (
                    <SelectItem key={vendor.vendor_id} value={vendor.vendor_id.toString()}>
                      {vendor.vendor_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedWarehouse} onValueChange={setSelectedWarehouse}>
                <SelectTrigger>
                  <SelectValue placeholder="All Warehouses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Warehouses</SelectItem>
                  {warehouses.filter(warehouse => warehouse.warehouse_id && warehouse.warehouse_name).map((warehouse) => (
                    <SelectItem key={warehouse.warehouse_id} value={warehouse.warehouse_id.toString()}>
                      {warehouse.warehouse_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>GRN Number</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>PO Number</TableHead>
                  <TableHead>Vendor</TableHead>
                  <TableHead>Warehouse</TableHead>
                  <TableHead>Total Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : grns.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      No GRNs found
                    </TableCell>
                  </TableRow>
                ) : (
                  grns.map((grn) => (
                    <TableRow key={grn.grn_id}>
                      <TableCell className="font-medium">{grn.grn_number}</TableCell>
                      <TableCell>{new Date(grn.grn_date).toLocaleDateString()}</TableCell>
                      <TableCell>{grn.po_number}</TableCell>
                      <TableCell>{grn.vendor_name}</TableCell>
                      <TableCell>{grn.warehouse_name}</TableCell>
                      <TableCell>₹{grn.total_amount?.toLocaleString()}</TableCell>
                      <TableCell>{getStatusBadge(grn.grn_status)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate(`/purchase/grn/view/${grn.grn_id}`)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          
                          {(grn.grn_status === 'draft' || grn.grn_status === 'cancelled') && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => navigate(`/purchase/grn/edit/${grn.grn_id}`)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          )}

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handlePrint(grn.grn_id)}
                          >
                            <Printer className="h-4 w-4" />
                          </Button>

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate(`/purchase/grn/quality/${grn.grn_id}`)}
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {totalPages > 1 && (
          <Pagination>
            <PaginationContent>
              {currentPage > 1 && (
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => setCurrentPage(currentPage - 1)}
                    className="cursor-pointer"
                  />
                </PaginationItem>
              )}
              
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <PaginationItem key={page}>
                  <PaginationLink
                    onClick={() => setCurrentPage(page)}
                    isActive={currentPage === page}
                    className="cursor-pointer"
                  >
                    {page}
                  </PaginationLink>
                </PaginationItem>
              ))}
              
              {currentPage < totalPages && (
                <PaginationItem>
                  <PaginationNext
                    onClick={() => setCurrentPage(currentPage + 1)}
                    className="cursor-pointer"
                  />
                </PaginationItem>
              )}
            </PaginationContent>
          </Pagination>
        )}
      </div>
    </Layout>
  );
};

export default GrnList;
