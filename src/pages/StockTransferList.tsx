
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Eye, Edit, Trash2 } from "lucide-react";
import { formatCurrency, formatNumber } from "@/utils/currency";
import type { StockTransfer } from "@/components/inventory/transfer/types";

const StockTransferList: React.FC = () => {
  const navigate = useNavigate();
  const [transfers, setTransfers] = useState<StockTransfer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTransfers();
  }, []);

  const fetchTransfers = async () => {
    try {
      const { data, error } = await supabase
        .from('stock_transfers')
        .select(`
          *,
          from_warehouse:warehouses!from_warehouse_id(warehouse_code, warehouse_name),
          to_warehouse:warehouses!to_warehouse_id(warehouse_code, warehouse_name)
        `)
        .eq('company_id', 1)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setTransfers(data || []);
    } catch (error) {
      console.error('Error fetching transfers:', error);
      toast.error('Failed to fetch transfers');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'draft': return 'secondary';
      case 'pending_approval': return 'outline';
      case 'approved': return 'default';
      case 'in_transit': return 'secondary';
      case 'partially_received': return 'outline';
      case 'completed': return 'default';
      case 'cancelled': return 'destructive';
      default: return 'secondary';
    }
  };

  const handleDelete = async (transferId: number) => {
    if (!confirm('Are you sure you want to delete this transfer?')) return;

    try {
      const { error } = await supabase
        .from('stock_transfers')
        .delete()
        .eq('transfer_id', transferId);

      if (error) throw error;

      toast.success('Transfer deleted successfully');
      fetchTransfers();
    } catch (error) {
      console.error('Error deleting transfer:', error);
      toast.error('Failed to delete transfer');
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-6">
        <div className="text-center">Loading transfers...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Stock Transfers</h1>
        <Button onClick={() => navigate('/inventory/transfer/new')}>
          <Plus className="h-4 w-4 mr-2" />
          New Transfer
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Transfer History</CardTitle>
        </CardHeader>
        <CardContent>
          {transfers.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No transfers found. Create your first transfer to get started.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Transfer #</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>From Warehouse</TableHead>
                  <TableHead>To Warehouse</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Total Value</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transfers.map((transfer) => (
                  <TableRow key={transfer.transfer_id}>
                    <TableCell className="font-medium">
                      {transfer.transfer_number}
                    </TableCell>
                    <TableCell>
                      {new Date(transfer.transfer_date).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {(transfer as any).from_warehouse?.warehouse_code} - {(transfer as any).from_warehouse?.warehouse_name}
                    </TableCell>
                    <TableCell>
                      {(transfer as any).to_warehouse?.warehouse_code} - {(transfer as any).to_warehouse?.warehouse_name}
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(transfer.transfer_status)}>
                        {transfer.transfer_status.replace('_', ' ').toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {transfer.priority_level.toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell>{transfer.total_items}</TableCell>
                    <TableCell>{formatCurrency(transfer.total_value)}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/inventory/transfer/view/${transfer.transfer_id}`)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/inventory/transfer/edit/${transfer.transfer_id}`)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(transfer.transfer_id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default StockTransferList;
