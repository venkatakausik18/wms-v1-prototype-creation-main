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
import { Plus, Search, Edit, Eye, FileText, Copy, Package } from "lucide-react";
import Layout from "@/components/Layout";
import { toast } from "sonner";

interface PurchaseOrder {
  po_id: number;
  po_number: string;
  po_date: string;
  vendor_id: number;
  warehouse_id: number;
  total_amount: number;
  po_status: string;
  approval_status: string;
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

const PurchaseOrderList = () => {
  const navigate = useNavigate();
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedVendor, setSelectedVendor] = useState<string>("all");
  const [selectedWarehouse, setSelectedWarehouse] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedApprovalStatus, setSelectedApprovalStatus] = useState<string>("all");
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchPurchaseOrders();
    fetchVendors();
    fetchWarehouses();
  }, [currentPage, searchTerm, selectedVendor, selectedWarehouse, selectedStatus, selectedApprovalStatus]);

  const fetchPurchaseOrders = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('purchase_orders')
        .select(`
          po_id,
          po_number,
          po_date,
          vendor_id,
          warehouse_id,
          total_amount,
          po_status,
          approval_status
        `)
        .order('po_date', { ascending: false });

      // Apply filters
      if (searchTerm) {
        query = query.ilike('po_number', `%${searchTerm}%`);
      }
      if (selectedVendor && selectedVendor !== "all") {
        query = query.eq('vendor_id', parseInt(selectedVendor));
      }
      if (selectedWarehouse && selectedWarehouse !== "all") {
        query = query.eq('warehouse_id', parseInt(selectedWarehouse));
      }
      if (selectedStatus && selectedStatus !== "all") {
        query = query.eq('po_status', selectedStatus as any);
      }
      if (selectedApprovalStatus && selectedApprovalStatus !== "all") {
        query = query.eq('approval_status', selectedApprovalStatus as any);
      }

      // Count total records for pagination
      const { count } = await supabase
        .from('purchase_orders')
        .select('*', { count: 'exact', head: true });
      
      if (count) {
        setTotalPages(Math.ceil(count / itemsPerPage));
      }

      // Fetch paginated results
      const { data, error } = await query
        .range((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage - 1);

      if (error) throw error;

      // Fetch vendor and warehouse names
      const enrichedData = await Promise.all(
        (data || []).map(async (po) => {
          const [vendorResult, warehouseResult] = await Promise.all([
            supabase.from('vendors').select('vendor_name').eq('vendor_id', po.vendor_id).single(),
            supabase.from('warehouses').select('warehouse_name').eq('warehouse_id', po.warehouse_id).single()
          ]);

          return {
            ...po,
            vendor_name: vendorResult.data?.vendor_name || 'Unknown',
            warehouse_name: warehouseResult.data?.warehouse_name || 'Unknown'
          };
        })
      );

      setPurchaseOrders(enrichedData);
    } catch (error) {
      console.error('Error fetching purchase orders:', error);
      toast.error('Failed to fetch purchase orders');
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
      console.log('Fetched vendors:', data);
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
      console.log('Fetched warehouses:', data);
      setWarehouses(data || []);
    } catch (error) {
      console.error('Error fetching warehouses:', error);
    }
  };

  const handleSubmitForApproval = async (poId: number) => {
    try {
      const { error } = await supabase
        .from('purchase_orders')
        .update({ po_status: 'pending_approval' as const })
        .eq('po_id', poId);

      if (error) throw error;

      toast.success('Purchase order submitted for approval');
      fetchPurchaseOrders();
    } catch (error) {
      console.error('Error submitting for approval:', error);
      toast.error('Failed to submit for approval');
    }
  };

  const handleDuplicate = async (poId: number) => {
    navigate(`/purchase/orders/add?duplicate=${poId}`);
  };

  const handleConvertToGRN = (poId: number) => {
    navigate(`/purchase/grn/add?po_id=${poId}`);
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      draft: "bg-gray-100 text-gray-800",
      pending_approval: "bg-yellow-100 text-yellow-800",
      approved: "bg-green-100 text-green-800",
      rejected: "bg-red-100 text-red-800",
      partially_received: "bg-blue-100 text-blue-800",
      completed: "bg-purple-100 text-purple-800",
      cancelled: "bg-gray-100 text-gray-800"
    };
    
    return (
      <Badge className={colors[status as keyof typeof colors] || "bg-gray-100 text-gray-800"}>
        {status.replace('_', ' ').toUpperCase()}
      </Badge>
    );
  };

  const getApprovalStatusBadge = (status: string) => {
    const colors = {
      pending: "bg-yellow-100 text-yellow-800",
      approved: "bg-green-100 text-green-800",
      rejected: "bg-red-100 text-red-800"
    };
    
    return (
      <Badge className={colors[status as keyof typeof colors] || "bg-gray-100 text-gray-800"}>
        {status.toUpperCase()}
      </Badge>
    );
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Purchase Orders</h1>
            <p className="text-muted-foreground">Manage your purchase orders</p>
          </div>
          <Button onClick={() => navigate('/purchase/orders/add')}>
            <Plus className="h-4 w-4 mr-2" />
            Add Purchase Order
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by PO number..."
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
                  <SelectItem value="pending_approval">Pending Approval</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="partially_received">Partially Received</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>

              <Select value={selectedApprovalStatus} onValueChange={setSelectedApprovalStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="All Approval Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Approval Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
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
                  <TableHead>PO Number</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Vendor</TableHead>
                  <TableHead>Warehouse</TableHead>
                  <TableHead>Total Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Approval</TableHead>
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
                ) : purchaseOrders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      No purchase orders found
                    </TableCell>
                  </TableRow>
                ) : (
                  purchaseOrders.map((po) => (
                    <TableRow key={po.po_id}>
                      <TableCell className="font-medium">{po.po_number}</TableCell>
                      <TableCell>{new Date(po.po_date).toLocaleDateString()}</TableCell>
                      <TableCell>{po.vendor_name}</TableCell>
                      <TableCell>{po.warehouse_name}</TableCell>
                      <TableCell>₹{po.total_amount?.toLocaleString()}</TableCell>
                      <TableCell>{getStatusBadge(po.po_status)}</TableCell>
                      <TableCell>{getApprovalStatusBadge(po.approval_status)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate(`/purchase/orders/view/${po.po_id}`)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          
                          {(po.po_status === 'draft' || po.po_status === 'rejected') && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => navigate(`/purchase/orders/edit/${po.po_id}`)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          )}

                          {po.po_status === 'draft' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleSubmitForApproval(po.po_id)}
                            >
                              <FileText className="h-4 w-4" />
                            </Button>
                          )}

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDuplicate(po.po_id)}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>

                          {po.po_status === 'approved' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleConvertToGRN(po.po_id)}
                            >
                              <Package className="h-4 w-4" />
                            </Button>
                          )}
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

export default PurchaseOrderList;
