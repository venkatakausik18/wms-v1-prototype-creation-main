
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { ArrowLeft, Plus, Trash2, Package, AlertTriangle, Scan, List } from "lucide-react";
import ProductSelector from "./ProductSelector";
import { validateStockTransaction } from "@/services/stockValidation";
import { formatCurrency, formatNumber } from "@/utils/currency";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { getActiveReservations, createReservation } from "@/services/stockReservation";
import { getAvailableSerialNumbers, updateSerialNumberStatus } from "@/services/serialNumberTracking";
import { createPickList, type PickListDetail } from "@/services/pickListService";
import { createQCHold, getActiveQCHolds } from "@/services/qualityControlService";
import { createDamageAssessment } from "@/services/damageAssessmentService";

interface StockEntryDetail {
  product_id?: number;
  variant_id?: number;
  quantity: number;
  unit_cost: number;
  total_cost: number;
  uom_id?: number;
  bin_id?: number;
  reason_code?: string;
  previous_stock: number;
  new_stock: number;
  product?: any;
  variant?: any;
  uom?: any;
  batch_number?: string;
  expiry_date?: string;
  manufacturing_date?: string;
  serial_numbers?: string[];
  quality_status?: string;
  reservation_id?: number;
}

const StockEntryOutward = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [storageBins, setStorageBins] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState("entry");

  // Form state
  const [formData, setFormData] = useState({
    txn_number: '',
    txn_type: 'sale_out' as const,
    txn_date: new Date().toISOString().split('T')[0],
    txn_time: new Date().toTimeString().slice(0, 5),
    warehouse_id: '',
    reference_document: '',
    remarks: ''
  });

  const [details, setDetails] = useState<StockEntryDetail[]>([{
    quantity: 0,
    unit_cost: 0,
    total_cost: 0,
    previous_stock: 0,
    new_stock: 0,
    quality_status: 'approved'
  }]);

  // Enhanced state for outward features
  const [reservations, setReservations] = useState<any[]>([]);
  const [availableSerials, setAvailableSerials] = useState<any[]>([]);
  const [qcHolds, setQcHolds] = useState<any[]>([]);
  const [pickListData, setPickListData] = useState<PickListDetail[]>([]);
  const [showReservationDialog, setShowReservationDialog] = useState(false);
  const [showDamageAssessment, setShowDamageAssessment] = useState(false);

  useEffect(() => {
    fetchWarehouses();
    if (id && id !== 'new') {
      fetchStockEntry();
    } else {
      generateTransactionNumber();
    }
  }, [id]);

  const fetchWarehouses = async () => {
    try {
      const { data, error } = await supabase
        .from('warehouses')
        .select('warehouse_id, warehouse_code, warehouse_name')
        .eq('is_active', true)
        .order('warehouse_name');

      if (error) throw error;
      setWarehouses(data || []);
    } catch (error) {
      console.error('Error fetching warehouses:', error);
      toast.error('Failed to fetch warehouses');
    }
  };

  const fetchStorageBins = async (warehouseId: string) => {
    if (!warehouseId) return;
    
    try {
      const { data, error } = await supabase
        .from('storage_bins')
        .select('bin_id, bin_code, bin_name')
        .eq('warehouse_id', parseInt(warehouseId))
        .eq('is_active', true)
        .order('bin_name');

      if (error) throw error;
      setStorageBins(data || []);
    } catch (error) {
      console.error('Error fetching storage bins:', error);
    }
  };

  const generateTransactionNumber = async () => {
    const prefix = 'OUT';
    const timestamp = Date.now();
    setFormData(prev => ({
      ...prev,
      txn_number: `${prefix}-${timestamp}`
    }));
  };

  const fetchStockEntry = async () => {
    // Implementation for editing existing entries
    // Similar to StockEntryEdit but for outward transactions
  };

  const handleProductSelect = async (product: any, variant?: any, index: number = 0) => {
    const newDetails = [...details];
    newDetails[index] = {
      ...newDetails[index],
      product_id: product.product_id,
      variant_id: variant?.variant_id,
      product,
      variant,
      uom_id: product.base_uom_id,
      uom: product.uom
    };

    // Fetch current stock and reservations
    if (formData.warehouse_id) {
      await fetchProductStockInfo(product.product_id, parseInt(formData.warehouse_id), variant?.variant_id, index);
    }

    setDetails(newDetails);
  };

  const fetchProductStockInfo = async (
    productId: number,
    warehouseId: number,
    variantId?: number,
    index: number = 0
  ) => {
    try {
      // Get current stock validation
      const stockValidation = await validateStockTransaction(
        productId,
        warehouseId,
        0, // We'll calculate quantity later
        formData.txn_type,
        variantId
      );

      // Get reservations
      const reservationData = await getActiveReservations(productId, warehouseId, variantId);
      
      // Get available serial numbers for serialized products
      const serialData = await getAvailableSerialNumbers(productId, warehouseId, variantId);
      
      // Get QC holds
      const qcData = await getActiveQCHolds(productId, warehouseId);

      const newDetails = [...details];
      newDetails[index] = {
        ...newDetails[index],
        previous_stock: stockValidation.availableStock
      };

      setDetails(newDetails);
      setReservations(reservationData);
      setAvailableSerials(serialData);
      setQcHolds(qcData);

    } catch (error) {
      console.error('Error fetching product stock info:', error);
      toast.error('Failed to fetch stock information');
    }
  };

  const handleQuantityChange = async (index: number, quantity: number) => {
    const newDetails = [...details];
    const detail = newDetails[index];

    if (!detail.product_id || !formData.warehouse_id) {
      toast.error('Please select product and warehouse first');
      return;
    }

    // Validate stock availability
    const validation = await validateStockTransaction(
      detail.product_id,
      parseInt(formData.warehouse_id),
      quantity,
      formData.txn_type,
      detail.variant_id
    );

    if (!validation.isValid) {
      toast.error(validation.message);
      return;
    }

    detail.quantity = quantity;
    detail.total_cost = quantity * detail.unit_cost;
    detail.new_stock = detail.previous_stock - quantity;

    setDetails(newDetails);
  };

  const handleGeneratePickList = async () => {
    if (!formData.warehouse_id) {
      toast.error('Please select a warehouse first');
      return;
    }

    const pickItems: PickListDetail[] = details
      .filter(d => d.product_id && d.quantity > 0)
      .map(d => ({
        product_id: d.product_id!,
        variant_id: d.variant_id,
        warehouse_id: parseInt(formData.warehouse_id),
        bin_id: d.bin_id,
        required_quantity: d.quantity,
        picked_quantity: 0,
        uom_id: d.uom_id!,
        status: 'pending' as const,
        product: d.product,
        variant: d.variant,
        uom: d.uom
      }));

    try {
      const pickList = await createPickList(parseInt(formData.warehouse_id), pickItems);
      if (pickList) {
        setPickListData(pickItems);
        toast.success('Pick list generated successfully');
        setActiveTab("picklist");
      }
    } catch (error) {
      console.error('Error generating pick list:', error);
      toast.error('Failed to generate pick list');
    }
  };

  const handleSave = async () => {
    if (!formData.warehouse_id) {
      toast.error('Please select a warehouse');
      return;
    }

    if (details.length === 0 || !details.some(d => d.product_id && d.quantity > 0)) {
      toast.error('Please add at least one item');
      return;
    }

    setLoading(true);

    try {
      // Create inventory transaction
      const { data: transaction, error: txnError } = await supabase
        .from('inventory_transactions')
        .insert({
          company_id: 1,
          warehouse_id: parseInt(formData.warehouse_id),
          txn_number: formData.txn_number,
          txn_type: formData.txn_type,
          txn_date: formData.txn_date,
          txn_time: formData.txn_time,
          reference_document: formData.reference_document,
          remarks: formData.remarks,
          total_items: details.filter(d => d.product_id).length,
          total_quantity: details.reduce((sum, d) => sum + d.quantity, 0),
          total_value: details.reduce((sum, d) => sum + d.total_cost, 0),
          created_by: 1
        })
        .select()
        .single();

      if (txnError) throw txnError;

      // Create transaction details
      const transactionDetails = details
        .filter(d => d.product_id && d.quantity > 0)
        .map(d => ({
          txn_id: transaction.txn_id,
          product_id: d.product_id!,
          variant_id: d.variant_id,
          uom_id: d.uom_id!,
          quantity: d.quantity,
          unit_cost: d.unit_cost,
          total_cost: d.total_cost,
          from_warehouse_id: parseInt(formData.warehouse_id),
          bin_id: d.bin_id,
          reason_code: d.reason_code,
          previous_stock: d.previous_stock,
          new_stock: d.new_stock,
          batch_number: d.batch_number,
          expiry_date: d.expiry_date,
          manufacturing_date: d.manufacturing_date,
          serial_numbers: d.serial_numbers,
          quality_status: d.quality_status,
          reservation_id: d.reservation_id
        }));

      const { error: detailsError } = await supabase
        .from('inventory_transaction_details')
        .insert(transactionDetails);

      if (detailsError) throw detailsError;

      // Update serial number statuses if applicable
      for (const detail of details) {
        if (detail.serial_numbers && detail.serial_numbers.length > 0) {
          await updateSerialNumberStatus(
            detail.serial_numbers,
            'sold',
            transaction.txn_id
          );
        }
      }

      toast.success('Stock entry (outward) saved successfully');
      navigate('/inventory/stock-entry');
    } catch (error) {
      console.error('Error saving stock entry:', error);
      toast.error('Failed to save stock entry');
    } finally {
      setLoading(false);
    }
  };

  const addNewItem = () => {
    setDetails([...details, {
      quantity: 0,
      unit_cost: 0,
      total_cost: 0,
      previous_stock: 0,
      new_stock: 0,
      quality_status: 'approved'
    }]);
  };

  const removeItem = (index: number) => {
    if (details.length > 1) {
      setDetails(details.filter((_, i) => i !== index));
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => navigate('/inventory/stock-entry')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Stock Entry (Outward)</h1>
            <p className="text-muted-foreground">Process outgoing inventory with advanced tracking</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleGeneratePickList}>
            <List className="h-4 w-4 mr-2" />
            Generate Pick List
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? <LoadingSpinner size="sm" className="mr-2" /> : null}
            Save Entry
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="entry">Stock Entry</TabsTrigger>
          <TabsTrigger value="picklist">Pick List</TabsTrigger>
          <TabsTrigger value="reservations">Reservations</TabsTrigger>
          <TabsTrigger value="quality">Quality Control</TabsTrigger>
        </TabsList>

        <TabsContent value="entry" className="space-y-6">
          {/* Transaction Header */}
          <Card>
            <CardHeader>
              <CardTitle>Transaction Details</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="txn_number">Transaction Number</Label>
                <Input
                  id="txn_number"
                  value={formData.txn_number}
                  onChange={(e) => setFormData(prev => ({ ...prev, txn_number: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="txn_type">Entry Type</Label>
                <Select 
                  value={formData.txn_type} 
                  onValueChange={(value: any) => setFormData(prev => ({ ...prev, txn_type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sale_out">Sales Out</SelectItem>
                    <SelectItem value="sale_return_out">Sales Return Out</SelectItem>
                    <SelectItem value="transfer_out">Transfer Out</SelectItem>
                    <SelectItem value="adjustment_out">Adjustment Out</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="warehouse_id">Warehouse</Label>
                <Select 
                  value={formData.warehouse_id} 
                  onValueChange={(value) => {
                    setFormData(prev => ({ ...prev, warehouse_id: value }));
                    fetchStorageBins(value);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select warehouse" />
                  </SelectTrigger>
                  <SelectContent>
                    {warehouses.map((warehouse) => (
                      <SelectItem key={warehouse.warehouse_id} value={warehouse.warehouse_id.toString()}>
                        {warehouse.warehouse_code} - {warehouse.warehouse_name}
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
                  onChange={(e) => setFormData(prev => ({ ...prev, txn_date: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="txn_time">Time</Label>
                <Input
                  id="txn_time"
                  type="time"
                  value={formData.txn_time}
                  onChange={(e) => setFormData(prev => ({ ...prev, txn_time: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="reference_document">Reference Document</Label>
                <Input
                  id="reference_document"
                  value={formData.reference_document}
                  onChange={(e) => setFormData(prev => ({ ...prev, reference_document: e.target.value }))}
                  placeholder="SO-001, Invoice-123, etc."
                />
              </div>
            </CardContent>
          </Card>

          {/* Items Grid */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Items</CardTitle>
              <Button onClick={addNewItem} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Item
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {details.map((detail, index) => (
                  <div key={index} className="grid grid-cols-12 gap-2 items-end p-4 border rounded-lg">
                    <div className="col-span-3">
                      <Label>Product</Label>
                      <ProductSelector
                        onSelect={(product, variant) => handleProductSelect(product, variant, index)}
                        selectedProduct={detail.product}
                        selectedVariant={detail.variant}
                      />
                    </div>
                    <div className="col-span-1">
                      <Label>Previous Stock</Label>
                      <Input value={formatNumber(detail.previous_stock)} disabled />
                    </div>
                    <div className="col-span-1">
                      <Label>Quantity</Label>
                      <Input
                        type="number"
                        value={detail.quantity}
                        onChange={(e) => handleQuantityChange(index, parseFloat(e.target.value) || 0)}
                        min="0"
                        step="0.001"
                      />
                    </div>
                    <div className="col-span-1">
                      <Label>UOM</Label>
                      <Input value={detail.uom?.uom_name || ''} disabled />
                    </div>
                    <div className="col-span-1">
                      <Label>Unit Cost</Label>
                      <Input
                        type="number"
                        value={detail.unit_cost}
                        onChange={(e) => {
                          const newDetails = [...details];
                          newDetails[index].unit_cost = parseFloat(e.target.value) || 0;
                          newDetails[index].total_cost = newDetails[index].quantity * newDetails[index].unit_cost;
                          setDetails(newDetails);
                        }}
                        min="0"
                        step="0.01"
                      />
                    </div>
                    <div className="col-span-1">
                      <Label>Total Cost</Label>
                      <Input value={formatCurrency(detail.total_cost)} disabled />
                    </div>
                    <div className="col-span-1">
                      <Label>New Stock</Label>
                      <Input value={formatNumber(detail.new_stock)} disabled />
                    </div>
                    <div className="col-span-2">
                      <Label>Bin Location</Label>
                      <Select 
                        value={detail.bin_id?.toString() || ''} 
                        onValueChange={(value) => {
                          const newDetails = [...details];
                          newDetails[index].bin_id = parseInt(value);
                          setDetails(newDetails);
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select bin" />
                        </SelectTrigger>
                        <SelectContent>
                          {storageBins.map((bin) => (
                            <SelectItem key={bin.bin_id} value={bin.bin_id.toString()}>
                              {bin.bin_code} - {bin.bin_name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="col-span-1">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => removeItem(index)}
                        disabled={details.length <= 1}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Summary */}
              <div className="mt-6 p-4 bg-muted rounded-lg">
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <strong>Total Items:</strong> {details.filter(d => d.product_id).length}
                  </div>
                  <div>
                    <strong>Total Quantity:</strong> {formatNumber(details.reduce((sum, d) => sum + d.quantity, 0))}
                  </div>
                  <div>
                    <strong>Total Value:</strong> {formatCurrency(details.reduce((sum, d) => sum + d.total_cost, 0))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Remarks */}
          <Card>
            <CardHeader>
              <CardTitle>Additional Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div>
                <Label htmlFor="remarks">Remarks</Label>
                <Textarea
                  id="remarks"
                  value={formData.remarks}
                  onChange={(e) => setFormData(prev => ({ ...prev, remarks: e.target.value }))}
                  placeholder="Any additional notes or instructions..."
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="picklist">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <List className="h-5 w-5" />
                Pick List
              </CardTitle>
            </CardHeader>
            <CardContent>
              {pickListData.length > 0 ? (
                <div className="space-y-4">
                  {pickListData.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="font-medium">
                          {item.product?.product_code} - {item.product?.product_name}
                        </div>
                        {item.variant && (
                          <div className="text-sm text-muted-foreground">
                            Variant: {item.variant.variant_name}
                          </div>
                        )}
                        <div className="text-sm text-muted-foreground">
                          Bin: {item.bin_id || 'Unassigned'} | Required: {formatNumber(item.required_quantity)} {item.uom?.uom_name}
                        </div>
                      </div>
                      <Badge variant={item.status === 'completed' ? 'default' : 'secondary'}>
                        {item.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No pick list generated yet. Add items and click "Generate Pick List" to create optimized picking instructions.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reservations">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Stock Reservations
              </CardTitle>
            </CardHeader>
            <CardContent>
              {reservations.length > 0 ? (
                <div className="space-y-4">
                  {reservations.map((reservation, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="font-medium">
                          Reserved: {formatNumber(reservation.reserved_quantity)} units
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Type: {reservation.reference_type} | Ref: {reservation.reference_number}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Reserved by: User {reservation.reserved_by} on {reservation.reservation_date}
                        </div>
                      </div>
                      <Badge variant="outline">
                        {reservation.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <AlertTriangle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No active reservations found for selected products.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="quality">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Scan className="h-5 w-5" />
                Quality Control Holds
              </CardTitle>
            </CardHeader>
            <CardContent>
              {qcHolds.length > 0 ? (
                <div className="space-y-4">
                  {qcHolds.map((hold, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="font-medium">
                          Hold: {formatNumber(hold.hold_quantity)} units
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Reason: {hold.hold_reason}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Date: {hold.hold_date} | Inspector: {hold.inspector_id || 'Unassigned'}
                        </div>
                        {hold.inspection_notes && (
                          <div className="text-sm text-muted-foreground mt-1">
                            Notes: {hold.inspection_notes}
                          </div>
                        )}
                      </div>
                      <Badge variant={hold.status === 'on_hold' ? 'destructive' : 'default'}>
                        {hold.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Scan className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No quality control holds found for selected products.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default StockEntryOutward;
