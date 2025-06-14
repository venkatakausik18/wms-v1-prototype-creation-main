
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, Save, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import Layout from "@/components/Layout";

interface TransferDetail {
  id: string;
  product_id: number;
  product_name: string;
  variant_id?: number;
  uom_id: number;
  quantity: number;
  current_stock: number;
  reason_code: string;
}

const StockTransfer = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    transfer_date: new Date().toISOString().split('T')[0],
    transfer_time: new Date().toTimeString().split(' ')[0].slice(0, 5),
    from_warehouse_id: "",
    to_warehouse_id: "",
    reason: ""
  });

  const [details, setDetails] = useState<TransferDetail[]>([]);

  // Fetch warehouses
  const { data: warehouses } = useQuery({
    queryKey: ['warehouses'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('warehouses')
        .select('warehouse_id, warehouse_name')
        .eq('is_active', true)
        .order('warehouse_name');
      
      if (error) throw error;
      return data;
    },
  });

  // Fetch products
  const { data: products } = useQuery({
    queryKey: ['products-for-transfer'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('product_id, product_name, product_code')
        .eq('is_active', true)
        .order('product_name');
      
      if (error) throw error;
      return data;
    },
  });

  const addDetailRow = () => {
    const newRow: TransferDetail = {
      id: Date.now().toString(),
      product_id: 0,
      product_name: "",
      variant_id: undefined,
      uom_id: 1, // Default UOM
      quantity: 0,
      current_stock: 0,
      reason_code: ""
    };
    setDetails([...details, newRow]);
  };

  const removeDetailRow = (id: string) => {
    setDetails(details.filter(detail => detail.id !== id));
  };

  const updateDetail = (id: string, field: keyof TransferDetail, value: any) => {
    setDetails(details.map(detail => {
      if (detail.id === id) {
        return { ...detail, [field]: value };
      }
      return detail;
    }));
  };

  const calculateTotals = () => {
    const totalItems = details.length;
    const totalQuantity = details.reduce((sum, detail) => sum + detail.quantity, 0);
    
    return { totalItems, totalQuantity };
  };

  const submitTransfer = useMutation({
    mutationFn: async () => {
      const { totalItems, totalQuantity } = calculateTotals();
      
      // Generate transfer number
      const transferNumber = `TXN-TRF-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${String(Date.now()).slice(-4)}`;

      // Insert "transfer_out" transaction
      const { data: txnOutData, error: txnOutError } = await supabase
        .from('inventory_transactions')
        .insert([{
          company_id: 1, // TODO: Get from auth context
          warehouse_id: parseInt(formData.from_warehouse_id),
          txn_number: transferNumber,
          txn_type: 'transfer_out',
          txn_date: formData.transfer_date,
          txn_time: formData.transfer_time,
          reference_document: transferNumber,
          total_items: totalItems,
          total_quantity: totalQuantity,
          total_value: 0,
          remarks: formData.reason,
          created_by: 1 // TODO: Get from auth context
        }])
        .select()
        .single();

      if (txnOutError) throw txnOutError;

      // Insert transfer_out details
      const outDetailsToInsert = details.map(detail => ({
        txn_id: txnOutData.txn_id,
        product_id: detail.product_id,
        variant_id: detail.variant_id || null,
        uom_id: detail.uom_id,
        quantity: detail.quantity,
        unit_cost: 0,
        total_cost: 0,
        from_warehouse_id: parseInt(formData.from_warehouse_id),
        to_warehouse_id: null,
        bin_id: null,
        previous_stock: detail.current_stock,
        new_stock: detail.current_stock - detail.quantity,
        reason_code: detail.reason_code
      }));

      const { error: outDetailsError } = await supabase
        .from('inventory_transaction_details')
        .insert(outDetailsToInsert);

      if (outDetailsError) throw outDetailsError;

      // Insert "transfer_in" transaction
      const { data: txnInData, error: txnInError } = await supabase
        .from('inventory_transactions')
        .insert([{
          company_id: 1, // TODO: Get from auth context
          warehouse_id: parseInt(formData.to_warehouse_id),
          txn_number: transferNumber + '-IN',
          txn_type: 'transfer_in',
          txn_date: formData.transfer_date,
          txn_time: formData.transfer_time,
          reference_document: transferNumber,
          total_items: totalItems,
          total_quantity: totalQuantity,
          total_value: 0,
          remarks: formData.reason,
          created_by: 1 // TODO: Get from auth context
        }])
        .select()
        .single();

      if (txnInError) throw txnInError;

      // Insert transfer_in details (assuming 0 previous stock at destination)
      const inDetailsToInsert = details.map(detail => ({
        txn_id: txnInData.txn_id,
        product_id: detail.product_id,
        variant_id: detail.variant_id || null,
        uom_id: detail.uom_id,
        quantity: detail.quantity,
        unit_cost: 0,
        total_cost: 0,
        from_warehouse_id: null,
        to_warehouse_id: parseInt(formData.to_warehouse_id),
        bin_id: null,
        previous_stock: 0, // TODO: Fetch actual stock at destination
        new_stock: detail.quantity, // TODO: Add to actual stock at destination
        reason_code: detail.reason_code
      }));

      const { error: inDetailsError } = await supabase
        .from('inventory_transaction_details')
        .insert(inDetailsToInsert);

      if (inDetailsError) throw inDetailsError;

      return { txnOutData, txnInData };
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Stock transfer completed successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['inventory-transactions'] });
      navigate('/inventory/transactions');
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to complete stock transfer: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.from_warehouse_id || !formData.to_warehouse_id) {
      toast({
        title: "Error",
        description: "Please select both source and destination warehouses.",
        variant: "destructive",
      });
      return;
    }

    if (formData.from_warehouse_id === formData.to_warehouse_id) {
      toast({
        title: "Error",
        description: "Source and destination warehouses must be different.",
        variant: "destructive",
      });
      return;
    }

    if (details.length === 0) {
      toast({
        title: "Error",
        description: "Please add at least one item to transfer.",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    await submitTransfer.mutateAsync();
    setIsSubmitting(false);
  };

  return (
    <Layout>
      <div className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Stock Transfer</h1>
          <Button 
            variant="outline" 
            onClick={() => navigate('/inventory')}
          >
            Back to Inventory
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Header Information */}
          <Card>
            <CardHeader>
              <CardTitle>Transfer Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="transfer_date">Transfer Date</Label>
                  <Input
                    id="transfer_date"
                    type="date"
                    value={formData.transfer_date}
                    onChange={(e) => setFormData({ ...formData, transfer_date: e.target.value })}
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="transfer_time">Transfer Time</Label>
                  <Input
                    id="transfer_time"
                    type="time"
                    value={formData.transfer_time}
                    onChange={(e) => setFormData({ ...formData, transfer_time: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="from_warehouse_id">From Warehouse</Label>
                  <Select 
                    value={formData.from_warehouse_id} 
                    onValueChange={(value) => setFormData({ ...formData, from_warehouse_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select source warehouse" />
                    </SelectTrigger>
                    <SelectContent>
                      {warehouses?.map((warehouse) => (
                        <SelectItem key={warehouse.warehouse_id} value={warehouse.warehouse_id.toString()}>
                          {warehouse.warehouse_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="to_warehouse_id">To Warehouse</Label>
                  <Select 
                    value={formData.to_warehouse_id} 
                    onValueChange={(value) => setFormData({ ...formData, to_warehouse_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select destination warehouse" />
                    </SelectTrigger>
                    <SelectContent>
                      {warehouses?.map((warehouse) => (
                        <SelectItem key={warehouse.warehouse_id} value={warehouse.warehouse_id.toString()}>
                          {warehouse.warehouse_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="md:col-span-2 lg:col-span-4">
                  <Label htmlFor="reason">Transfer Reason</Label>
                  <Input
                    id="reason"
                    value={formData.reason}
                    onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                    placeholder="Reason for stock transfer..."
                    required
                  />
                </div>
              </div>

              {/* Warehouse Direction Indicator */}
              {formData.from_warehouse_id && formData.to_warehouse_id && (
                <div className="mt-4 p-4 bg-blue-50 rounded-lg flex items-center justify-center gap-4">
                  <span className="font-medium">
                    {warehouses?.find(w => w.warehouse_id.toString() === formData.from_warehouse_id)?.warehouse_name}
                  </span>
                  <ArrowRight className="h-5 w-5 text-blue-600" />
                  <span className="font-medium">
                    {warehouses?.find(w => w.warehouse_id.toString() === formData.to_warehouse_id)?.warehouse_name}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Items Grid */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Items to Transfer</CardTitle>
                <Button type="button" onClick={addDetailRow} className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Add Item
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {details.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>Current Stock</TableHead>
                      <TableHead>Transfer Quantity</TableHead>
                      <TableHead>Reason</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {details.map((detail) => (
                      <TableRow key={detail.id}>
                        <TableCell>
                          <Select
                            value={detail.product_id.toString()}
                            onValueChange={(value) => {
                              const product = products?.find(p => p.product_id.toString() === value);
                              updateDetail(detail.id, 'product_id', parseInt(value));
                              updateDetail(detail.id, 'product_name', product?.product_name || '');
                            }}
                          >
                            <SelectTrigger className="w-[250px]">
                              <SelectValue placeholder="Select product" />
                            </SelectTrigger>
                            <SelectContent>
                              {products?.map((product) => (
                                <SelectItem key={product.product_id} value={product.product_id.toString()}>
                                  {product.product_code} - {product.product_name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            value={detail.current_stock}
                            onChange={(e) => updateDetail(detail.id, 'current_stock', parseFloat(e.target.value) || 0)}
                            className="w-24"
                            placeholder="Current"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            value={detail.quantity}
                            onChange={(e) => updateDetail(detail.id, 'quantity', parseFloat(e.target.value) || 0)}
                            className="w-24"
                            placeholder="Qty"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            value={detail.reason_code}
                            onChange={(e) => updateDetail(detail.id, 'reason_code', e.target.value)}
                            className="w-40"
                            placeholder="Reason"
                          />
                        </TableCell>
                        <TableCell>
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            onClick={() => removeDetailRow(detail.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No items added. Click "Add Item" to get started.
                </div>
              )}
            </CardContent>
          </Card>

          {/* Summary */}
          {details.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Transfer Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Total Items</Label>
                    <div className="font-medium text-lg">{calculateTotals().totalItems}</div>
                  </div>
                  <div>
                    <Label>Total Quantity</Label>
                    <div className="font-medium text-lg">{calculateTotals().totalQuantity}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Submit Button */}
          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={() => navigate('/inventory')}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || details.length === 0}>
              <Save className="h-4 w-4 mr-2" />
              {isSubmitting ? "Processing Transfer..." : "Complete Transfer"}
            </Button>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default StockTransfer;
