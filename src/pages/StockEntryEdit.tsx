import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { ArrowLeft, Plus, Trash2, Save } from "lucide-react";
import ProductSelector from "@/components/inventory/ProductSelector";

type InwardTransactionType = 'purchase_in' | 'purchase_return_in' | 'transfer_in' | 'adjustment_in';

interface StockEntryLine {
  id: string;
  product_id: number;
  variant_id?: number;
  product_code: string;
  product_name: string;
  variant_name?: string;
  uom_id: number;
  uom_name: string;
  quantity: number;
  unit_cost: number;
  total_cost: number;
  bin_id?: number;
  bin_code?: string;
  previous_stock: number;
  new_stock: number;
  reason_code?: string;
}

interface Warehouse {
  warehouse_id: number;
  warehouse_name: string;
}

interface StorageBin {
  bin_id: number;
  bin_code: string;
}

const StockEntryEdit = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { txnId } = useParams();
  const isEdit = Boolean(txnId);
  
  const [formData, setFormData] = useState({
    txn_number: '',
    txn_type: 'purchase_in' as InwardTransactionType,
    txn_date: new Date().toISOString().split('T')[0],
    txn_time: new Date().toTimeString().slice(0, 5),
    warehouse_id: '',
    reference_document: '',
    remarks: ''
  });
  
  const [lines, setLines] = useState<StockEntryLine[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [storageBins, setStorageBins] = useState<StorageBin[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) {
      fetchWarehouses();
      if (isEdit) {
        fetchStockEntry();
      } else {
        generateTransactionNumber();
      }
    }
  }, [user, isEdit]);

  useEffect(() => {
    if (formData.warehouse_id) {
      fetchStorageBins(parseInt(formData.warehouse_id));
    }
  }, [formData.warehouse_id]);

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
      toast.error('Failed to fetch warehouses');
    }
  };

  const fetchStorageBins = async (warehouseId: number) => {
    try {
      const { data, error } = await supabase
        .from('storage_bins')
        .select(`
          bin_id,
          bin_code,
          warehouse_zones!zone_id(warehouse_id)
        `)
        .eq('is_active', true)
        .order('bin_code');

      if (error) throw error;
      
      const filteredBins = data?.filter(
        bin => (bin.warehouse_zones as any)?.warehouse_id === warehouseId
      ) || [];
      
      setStorageBins(filteredBins.map(bin => ({
        bin_id: bin.bin_id,
        bin_code: bin.bin_code
      })));
    } catch (error) {
      console.error('Error fetching storage bins:', error);
      setStorageBins([]);
    }
  };

  const generateTransactionNumber = async () => {
    try {
      const { data, error } = await supabase
        .from('inventory_transactions')
        .select('txn_number')
        .like('txn_number', 'SE%')
        .order('created_at', { ascending: false })
        .limit(1);

      if (error) throw error;
      
      const lastNumber = data?.[0]?.txn_number;
      let nextNumber = 1;
      
      if (lastNumber) {
        const match = lastNumber.match(/SE(\d+)/);
        if (match) {
          nextNumber = parseInt(match[1]) + 1;
        }
      }
      
      setFormData(prev => ({
        ...prev,
        txn_number: `SE${nextNumber.toString().padStart(6, '0')}`
      }));
    } catch (error) {
      console.error('Error generating transaction number:', error);
      setFormData(prev => ({
        ...prev,
        txn_number: `SE${Date.now().toString().slice(-6)}`
      }));
    }
  };

  const fetchStockEntry = async () => {
    if (!txnId) return;
    
    setIsLoading(true);
    try {
      const { data: transaction, error: txnError } = await supabase
        .from('inventory_transactions')
        .select('*')
        .eq('txn_id', parseInt(txnId))
        .single();

      if (txnError) throw txnError;

      setFormData({
        txn_number: transaction.txn_number,
        txn_type: transaction.txn_type as InwardTransactionType,
        txn_date: transaction.txn_date,
        txn_time: transaction.txn_time,
        warehouse_id: transaction.warehouse_id.toString(),
        reference_document: transaction.reference_document || '',
        remarks: transaction.remarks || ''
      });

      const { data: details, error: detailsError } = await supabase
        .from('inventory_transaction_details')
        .select(`
          *,
          products!product_id(product_code, product_name),
          product_variants!variant_id(variant_name),
          units_of_measure!uom_id(uom_name),
          storage_bins!bin_id(bin_code)
        `)
        .eq('txn_id', parseInt(txnId))
        .order('itd_id');

      if (detailsError) throw detailsError;

      const transformedLines = details?.map((detail, index) => ({
        id: `line-${index}`,
        product_id: detail.product_id,
        variant_id: detail.variant_id,
        product_code: (detail.products as any)?.product_code || '',
        product_name: (detail.products as any)?.product_name || '',
        variant_name: (detail.product_variants as any)?.variant_name,
        uom_id: detail.uom_id,
        uom_name: (detail.units_of_measure as any)?.uom_name || '',
        quantity: detail.quantity,
        unit_cost: detail.unit_cost || 0,
        total_cost: detail.total_cost || 0,
        bin_id: detail.bin_id,
        bin_code: (detail.storage_bins as any)?.bin_code,
        previous_stock: detail.previous_stock || 0,
        new_stock: detail.new_stock || 0,
        reason_code: detail.reason_code || ''
      })) || [];

      setLines(transformedLines);
    } catch (error) {
      console.error('Error fetching stock entry:', error);
      toast.error('Failed to fetch stock entry details');
    } finally {
      setIsLoading(false);
    }
  };

  const addLine = () => {
    const newLine: StockEntryLine = {
      id: `line-${Date.now()}`,
      product_id: 0,
      product_code: '',
      product_name: '',
      uom_id: 0,
      uom_name: '',
      quantity: 0,
      unit_cost: 0,
      total_cost: 0,
      previous_stock: 0,
      new_stock: 0,
      reason_code: ''
    };
    setLines([...lines, newLine]);
  };

  const removeLine = (id: string) => {
    setLines(lines.filter(line => line.id !== id));
  };

  const updateLine = (id: string, field: keyof StockEntryLine, value: any) => {
    setLines(lines.map(line => {
      if (line.id === id) {
        const updatedLine = { ...line, [field]: value };
        
        if (field === 'quantity' || field === 'unit_cost') {
          updatedLine.total_cost = updatedLine.quantity * updatedLine.unit_cost;
          updatedLine.new_stock = updatedLine.previous_stock + updatedLine.quantity;
        }
        
        return updatedLine;
      }
      return line;
    }));
  };

  const handleProductSelect = (lineId: string, product: any, variant?: any) => {
    const updatedLines = lines.map(line => {
      if (line.id === lineId) {
        return {
          ...line,
          product_id: product.product_id,
          variant_id: variant?.variant_id,
          product_code: product.product_code,
          product_name: product.product_name,
          variant_name: variant?.variant_name,
          uom_id: product.base_uom_id,
          uom_name: product.uom?.uom_name || ''
        };
      }
      return line;
    });
    setLines(updatedLines);
  };

  const calculateTotals = () => {
    const totalItems = lines.length;
    const totalQuantity = lines.reduce((sum, line) => sum + line.quantity, 0);
    const totalValue = lines.reduce((sum, line) => sum + line.total_cost, 0);
    
    return { totalItems, totalQuantity, totalValue };
  };

  const handleSave = async () => {
    if (!formData.warehouse_id || lines.length === 0) {
      toast.error('Please fill all required fields and add at least one item');
      return;
    }

    setIsSaving(true);
    try {
      const { totalItems, totalQuantity, totalValue } = calculateTotals();
      
      if (isEdit) {
        // Update existing transaction
        const { error: updateError } = await supabase
          .from('inventory_transactions')
          .update({
            txn_type: formData.txn_type,
            txn_date: formData.txn_date,
            txn_time: formData.txn_time,
            warehouse_id: parseInt(formData.warehouse_id),
            reference_document: formData.reference_document,
            total_items: totalItems,
            total_quantity: totalQuantity,
            total_value: totalValue,
            remarks: formData.remarks,
            updated_at: new Date().toISOString()
          })
          .eq('txn_id', parseInt(txnId!));

        if (updateError) throw updateError;

        // Delete existing details
        const { error: deleteError } = await supabase
          .from('inventory_transaction_details')
          .delete()
          .eq('txn_id', parseInt(txnId!));

        if (deleteError) throw deleteError;

        // Insert new details
        const detailsToInsert = lines.map(line => ({
          txn_id: parseInt(txnId!),
          product_id: line.product_id,
          variant_id: line.variant_id || null,
          uom_id: line.uom_id,
          quantity: line.quantity,
          unit_cost: line.unit_cost,
          total_cost: line.total_cost,
          to_warehouse_id: parseInt(formData.warehouse_id),
          bin_id: line.bin_id || null,
          previous_stock: line.previous_stock,
          new_stock: line.new_stock,
          reason_code: line.reason_code
        }));

        const { error: insertError } = await supabase
          .from('inventory_transaction_details')
          .insert(detailsToInsert);

        if (insertError) throw insertError;
      } else {
        // Create new transaction
        const { data: newTransaction, error: insertError } = await supabase
          .from('inventory_transactions')
          .insert([{
            company_id: 1, // TODO: Get from user context
            warehouse_id: parseInt(formData.warehouse_id),
            txn_number: formData.txn_number,
            txn_type: formData.txn_type,
            txn_date: formData.txn_date,
            txn_time: formData.txn_time,
            reference_document: formData.reference_document,
            total_items: totalItems,
            total_quantity: totalQuantity,
            total_value: totalValue,
            remarks: formData.remarks,
            created_by: 1 // TODO: Get from user context
          }])
          .select()
          .single();

        if (insertError) throw insertError;

        const detailsToInsert = lines.map(line => ({
          txn_id: newTransaction.txn_id,
          product_id: line.product_id,
          variant_id: line.variant_id || null,
          uom_id: line.uom_id,
          quantity: line.quantity,
          unit_cost: line.unit_cost,
          total_cost: line.total_cost,
          to_warehouse_id: parseInt(formData.warehouse_id),
          bin_id: line.bin_id || null,
          previous_stock: line.previous_stock,
          new_stock: line.new_stock,
          reason_code: line.reason_code
        }));

        const { error: detailsError } = await supabase
          .from('inventory_transaction_details')
          .insert(detailsToInsert);

        if (detailsError) throw detailsError;
      }

      toast.success(`Stock entry ${isEdit ? 'updated' : 'created'} successfully`);
      navigate('/inventory/stock-entry/list');
    } catch (error) {
      console.error('Error saving stock entry:', error);
      toast.error(`Failed to ${isEdit ? 'update' : 'create'} stock entry`);
    } finally {
      setIsSaving(false);
    }
  };

  const { totalItems, totalQuantity, totalValue } = calculateTotals();

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={() => navigate('/inventory/stock-entry/list')}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div className="flex-1">
                <CardTitle>{isEdit ? 'Edit' : 'New'} Stock Entry</CardTitle>
                <CardDescription>
                  {isEdit ? 'Update' : 'Create'} inward stock transaction
                </CardDescription>
              </div>
              <Button onClick={handleSave} disabled={isSaving || isLoading}>
                <Save className="mr-2 h-4 w-4" />
                {isSaving ? 'Saving...' : 'Save'}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">Loading...</div>
            ) : (
              <div className="space-y-6">
                {/* Header Form */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="txn_number">Transaction Number</Label>
                    <Input
                      id="txn_number"
                      value={formData.txn_number}
                      readOnly
                      className="bg-muted"
                    />
                  </div>
                  <div>
                    <Label htmlFor="txn_type">Entry Type</Label>
                    <Select value={formData.txn_type} onValueChange={(value) => setFormData({...formData, txn_type: value as InwardTransactionType})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="purchase_in">Purchase In</SelectItem>
                        <SelectItem value="purchase_return_in">Purchase Return In</SelectItem>
                        <SelectItem value="transfer_in">Transfer In</SelectItem>
                        <SelectItem value="adjustment_in">Adjustment In</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="warehouse_id">Warehouse</Label>
                    <Select value={formData.warehouse_id} onValueChange={(value) => setFormData({...formData, warehouse_id: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select warehouse" />
                      </SelectTrigger>
                      <SelectContent>
                        {warehouses.map((warehouse) => (
                          <SelectItem key={warehouse.warehouse_id} value={warehouse.warehouse_id.toString()}>
                            {warehouse.warehouse_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="txn_date">Date</Label>
                    <Input
                      id="txn_date"
                      type="date"
                      value={formData.txn_date}
                      onChange={(e) => setFormData({...formData, txn_date: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="txn_time">Time</Label>
                    <Input
                      id="txn_time"
                      type="time"
                      value={formData.txn_time}
                      onChange={(e) => setFormData({...formData, txn_time: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="reference_document">Reference Document</Label>
                    <Input
                      id="reference_document"
                      value={formData.reference_document}
                      onChange={(e) => setFormData({...formData, reference_document: e.target.value})}
                      placeholder="PO/GRN reference"
                    />
                  </div>
                </div>

                {/* Items Table */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium">Items</h3>
                    <Button onClick={addLine} size="sm">
                      <Plus className="mr-2 h-4 w-4" />
                      Add Item
                    </Button>
                  </div>
                  
                  <div className="border rounded-md">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Product</TableHead>
                          <TableHead>Quantity</TableHead>
                          <TableHead>Unit Cost</TableHead>
                          <TableHead>Total Cost</TableHead>
                          <TableHead>Bin Location</TableHead>
                          <TableHead>Previous Stock</TableHead>
                          <TableHead>New Stock</TableHead>
                          <TableHead>Remarks</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {lines.map((line) => (
                          <TableRow key={line.id}>
                            <TableCell className="min-w-[300px]">
                              <ProductSelector
                                onSelect={(product, variant) => handleProductSelect(line.id, product, variant)}
                                selectedProduct={line.product_id ? { 
                                  product_id: line.product_id, 
                                  product_code: line.product_code, 
                                  product_name: line.product_name,
                                  base_uom_id: line.uom_id
                                } : undefined}
                                selectedVariant={line.variant_id ? {
                                  variant_id: line.variant_id,
                                  variant_code: '',
                                  variant_name: line.variant_name || ''
                                } : undefined}
                              />
                            </TableCell>
                            <TableCell>
                              <Input
                                type="number"
                                value={line.quantity}
                                onChange={(e) => updateLine(line.id, 'quantity', parseFloat(e.target.value) || 0)}
                                className="w-24"
                              />
                            </TableCell>
                            <TableCell>
                              <Input
                                type="number"
                                step="0.01"
                                value={line.unit_cost}
                                onChange={(e) => updateLine(line.id, 'unit_cost', parseFloat(e.target.value) || 0)}
                                className="w-24"
                              />
                            </TableCell>
                            <TableCell>
                              <Input
                                value={line.total_cost.toFixed(2)}
                                readOnly
                                className="w-24 bg-muted"
                              />
                            </TableCell>
                            <TableCell>
                              <Select value={line.bin_id?.toString() || ''} onValueChange={(value) => {
                                const bin = storageBins.find(b => b.bin_id.toString() === value);
                                updateLine(line.id, 'bin_id', bin?.bin_id);
                                updateLine(line.id, 'bin_code', bin?.bin_code);
                              }}>
                                <SelectTrigger className="w-32">
                                  <SelectValue placeholder="Select bin" />
                                </SelectTrigger>
                                <SelectContent>
                                  {storageBins.map((bin) => (
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
                                value={line.previous_stock}
                                onChange={(e) => updateLine(line.id, 'previous_stock', parseFloat(e.target.value) || 0)}
                                className="w-24"
                              />
                            </TableCell>
                            <TableCell>
                              <Input
                                value={line.new_stock}
                                readOnly
                                className="w-24 bg-muted"
                              />
                            </TableCell>
                            <TableCell>
                              <Input
                                value={line.reason_code || ''}
                                onChange={(e) => updateLine(line.id, 'reason_code', e.target.value)}
                                className="w-32"
                                placeholder="Reason"
                              />
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeLine(line.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                        {lines.length === 0 && (
                          <TableRow>
                            <TableCell colSpan={9} className="text-center py-8">
                              No items added. Click "Add Item" to start.
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </div>

                {/* Summary */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-muted rounded-md">
                  <div>
                    <Label>Total Items</Label>
                    <div className="text-lg font-semibold">{totalItems}</div>
                  </div>
                  <div>
                    <Label>Total Quantity</Label>
                    <div className="text-lg font-semibold">{totalQuantity}</div>
                  </div>
                  <div>
                    <Label>Total Value</Label>
                    <div className="text-lg font-semibold">₹{totalValue.toFixed(2)}</div>
                  </div>
                  <div className="md:col-span-1">
                    <Label htmlFor="remarks">Remarks</Label>
                    <Textarea
                      id="remarks"
                      value={formData.remarks}
                      onChange={(e) => setFormData({...formData, remarks: e.target.value})}
                      rows={2}
                      placeholder="Additional remarks..."
                    />
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default StockEntryEdit;
