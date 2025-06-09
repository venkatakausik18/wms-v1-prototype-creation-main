
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Save, ArrowLeft, Plus } from "lucide-react";
import Layout from "@/components/Layout";
import { toast } from "sonner";

interface PurchaseOrder {
  po_id: number;
  po_number: string;
  vendor_id: number;
  vendor_name?: string;
}

interface User {
  user_id: number;
  full_name: string;
  role_name?: string;
}

interface Warehouse {
  warehouse_id: number;
  warehouse_name: string;
}

interface StorageBin {
  bin_id: number;
  bin_code: string;
  zone_name: string;
}

interface PODetail {
  po_detail_id: number;
  product_id: number;
  product_code: string;
  product_name: string;
  quantity: number;
  received_quantity: number;
  pending_quantity: number;
  rate: number;
  tax_rate: number;
  uom_id: number;
  variant_id?: number;
  hsn_code?: string;
}

interface GrnItem extends PODetail {
  received_qty: number;
  accepted_qty: number;
  rejected_qty: number;
  reason_for_rejection?: string;
  batch_lot_number?: string;
  manufacturing_date?: string;
  expiry_date?: string;
  bin_id?: number;
}

const GrnEdit = () => {
  const navigate = useNavigate();
  const { grnId } = useParams();
  const isEdit = Boolean(grnId);

  // Form state
  const [formData, setFormData] = useState({
    grn_number: "",
    grn_date: new Date().toISOString().split('T')[0],
    grn_time: new Date().toTimeString().slice(0, 5),
    po_id: "",
    vendor_id: "",
    delivery_challan_number: "",
    delivery_challan_date: "",
    vehicle_number: "",
    received_by: "",
    inspector_id: "",
    inspection_date: "",
    quality_status: "accepted" as "accepted" | "rejected" | "partial",
    quality_remarks: "",
    freight_charges: 0,
    other_charges: 0,
    payment_due_date: "",
    grn_status: "draft" as "draft" | "completed" | "cancelled",
    remarks: "",
    warehouse_id: ""
  });

  // Data state
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [inspectors, setInspectors] = useState<User[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [storageBins, setStorageBins] = useState<StorageBin[]>([]);
  const [grnItems, setGrnItems] = useState<GrnItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [defectPhotos, setDefectPhotos] = useState<File[]>([]);

  useEffect(() => {
    fetchInitialData();
    if (isEdit) {
      fetchGrnData();
    } else {
      generateGrnNumber();
    }
  }, [grnId]);

  useEffect(() => {
    if (formData.po_id) {
      fetchPODetails();
    }
  }, [formData.po_id]);

  useEffect(() => {
    if (formData.warehouse_id) {
      fetchStorageBins();
    }
  }, [formData.warehouse_id]);

  const fetchInitialData = async () => {
    try {
      const [poResult, usersResult, warehousesResult] = await Promise.all([
        supabase
          .from('purchase_orders')
          .select(`
            po_id,
            po_number,
            vendor_id,
            vendors!inner(vendor_name)
          `)
          .in('po_status', ['pending_approval', 'approved', 'sent_to_vendor']),
        
        supabase
          .from('users')
          .select(`
            user_id,
            full_name,
            roles!inner(role_name)
          `)
          .eq('is_active', true),
        
        supabase
          .from('warehouses')
          .select('warehouse_id, warehouse_name')
          .eq('is_active', true)
      ]);

      if (poResult.error) throw poResult.error;
      if (usersResult.error) throw usersResult.error;
      if (warehousesResult.error) throw warehousesResult.error;

      const posWithVendors = (poResult.data || []).map(po => ({
        ...po,
        vendor_name: po.vendors?.vendor_name
      }));

      setPurchaseOrders(posWithVendors);
      setUsers(usersResult.data || []);
      setInspectors((usersResult.data || []).filter(user => user.roles?.role_name === 'Inspector'));
      setWarehouses(warehousesResult.data || []);
    } catch (error) {
      console.error('Error fetching initial data:', error);
      toast.error('Failed to load initial data');
    }
  };

  const generateGrnNumber = async () => {
    try {
      // Get company code - for now using a default
      const companyCode = "COMP"; // This should come from company settings
      const today = new Date();
      const dateStr = today.getFullYear().toString() + 
                     (today.getMonth() + 1).toString().padStart(2, '0') + 
                     today.getDate().toString().padStart(2, '0');
      
      // Get next sequence number
      const { count } = await supabase
        .from('goods_receipt_notes')
        .select('*', { count: 'exact', head: true })
        .like('grn_number', `${companyCode}-GRN-${dateStr}-%`);

      const sequence = ((count || 0) + 1).toString().padStart(4, '0');
      const grnNumber = `${companyCode}-GRN-${dateStr}-${sequence}`;

      setFormData(prev => ({ ...prev, grn_number: grnNumber }));
    } catch (error) {
      console.error('Error generating GRN number:', error);
    }
  };

  const fetchGrnData = async () => {
    if (!grnId) return;

    try {
      const { data, error } = await supabase
        .from('goods_receipt_notes')
        .select('*')
        .eq('grn_id', parseInt(grnId))
        .single();

      if (error) throw error;

      if (data) {
        setFormData({
          grn_number: data.grn_number,
          grn_date: data.grn_date,
          grn_time: data.grn_time,
          po_id: data.po_id?.toString() || "",
          vendor_id: data.vendor_id?.toString() || "",
          delivery_challan_number: data.delivery_challan_number || "",
          delivery_challan_date: data.delivery_challan_date || "",
          vehicle_number: data.vehicle_number || "",
          received_by: data.received_by?.toString() || "",
          inspector_id: data.inspector_id?.toString() || "",
          inspection_date: data.inspection_date || "",
          quality_status: data.quality_status,
          quality_remarks: data.quality_remarks || "",
          freight_charges: data.freight_charges || 0,
          other_charges: data.other_charges || 0,
          payment_due_date: data.payment_due_date || "",
          grn_status: data.grn_status,
          remarks: data.remarks || "",
          warehouse_id: data.warehouse_id?.toString() || ""
        });
      }
    } catch (error) {
      console.error('Error fetching GRN data:', error);
      toast.error('Failed to load GRN data');
    }
  };

  const fetchPODetails = async () => {
    if (!formData.po_id) return;

    try {
      const { data, error } = await supabase
        .from('purchase_order_details')
        .select(`
          *,
          products!inner(product_name, product_code, hsn_sac_code, is_batch_tracked)
        `)
        .eq('po_id', parseInt(formData.po_id))
        .gt('pending_quantity', 0);

      if (error) throw error;

      const items: GrnItem[] = (data || []).map(item => ({
        ...item,
        product_code: item.products.product_code,
        product_name: item.products.product_name,
        hsn_code: item.products.hsn_sac_code,
        received_qty: 0,
        accepted_qty: 0,
        rejected_qty: 0
      }));

      setGrnItems(items);

      // Auto-populate vendor from PO
      const selectedPo = purchaseOrders.find(po => po.po_id === parseInt(formData.po_id));
      if (selectedPo) {
        setFormData(prev => ({ 
          ...prev, 
          vendor_id: selectedPo.vendor_id.toString() 
        }));
      }
    } catch (error) {
      console.error('Error fetching PO details:', error);
      toast.error('Failed to load PO details');
    }
  };

  const fetchStorageBins = async () => {
    if (!formData.warehouse_id) return;

    try {
      const { data, error } = await supabase
        .from('storage_bins')
        .select(`
          bin_id,
          bin_code,
          warehouse_zones!inner(zone_name)
        `)
        .eq('warehouse_zones.warehouse_id', parseInt(formData.warehouse_id))
        .eq('is_active', true);

      if (error) throw error;

      const bins = (data || []).map(bin => ({
        bin_id: bin.bin_id,
        bin_code: bin.bin_code,
        zone_name: bin.warehouse_zones.zone_name
      }));

      setStorageBins(bins);
    } catch (error) {
      console.error('Error fetching storage bins:', error);
    }
  };

  const updateGrnItem = (index: number, field: keyof GrnItem, value: any) => {
    setGrnItems(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };

      // Auto-calculate accepted/rejected quantities
      if (field === 'received_qty') {
        if (formData.quality_status === 'accepted') {
          updated[index].accepted_qty = value;
          updated[index].rejected_qty = 0;
        }
      } else if (field === 'accepted_qty') {
        updated[index].rejected_qty = updated[index].received_qty - value;
      }

      return updated;
    });
  };

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      setDefectPhotos(Array.from(files));
    }
  };

  const calculateTotals = () => {
    const subtotal = grnItems.reduce((sum, item) => {
      return sum + (item.accepted_qty * item.rate);
    }, 0);

    const taxAmount = grnItems.reduce((sum, item) => {
      const lineAmount = item.accepted_qty * item.rate;
      return sum + (lineAmount * (item.tax_rate || 0) / 100);
    }, 0);

    const totalAmount = subtotal + taxAmount + formData.freight_charges + formData.other_charges;

    return { subtotal, taxAmount, totalAmount };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.po_id) {
      toast.error('Please select a Purchase Order');
      return;
    }

    if (!formData.received_by) {
      toast.error('Please select who received the goods');
      return;
    }

    if (!formData.warehouse_id) {
      toast.error('Please select a warehouse');
      return;
    }

    if (grnItems.length === 0) {
      toast.error('No items to receive');
      return;
    }

    setLoading(true);

    try {
      const { subtotal, taxAmount, totalAmount } = calculateTotals();

      // Upload defect photos if any
      let photoUrls: string[] = [];
      if (defectPhotos.length > 0) {
        // Implementation for photo upload would go here
        // For now, we'll just store the file names
        photoUrls = defectPhotos.map(file => file.name);
      }

      const grnData = {
        company_id: 1, // This should come from current user's company
        warehouse_id: parseInt(formData.warehouse_id),
        grn_number: formData.grn_number,
        grn_date: formData.grn_date,
        grn_time: formData.grn_time,
        po_id: parseInt(formData.po_id),
        vendor_id: parseInt(formData.vendor_id),
        delivery_challan_number: formData.delivery_challan_number || null,
        delivery_challan_date: formData.delivery_challan_date || null,
        vehicle_number: formData.vehicle_number || null,
        received_by: parseInt(formData.received_by),
        inspector_id: formData.inspector_id ? parseInt(formData.inspector_id) : null,
        inspection_date: formData.inspection_date || null,
        quality_status: formData.quality_status,
        quality_remarks: formData.quality_remarks || null,
        defect_photos: photoUrls.length > 0 ? JSON.stringify(photoUrls) : null,
        subtotal,
        discount_amount: 0, // Can be added later
        tax_amount: taxAmount,
        freight_charges: formData.freight_charges,
        other_charges: formData.other_charges,
        total_amount: totalAmount,
        payment_due_date: formData.payment_due_date || null,
        grn_status: formData.grn_status,
        remarks: formData.remarks || null,
        created_by: 1 // This should come from current user
      };

      let grnResult;
      if (isEdit) {
        grnResult = await supabase
          .from('goods_receipt_notes')
          .update({ ...grnData, updated_by: 1 })
          .eq('grn_id', parseInt(grnId))
          .select()
          .single();
      } else {
        grnResult = await supabase
          .from('goods_receipt_notes')
          .insert([grnData])
          .select()
          .single();
      }

      if (grnResult.error) throw grnResult.error;

      const newGrnId = grnResult.data.grn_id;

      // Create inventory transaction if status is completed
      if (formData.grn_status === 'completed') {
        const totalItems = grnItems.filter(item => item.accepted_qty > 0).length;
        const totalQuantity = grnItems.reduce((sum, item) => sum + item.accepted_qty, 0);
        const totalValue = grnItems.reduce((sum, item) => sum + (item.accepted_qty * item.rate), 0);

        const inventoryTxnData = {
          company_id: 1,
          warehouse_id: parseInt(formData.warehouse_id),
          txn_number: formData.grn_number,
          txn_type: 'purchase_in' as const,
          txn_date: formData.grn_date,
          txn_time: formData.grn_time,
          reference_document: formData.grn_number,
          related_id: newGrnId,
          total_items: totalItems,
          total_quantity: totalQuantity,
          total_value: totalValue,
          created_by: 1
        };

        const txnResult = await supabase
          .from('inventory_transactions')
          .insert([inventoryTxnData])
          .select()
          .single();

        if (txnResult.error) throw txnResult.error;

        const txnId = txnResult.data.txn_id;

        // Create inventory transaction details
        const txnDetails = grnItems
          .filter(item => item.accepted_qty > 0)
          .map(item => ({
            txn_id: txnId,
            product_id: item.product_id,
            variant_id: item.variant_id || null,
            uom_id: item.uom_id,
            quantity: item.accepted_qty,
            unit_cost: item.rate,
            total_cost: item.accepted_qty * item.rate,
            bin_id: item.bin_id || null,
            previous_stock: 0, // This should be fetched from stock position
            new_stock: item.accepted_qty // This should be previous_stock + accepted_qty
          }));

        if (txnDetails.length > 0) {
          const txnDetailsResult = await supabase
            .from('inventory_transaction_details')
            .insert(txnDetails);

          if (txnDetailsResult.error) throw txnDetailsResult.error;
        }

        // Update purchase order details
        for (const item of grnItems.filter(item => item.accepted_qty > 0)) {
          const newReceivedQty = item.received_quantity + item.accepted_qty;
          const newPendingQty = item.pending_quantity - item.accepted_qty;
          const newLineStatus = newPendingQty <= 0 ? 'fully_received' : 'partially_received';

          await supabase
            .from('purchase_order_details')
            .update({
              received_quantity: newReceivedQty,
              pending_quantity: newPendingQty,
              line_status: newLineStatus
            })
            .eq('po_detail_id', item.po_detail_id);
        }
      }

      toast.success(isEdit ? 'GRN updated successfully' : 'GRN created successfully');
      navigate('/purchase/grn/list');
    } catch (error) {
      console.error('Error saving GRN:', error);
      toast.error('Failed to save GRN');
    } finally {
      setLoading(false);
    }
  };

  const { subtotal, taxAmount, totalAmount } = calculateTotals();

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => navigate('/purchase/grn/list')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to GRN List
          </Button>
          <h1 className="text-3xl font-bold">
            {isEdit ? 'Edit GRN' : 'Create New GRN'}
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="grn_number">GRN Number</Label>
                <Input
                  id="grn_number"
                  value={formData.grn_number}
                  readOnly
                  className="bg-gray-50"
                />
              </div>
              
              <div>
                <Label htmlFor="grn_date">GRN Date</Label>
                <Input
                  id="grn_date"
                  type="date"
                  value={formData.grn_date}
                  onChange={(e) => setFormData(prev => ({ ...prev, grn_date: e.target.value }))}
                  required
                />
              </div>

              <div>
                <Label htmlFor="grn_time">GRN Time</Label>
                <Input
                  id="grn_time"
                  type="time"
                  value={formData.grn_time}
                  onChange={(e) => setFormData(prev => ({ ...prev, grn_time: e.target.value }))}
                  required
                />
              </div>

              <div>
                <Label htmlFor="po_id">Purchase Order</Label>
                <Select value={formData.po_id} onValueChange={(value) => setFormData(prev => ({ ...prev, po_id: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select PO" />
                  </SelectTrigger>
                  <SelectContent>
                    {purchaseOrders.map((po) => (
                      <SelectItem key={po.po_id} value={po.po_id.toString()}>
                        {po.po_number} - {po.vendor_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="warehouse_id">Warehouse</Label>
                <Select value={formData.warehouse_id} onValueChange={(value) => setFormData(prev => ({ ...prev, warehouse_id: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Warehouse" />
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
                <Label htmlFor="received_by">Received By</Label>
                <Select value={formData.received_by} onValueChange={(value) => setFormData(prev => ({ ...prev, received_by: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select User" />
                  </SelectTrigger>
                  <SelectContent>
                    {users.map((user) => (
                      <SelectItem key={user.user_id} value={user.user_id.toString()}>
                        {user.full_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Delivery Information */}
          <Card>
            <CardHeader>
              <CardTitle>Delivery Information</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="delivery_challan_number">Delivery Challan Number</Label>
                <Input
                  id="delivery_challan_number"
                  value={formData.delivery_challan_number}
                  onChange={(e) => setFormData(prev => ({ ...prev, delivery_challan_number: e.target.value }))}
                />
              </div>

              <div>
                <Label htmlFor="delivery_challan_date">Delivery Challan Date</Label>
                <Input
                  id="delivery_challan_date"
                  type="date"
                  value={formData.delivery_challan_date}
                  onChange={(e) => setFormData(prev => ({ ...prev, delivery_challan_date: e.target.value }))}
                />
              </div>

              <div>
                <Label htmlFor="vehicle_number">Vehicle Number</Label>
                <Input
                  id="vehicle_number"
                  value={formData.vehicle_number}
                  onChange={(e) => setFormData(prev => ({ ...prev, vehicle_number: e.target.value }))}
                />
              </div>
            </CardContent>
          </Card>

          {/* Quality Check Section */}
          <Card>
            <CardHeader>
              <CardTitle>Quality Check</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="inspector_id">Inspector</Label>
                  <Select value={formData.inspector_id} onValueChange={(value) => setFormData(prev => ({ ...prev, inspector_id: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Inspector" />
                    </SelectTrigger>
                    <SelectContent>
                      {inspectors.map((inspector) => (
                        <SelectItem key={inspector.user_id} value={inspector.user_id.toString()}>
                          {inspector.full_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="inspection_date">Inspection Date</Label>
                  <Input
                    id="inspection_date"
                    type="date"
                    value={formData.inspection_date}
                    onChange={(e) => setFormData(prev => ({ ...prev, inspection_date: e.target.value }))}
                  />
                </div>

                <div>
                  <Label>Quality Status</Label>
                  <RadioGroup 
                    value={formData.quality_status} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, quality_status: value as any }))}
                    className="flex space-x-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="accepted" id="accepted" />
                      <Label htmlFor="accepted">Accepted</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="rejected" id="rejected" />
                      <Label htmlFor="rejected">Rejected</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="partial" id="partial" />
                      <Label htmlFor="partial">Partial</Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>

              <div>
                <Label htmlFor="quality_remarks">Quality Remarks</Label>
                <Textarea
                  id="quality_remarks"
                  value={formData.quality_remarks}
                  onChange={(e) => setFormData(prev => ({ ...prev, quality_remarks: e.target.value }))}
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="defect_photos">Defect Photos</Label>
                <Input
                  id="defect_photos"
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handlePhotoUpload}
                />
              </div>
            </CardContent>
          </Card>

          {/* Item Receipt Details */}
          {grnItems.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Item Receipt Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Item Code</TableHead>
                        <TableHead>Item Name</TableHead>
                        <TableHead>PO Qty</TableHead>
                        <TableHead>Received Qty</TableHead>
                        <TableHead>Accepted Qty</TableHead>
                        <TableHead>Rejected Qty</TableHead>
                        <TableHead>Rate</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Bin Location</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {grnItems.map((item, index) => (
                        <TableRow key={item.po_detail_id}>
                          <TableCell>{item.product_code}</TableCell>
                          <TableCell>{item.product_name}</TableCell>
                          <TableCell>{item.pending_quantity}</TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              value={item.received_qty}
                              onChange={(e) => updateGrnItem(index, 'received_qty', parseFloat(e.target.value) || 0)}
                              min="0"
                              max={item.pending_quantity}
                              className="w-20"
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              value={item.accepted_qty}
                              onChange={(e) => updateGrnItem(index, 'accepted_qty', parseFloat(e.target.value) || 0)}
                              min="0"
                              max={item.received_qty}
                              className="w-20"
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              value={item.rejected_qty}
                              onChange={(e) => updateGrnItem(index, 'rejected_qty', parseFloat(e.target.value) || 0)}
                              min="0"
                              className="w-20"
                            />
                          </TableCell>
                          <TableCell>₹{item.rate.toLocaleString()}</TableCell>
                          <TableCell>₹{(item.accepted_qty * item.rate).toLocaleString()}</TableCell>
                          <TableCell>
                            <Select 
                              value={item.bin_id?.toString() || ""} 
                              onValueChange={(value) => updateGrnItem(index, 'bin_id', parseInt(value))}
                            >
                              <SelectTrigger className="w-32">
                                <SelectValue placeholder="Select Bin" />
                              </SelectTrigger>
                              <SelectContent>
                                {storageBins.map((bin) => (
                                  <SelectItem key={bin.bin_id} value={bin.bin_id.toString()}>
                                    {bin.bin_code} ({bin.zone_name})
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Financial Information */}
          <Card>
            <CardHeader>
              <CardTitle>Financial Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="freight_charges">Freight Charges</Label>
                  <Input
                    id="freight_charges"
                    type="number"
                    value={formData.freight_charges}
                    onChange={(e) => setFormData(prev => ({ ...prev, freight_charges: parseFloat(e.target.value) || 0 }))}
                    min="0"
                    step="0.01"
                  />
                </div>

                <div>
                  <Label htmlFor="other_charges">Other Charges</Label>
                  <Input
                    id="other_charges"
                    type="number"
                    value={formData.other_charges}
                    onChange={(e) => setFormData(prev => ({ ...prev, other_charges: parseFloat(e.target.value) || 0 }))}
                    min="0"
                    step="0.01"
                  />
                </div>

                <div>
                  <Label htmlFor="payment_due_date">Payment Due Date</Label>
                  <Input
                    id="payment_due_date"
                    type="date"
                    value={formData.payment_due_date}
                    onChange={(e) => setFormData(prev => ({ ...prev, payment_due_date: e.target.value }))}
                  />
                </div>

                <div>
                  <Label htmlFor="grn_status">GRN Status</Label>
                  <Select value={formData.grn_status} onValueChange={(value) => setFormData(prev => ({ ...prev, grn_status: value as any }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>₹{subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax Amount:</span>
                    <span>₹{taxAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Freight:</span>
                    <span>₹{formData.freight_charges.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Other Charges:</span>
                    <span>₹{formData.other_charges.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between font-bold">
                    <span>Total Amount:</span>
                    <span>₹{totalAmount.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="remarks">Remarks</Label>
                <Textarea
                  id="remarks"
                  value={formData.remarks}
                  onChange={(e) => setFormData(prev => ({ ...prev, remarks: e.target.value }))}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Submit Buttons */}
          <div className="flex justify-end space-x-4">
            <Button type="button" variant="outline" onClick={() => navigate('/purchase/grn/list')}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              <Save className="h-4 w-4 mr-2" />
              {loading ? 'Saving...' : (isEdit ? 'Update GRN' : 'Create GRN')}
            </Button>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default GrnEdit;
