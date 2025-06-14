
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, Save, Plus, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import Layout from "@/components/Layout";

interface PurchaseReturnForm {
  return_number: string;
  return_date: string;
  return_time: string;
  original_document_id: string;
  vendor_id: string;
  return_reason: string;
  return_type: string;
  warehouse_id: string;
}

interface ReturnDetailItem {
  id?: number;
  product_id: number;
  product_code: string;
  product_name: string;
  product_description: string;
  variant_id?: number;
  hsn_code: string;
  uom_id: number;
  original_quantity: number;
  quantity_returned: number;
  rate: number;
  discount_percent: number;
  discount_amount: number;
  taxable_amount: number;
  tax_rate: number;
  tax_amount: number;
  total_amount: number;
}

const PurchaseReturnEdit = () => {
  const { prId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [returnDetails, setReturnDetails] = useState<ReturnDetailItem[]>([]);
  const [totalAmount, setTotalAmount] = useState(0);

  const isEdit = Boolean(prId);

  const form = useForm<PurchaseReturnForm>({
    defaultValues: {
      return_number: "",
      return_date: new Date().toISOString().split('T')[0],
      return_time: new Date().toTimeString().slice(0, 5),
      original_document_id: "",
      vendor_id: "",
      return_reason: "",
      return_type: "",
      warehouse_id: "",
    },
  });

  // Generate return number
  const generateReturnNumber = async () => {
    try {
      const { data: company } = await supabase
        .from('companies')
        .select('company_code')
        .single();
      
      const today = new Date();
      const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
      
      // Get the count of returns for today to generate sequential number
      const { count } = await supabase
        .from('purchase_returns')
        .select('*', { count: 'exact', head: true })
        .gte('return_date', today.toISOString().split('T')[0]);
      
      const sequentialNumber = (count || 0) + 1;
      const returnNumber = `${company?.company_code || 'COMP'}-PR-${dateStr}-${sequentialNumber.toString().padStart(4, '0')}`;
      
      return returnNumber;
    } catch (error) {
      console.error('Error generating return number:', error);
      return `PR-${Date.now()}`;
    }
  };

  // Initialize return number for new returns
  useEffect(() => {
    if (!isEdit) {
      generateReturnNumber().then(returnNumber => {
        form.setValue('return_number', returnNumber);
      });
    }
  }, [isEdit, form]);

  // Fetch vendors
  const { data: vendors } = useQuery({
    queryKey: ['vendors'],
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

  // Fetch purchase orders for reference document dropdown
  const { data: purchaseOrders } = useQuery({
    queryKey: ['purchase-orders-for-return'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('purchase_orders')
        .select(`
          po_id,
          po_number,
          vendor_id,
          vendors(vendor_name)
        `)
        .eq('po_status', 'fully_received')
        .order('po_date', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  // Fetch existing return data if editing
  const { data: existingReturn } = useQuery({
    queryKey: ['purchase-return', prId],
    queryFn: async () => {
      if (!isEdit || !prId) return null;
      
      const { data, error } = await supabase
        .from('purchase_returns')
        .select(`
          *,
          purchase_return_details(*)
        `)
        .eq('pr_id', parseInt(prId))
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: isEdit && Boolean(prId),
  });

  // Populate form with existing data
  useEffect(() => {
    if (existingReturn) {
      form.reset({
        return_number: existingReturn.return_number,
        return_date: existingReturn.return_date,
        return_time: existingReturn.return_time,
        original_document_id: existingReturn.original_document_id?.toString() || "",
        vendor_id: existingReturn.vendor_id.toString(),
        return_reason: existingReturn.return_reason || "",
        return_type: existingReturn.return_type || "",
        warehouse_id: existingReturn.warehouse_id.toString(),
      });

      if (existingReturn.purchase_return_details) {
        setReturnDetails(existingReturn.purchase_return_details.map((detail: any) => ({
          id: detail.prd_id,
          product_id: detail.product_id,
          product_code: detail.product_code,
          product_name: detail.product_name,
          product_description: detail.product_description,
          variant_id: detail.variant_id,
          hsn_code: detail.hsn_code,
          uom_id: detail.uom_id,
          original_quantity: 0, // This should come from the original document
          quantity_returned: detail.quantity_returned,
          rate: detail.rate,
          discount_percent: detail.discount_percent,
          discount_amount: detail.discount_amount,
          taxable_amount: detail.taxable_amount,
          tax_rate: detail.tax_rate,
          tax_amount: detail.tax_amount,
          total_amount: detail.total_amount,
        })));
      }
    }
  }, [existingReturn, form]);

  // Load items from selected original document
  const loadItemsFromDocument = async (documentId: string) => {
    try {
      const { data, error } = await supabase
        .from('purchase_order_details')
        .select(`
          *,
          products(product_name, product_code, hsn_sac_code),
          units_of_measurement(uom_name)
        `)
        .eq('po_id', parseInt(documentId));

      if (error) throw error;

      const items: ReturnDetailItem[] = data.map((detail: any) => ({
        product_id: detail.product_id,
        product_code: detail.products?.product_code || '',
        product_name: detail.products?.product_name || '',
        product_description: detail.product_description || '',
        variant_id: detail.variant_id,
        hsn_code: detail.products?.hsn_sac_code || '',
        uom_id: detail.uom_id,
        original_quantity: detail.quantity,
        quantity_returned: 0,
        rate: detail.rate,
        discount_percent: 0,
        discount_amount: 0,
        taxable_amount: 0,
        tax_rate: detail.tax_rate || 0,
        tax_amount: 0,
        total_amount: 0,
      }));

      setReturnDetails(items);
    } catch (error) {
      console.error('Error loading items from document:', error);
      toast({
        title: "Error",
        description: "Failed to load items from selected document.",
        variant: "destructive",
      });
    }
  };

  // Handle original document selection
  const handleDocumentChange = (documentId: string) => {
    form.setValue('original_document_id', documentId);
    
    // Auto-populate vendor from selected PO
    const selectedPO = purchaseOrders?.find(po => po.po_id.toString() === documentId);
    if (selectedPO) {
      form.setValue('vendor_id', selectedPO.vendor_id.toString());
      loadItemsFromDocument(documentId);
    }
  };

  // Update return detail item
  const updateReturnDetail = (index: number, field: keyof ReturnDetailItem, value: any) => {
    const updatedDetails = [...returnDetails];
    updatedDetails[index] = { ...updatedDetails[index], [field]: value };

    // Recalculate amounts for this line
    const item = updatedDetails[index];
    const subtotal = item.quantity_returned * item.rate;
    const discountAmount = (subtotal * item.discount_percent) / 100;
    const taxableAmount = subtotal - discountAmount;
    const taxAmount = (taxableAmount * item.tax_rate) / 100;
    const totalAmount = taxableAmount + taxAmount;

    updatedDetails[index] = {
      ...item,
      discount_amount: discountAmount,
      taxable_amount: taxableAmount,
      tax_amount: taxAmount,
      total_amount: totalAmount,
    };

    setReturnDetails(updatedDetails);
  };

  // Calculate total amount
  useEffect(() => {
    const total = returnDetails.reduce((sum, item) => sum + item.total_amount, 0);
    setTotalAmount(total);
  }, [returnDetails]);

  // Save mutation
  const saveMutation = useMutation({
    mutationFn: async (data: PurchaseReturnForm) => {
      const returnData = {
        ...data,
        vendor_id: parseInt(data.vendor_id),
        warehouse_id: parseInt(data.warehouse_id),
        original_document_id: data.original_document_id ? parseInt(data.original_document_id) : null,
        company_id: 1, // This should come from context/auth
        created_by: 1, // This should come from auth context
      };

      if (isEdit && prId) {
        // Update existing return
        const { error } = await supabase
          .from('purchase_returns')
          .update(returnData)
          .eq('pr_id', parseInt(prId));
        
        if (error) throw error;

        // Delete existing details and re-insert
        await supabase
          .from('purchase_return_details')
          .delete()
          .eq('pr_id', parseInt(prId));

        // Insert updated details
        const detailsToInsert = returnDetails.map(detail => ({
          pr_id: parseInt(prId),
          product_id: detail.product_id,
          variant_id: detail.variant_id,
          product_code: detail.product_code,
          product_name: detail.product_name,
          product_description: detail.product_description,
          hsn_code: detail.hsn_code,
          uom_id: detail.uom_id,
          quantity_returned: detail.quantity_returned,
          rate: detail.rate,
          discount_percent: detail.discount_percent,
          discount_amount: detail.discount_amount,
          taxable_amount: detail.taxable_amount,
          tax_rate: detail.tax_rate,
          tax_amount: detail.tax_amount,
          total_amount: detail.total_amount,
        }));

        if (detailsToInsert.length > 0) {
          const { error: detailsError } = await supabase
            .from('purchase_return_details')
            .insert(detailsToInsert);
          
          if (detailsError) throw detailsError;
        }

        return { pr_id: parseInt(prId) };
      } else {
        // Create new return
        const { data: newReturn, error } = await supabase
          .from('purchase_returns')
          .insert([returnData])
          .select()
          .single();
        
        if (error) throw error;

        // Insert return details
        const detailsToInsert = returnDetails.map(detail => ({
          pr_id: newReturn.pr_id,
          product_id: detail.product_id,
          variant_id: detail.variant_id,
          product_code: detail.product_code,
          product_name: detail.product_name,
          product_description: detail.product_description,
          hsn_code: detail.hsn_code,
          uom_id: detail.uom_id,
          quantity_returned: detail.quantity_returned,
          rate: detail.rate,
          discount_percent: detail.discount_percent,
          discount_amount: detail.discount_amount,
          taxable_amount: detail.taxable_amount,
          tax_rate: detail.tax_rate,
          tax_amount: detail.tax_amount,
          total_amount: detail.total_amount,
        }));

        if (detailsToInsert.length > 0) {
          const { error: detailsError } = await supabase
            .from('purchase_return_details')
            .insert(detailsToInsert);
          
          if (detailsError) throw detailsError;
        }

        return newReturn;
      }
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: `Purchase return ${isEdit ? 'updated' : 'created'} successfully.`,
      });
      navigate('/purchase/returns/list');
    },
    onError: (error: any) => {
      console.error('Error saving purchase return:', error);
      toast({
        title: "Error",
        description: `Failed to ${isEdit ? 'update' : 'create'} purchase return.`,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: PurchaseReturnForm) => {
    if (returnDetails.length === 0) {
      toast({
        title: "Error",
        description: "Please add at least one item to return.",
        variant: "destructive",
      });
      return;
    }

    saveMutation.mutate(data);
  };

  return (
    <Layout>
      <div className="container mx-auto p-6">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="outline" onClick={() => navigate('/purchase/returns/list')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-3xl font-bold">
            {isEdit ? 'Edit Purchase Return' : 'Create Purchase Return'}
          </h1>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle>Return Information</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="return_number"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Return Number</FormLabel>
                      <FormControl>
                        <Input {...field} readOnly className="bg-gray-50" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="return_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Return Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="return_time"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Return Time</FormLabel>
                      <FormControl>
                        <Input type="time" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="original_document_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Original Document</FormLabel>
                      <Select onValueChange={handleDocumentChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select purchase order" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {purchaseOrders?.map((po) => (
                            <SelectItem key={po.po_id} value={po.po_id.toString()}>
                              {po.po_number} - {po.vendors?.vendor_name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="vendor_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Vendor</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select vendor" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {vendors?.map((vendor) => (
                            <SelectItem key={vendor.vendor_id} value={vendor.vendor_id.toString()}>
                              {vendor.vendor_name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="warehouse_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Warehouse</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select warehouse" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {warehouses?.map((warehouse) => (
                            <SelectItem key={warehouse.warehouse_id} value={warehouse.warehouse_id.toString()}>
                              {warehouse.warehouse_name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="return_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Return Type</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select return type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="quality">Quality</SelectItem>
                          <SelectItem value="excess">Excess</SelectItem>
                          <SelectItem value="others">Others</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="md:col-span-2">
                  <FormField
                    control={form.control}
                    name="return_reason"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Return Reason</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Enter reason for return..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Return Items */}
            <Card>
              <CardHeader>
                <CardTitle>Return Items</CardTitle>
              </CardHeader>
              <CardContent>
                {returnDetails.length > 0 ? (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Product</TableHead>
                          <TableHead>Original Qty</TableHead>
                          <TableHead>Return Qty</TableHead>
                          <TableHead>Rate</TableHead>
                          <TableHead>Discount %</TableHead>
                          <TableHead>Tax %</TableHead>
                          <TableHead>Total</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {returnDetails.map((item, index) => (
                          <TableRow key={index}>
                            <TableCell>
                              <div>
                                <div className="font-medium">{item.product_name}</div>
                                <div className="text-sm text-gray-500">{item.product_code}</div>
                              </div>
                            </TableCell>
                            <TableCell>{item.original_quantity}</TableCell>
                            <TableCell>
                              <Input
                                type="number"
                                value={item.quantity_returned}
                                onChange={(e) => updateReturnDetail(index, 'quantity_returned', parseFloat(e.target.value) || 0)}
                                className="w-24"
                                min="0"
                                max={item.original_quantity}
                              />
                            </TableCell>
                            <TableCell>
                              <Input
                                type="number"
                                value={item.rate}
                                onChange={(e) => updateReturnDetail(index, 'rate', parseFloat(e.target.value) || 0)}
                                className="w-24"
                                min="0"
                                step="0.01"
                              />
                            </TableCell>
                            <TableCell>
                              <Input
                                type="number"
                                value={item.discount_percent}
                                onChange={(e) => updateReturnDetail(index, 'discount_percent', parseFloat(e.target.value) || 0)}
                                className="w-20"
                                min="0"
                                max="100"
                                step="0.01"
                              />
                            </TableCell>
                            <TableCell>
                              <Input
                                type="number"
                                value={item.tax_rate}
                                onChange={(e) => updateReturnDetail(index, 'tax_rate', parseFloat(e.target.value) || 0)}
                                className="w-20"
                                min="0"
                                max="100"
                                step="0.01"
                              />
                            </TableCell>
                            <TableCell>₹{item.total_amount.toFixed(2)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>

                    <div className="mt-4 text-right">
                      <div className="text-lg font-bold">
                        Total Amount: ₹{totalAmount.toFixed(2)}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    Select an original document to load items for return
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/purchase/returns/list')}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={saveMutation.isPending}
                className="flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                {saveMutation.isPending
                  ? 'Saving...'
                  : isEdit
                  ? 'Update Return'
                  : 'Create Return'}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </Layout>
  );
};

export default PurchaseReturnEdit;
