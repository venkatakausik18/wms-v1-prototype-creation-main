
import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, Save } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import Layout from "@/components/Layout";
import type { Database } from "@/integrations/supabase/types";

type TransactionType = Database["public"]["Enums"]["txn_type"];

interface StockEntryDetail {
  id: string;
  product_id: number;
  product_name: string;
  variant_id?: number;
  uom_id: number;
  quantity: number;
  unit_cost: number;
  total_cost: number;
  bin_id?: number;
  previous_stock: number;
  new_stock: number;
  reason_code: string;
}

interface FormData {
  txn_type: TransactionType;
  txn_date: string;
  txn_time: string;
  warehouse_id: string;
  reference_document: string;
  remarks: string;
}

const StockEntry = () => {
  const navigate = useNavigate();
  const { type } = useParams<{ type: "inward" | "outward" }>();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [formData, setFormData] = useState<FormData>({
    txn_type: type === "inward" ? "purchase_in" : "sale_out",
    txn_date: new Date().toISOString().split('T')[0],
    txn_time: new Date().toTimeString().split(' ')[0].slice(0, 5),
    warehouse_id: "",
    reference_document: "",
    remarks: ""
  });

  const [details, setDetails] = useState<StockEntryDetail[]>([]);

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
    queryKey: ['products-for-stock'],
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

  // Fetch storage bins - simplified query to avoid deep type instantiation
  const { data: bins } = useQuery({
    queryKey: ['storage-bins', formData.warehouse_id],
    queryFn: async () => {
      if (!formData.warehouse_id) return [];
      
      const { data, error } = await supabase
        .from('storage_bins')
        .select('bin_id, bin_code')
        .eq('warehouse_id', formData.warehouse_id)
        .eq('is_active', true)
        .order('bin_code');
      
      if (error) throw error;
      return data;
    },
    enabled: !!formData.warehouse_id,
  });

  const addDetailRow = () => {
    const newRow: StockEntryDetail = {
      id: Date.now().toString(),
      product_id: 0,
      product_name: "",
      variant_id: undefined,
      uom_id: 1,
      quantity: 0,
      unit_cost: 0,
      total_cost: 0,
      bin_id: undefined,
      previous_stock: 0,
      new_stock: 0,
      reason_code: ""
    };
    setDetails([...details, newRow]);
  };

  const removeDetailRow = (id: string) => {
    setDetails(details.filter(detail => detail.id !== id));
  };

  const updateDetail = (id: string, field: keyof StockEntryDetail, value: any) => {
    setDetails(details.map(detail => {
      if (detail.id === id) {
        const updated = { ...detail, [field]: value };
        
        // Calculate total cost
        if (field === 'quantity' || field === 'unit_cost') {
          updated.total_cost = updated.quantity * updated.unit_cost;
        }
        
        // Calculate new stock
        if (field === 'quantity' || field === 'previous_stock') {
          updated.new_stock = type === "inward" 
            ? updated.previous_stock + updated.quantity
            : updated.previous_stock - updated.quantity;
        }
        
        return updated;
      }
      return detail;
    }));
  };

  const calculateTotals = () => {
    const totalItems = details.length;
    const totalQuantity = details.reduce((sum, detail) => sum + detail.quantity, 0);
    const totalValue = details.reduce((sum, detail) => sum + detail.total_cost, 0);
    
    return { totalItems, totalQuantity, totalValue };
  };

  const submitStockEntry = useMutation({
    mutationFn: async () => {
      const { totalItems, totalQuantity, totalValue } = calculateTotals();
      
      // Generate transaction number
      const txnNumber = `TXN-${type?.toUpperCase()}-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${String(Date.now()).slice(-4)}`;

      // Insert main transaction - fixed: remove array brackets and ensure proper typing
      const { data: txnData, error: txnError } = await supabase
        .from('inventory_transactions')
        .insert({
          company_id: 1, // TODO: Get from auth context
          warehouse_id: parseInt(formData.warehouse_id),
          txn_number: txnNumber,
          txn_type: formData.txn_type,
          txn_date: formData.txn_date,
          txn_time: formData.txn_time,
          reference_document: formData.reference_document,
          total_items: totalItems,
          total_quantity: totalQuantity,
          total_value: totalValue,
          remarks: formData.remarks,
          created_by: 1 // TODO: Get from auth context
        })
        .select()
        .single();

      if (txnError) throw txnError;

      // Insert transaction details
      const detailsToInsert = details.map(detail => ({
        txn_id: txnData.txn_id,
        product_id: detail.product_id,
        variant_id: detail.variant_id || null,
        uom_id: detail.uom_id,
        quantity: detail.quantity,
        unit_cost: detail.unit_cost,
        total_cost: detail.total_cost,
        from_warehouse_id: type === "outward" ? parseInt(formData.warehouse_id) : null,
        to_warehouse_id: type === "inward" ? parseInt(formData.warehouse_id) : null,
        bin_id: detail.bin_id || null,
        previous_stock: detail.previous_stock,
        new_stock: detail.new_stock,
        reason_code: detail.reason_code
      }));

      // Insert details - fixed: use proper array insert for multiple records
      const { error: detailsError } = await supabase
        .from('inventory_transaction_details')
        .insert(detailsToInsert);

      if (detailsError) throw detailsError;

      return txnData;
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: `Stock ${type} entry created successfully.`,
      });
      queryClient.invalidateQueries({ queryKey: ['inventory-transactions'] });
      navigate('/inventory');
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to create stock entry: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (details.length === 0) {
      toast({
        title: "Error",
        description: "Please add at least one item to the stock entry.",
        variant: "destructive",
      });
      return;
    }
    setIsSubmitting(true);
    await submitStockEntry.mutateAsync();
    setIsSubmitting(false);
  };

  return (
    <Layout>
      <div className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">
            Stock Entry - {type === "inward" ? "Inward" : "Outward"}
          </h1>
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
              <CardTitle>Transaction Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="txn_date">Date</Label>
                  <Input
                    id="txn_date"
                    type="date"
                    value={formData.txn_date}
                    onChange={(e) => setFormData({ ...formData, txn_date: e.target.value })}
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="txn_time">Time</Label>
                  <Input
                    id="txn_time"
                    type="time"
                    value={formData.txn_time}
                    onChange={(e) => setFormData({ ...formData, txn_time: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="warehouse_id">Warehouse</Label>
                  <Select 
                    value={formData.warehouse_id} 
                    onValueChange={(value) => setFormData({ ...formData, warehouse_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select warehouse" />
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
                  <Label htmlFor="reference_document">Reference Document</Label>
                  <Input
                    id="reference_document"
                    value={formData.reference_document}
                    onChange={(e) => setFormData({ ...formData, reference_document: e.target.value })}
                    placeholder="PO Number, Invoice, etc."
                  />
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="remarks">Remarks</Label>
                  <Input
                    id="remarks"
                    value={formData.remarks}
                    onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                    placeholder="Additional notes..."
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Items Grid */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Items</CardTitle>
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
                      <TableHead>Quantity</TableHead>
                      <TableHead>Unit Cost</TableHead>
                      <TableHead>Total Cost</TableHead>
                      <TableHead>Bin</TableHead>
                      <TableHead>Prev Stock</TableHead>
                      <TableHead>New Stock</TableHead>
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
                            <SelectTrigger className="w-[200px]">
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
                            value={detail.quantity}
                            onChange={(e) => updateDetail(detail.id, 'quantity', parseFloat(e.target.value) || 0)}
                            className="w-20"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            step="0.01"
                            value={detail.unit_cost}
                            onChange={(e) => updateDetail(detail.id, 'unit_cost', parseFloat(e.target.value) || 0)}
                            className="w-24"
                          />
                        </TableCell>
                        <TableCell>
                          <span className="font-medium">₹{detail.total_cost.toFixed(2)}</span>
                        </TableCell>
                        <TableCell>
                          <Select
                            value={detail.bin_id?.toString() || ""}
                            onValueChange={(value) => updateDetail(detail.id, 'bin_id', value ? parseInt(value) : undefined)}
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue placeholder="Select bin" />
                            </SelectTrigger>
                            <SelectContent>
                              {bins?.map((bin) => (
                                <SelectItem key={bin.bin_id} value={bin.bin_id.toString()}>
                                  {bin.bin_code}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            value={detail.previous_stock}
                            onChange={(e) => updateDetail(detail.id, 'previous_stock', parseFloat(e.target.value) || 0)}
                            className="w-20"
                          />
                        </TableCell>
                        <TableCell>
                          <span className="font-medium">{detail.new_stock}</span>
                        </TableCell>
                        <TableCell>
                          <Input
                            value={detail.reason_code}
                            onChange={(e) => updateDetail(detail.id, 'reason_code', e.target.value)}
                            className="w-32"
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
                <CardTitle>Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label>Total Items</Label>
                    <div className="font-medium">{calculateTotals().totalItems}</div>
                  </div>
                  <div>
                    <Label>Total Quantity</Label>
                    <div className="font-medium">{calculateTotals().totalQuantity}</div>
                  </div>
                  <div>
                    <Label>Total Value</Label>
                    <div className="font-medium">₹{calculateTotals().totalValue.toFixed(2)}</div>
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
              {isSubmitting ? "Saving..." : "Save Stock Entry"}
            </Button>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default StockEntry;
