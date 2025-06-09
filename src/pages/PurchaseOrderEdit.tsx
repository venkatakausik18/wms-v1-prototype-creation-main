import { useState, useEffect } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Plus, Trash2, ArrowLeft } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import Layout from "@/components/Layout";
import { toast } from "sonner";

const purchaseOrderSchema = z.object({
  po_number: z.string().min(1, "PO Number is required"),
  po_date: z.date(),
  vendor_id: z.number().min(1, "Vendor is required"),
  warehouse_id: z.number().min(1, "Warehouse is required"),
  reference_number: z.string().optional(),
  quote_number: z.string().optional(),
  expected_delivery_date: z.date().optional(),
  currency: z.string().default("INR"),
  exchange_rate: z.number().default(1),
  payment_terms: z.string().optional(),
  delivery_terms: z.string().optional(),
  shipping_address: z.string().optional(),
  special_instructions: z.string().optional(),
  terms_conditions: z.string().optional(),
  internal_notes: z.string().optional(),
  freight_charges: z.number().default(0),
  other_charges: z.number().default(0),
  items: z.array(z.object({
    product_id: z.number().min(1, "Product is required"),
    variant_id: z.number().optional(),
    product_code: z.string(),
    product_name: z.string(),
    product_description: z.string().optional(),
    hsn_code: z.string().optional(),
    uom_id: z.number().min(1, "UOM is required"),
    quantity: z.number().min(0.01, "Quantity must be greater than 0"),
    rate: z.number().min(0, "Rate must be non-negative"),
    discount_percent: z.number().min(0).max(100).default(0),
    discount_amount: z.number().min(0).default(0),
    tax_rate: z.number().min(0).max(100).default(0),
    expected_delivery_date: z.date().optional(),
    special_instructions: z.string().optional()
  })).min(1, "At least one item is required")
});

type PurchaseOrderForm = z.infer<typeof purchaseOrderSchema>;

interface Vendor {
  vendor_id: number;
  vendor_name: string;
}

interface Warehouse {
  warehouse_id: number;
  warehouse_name: string;
}

interface Product {
  product_id: number;
  product_code: string;
  product_name: string;
  product_description: string;
  hsn_sac_code: string;
  purchase_rate: number;
  primary_uom_id: number;
  tax_category: string;
}

interface UOM {
  uom_id: number;
  uom_name: string;
}

const PurchaseOrderEdit = () => {
  const navigate = useNavigate();
  const { poId } = useParams();
  const [searchParams] = useSearchParams();
  const duplicateId = searchParams.get('duplicate');
  const isEdit = Boolean(poId);
  const isDuplicate = Boolean(duplicateId);

  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [uoms, setUOMs] = useState<UOM[]>([]);
  const [loading, setLoading] = useState(false);

  const form = useForm<PurchaseOrderForm>({
    resolver: zodResolver(purchaseOrderSchema),
    defaultValues: {
      po_date: new Date(),
      currency: "INR",
      exchange_rate: 1,
      freight_charges: 0,
      other_charges: 0,
      items: [{
        product_id: 0,
        product_code: "",
        product_name: "",
        product_description: "",
        hsn_code: "",
        uom_id: 0,
        quantity: 1,
        rate: 0,
        discount_percent: 0,
        discount_amount: 0,
        tax_rate: 0
      }]
    }
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items"
  });

  useEffect(() => {
    fetchInitialData();
    if (isEdit && poId) {
      fetchPurchaseOrder(parseInt(poId));
    } else if (isDuplicate && duplicateId) {
      fetchPurchaseOrder(parseInt(duplicateId), true);
    } else {
      generatePONumber();
    }
  }, [poId, duplicateId]);

  const fetchInitialData = async () => {
    try {
      const [vendorsResult, warehousesResult, productsResult, uomsResult] = await Promise.all([
        supabase.from('vendors').select('vendor_id, vendor_name').eq('is_active', true).order('vendor_name'),
        supabase.from('warehouses').select('warehouse_id, warehouse_name').eq('is_active', true).order('warehouse_name'),
        supabase.from('products').select('product_id, product_code, product_name, product_description, hsn_sac_code, purchase_rate, primary_uom_id, tax_category').eq('is_active', true).order('product_name'),
        supabase.from('units_of_measure').select('uom_id, uom_name').eq('is_active', true).order('uom_name')
      ]);

      if (vendorsResult.error) throw vendorsResult.error;
      if (warehousesResult.error) throw warehousesResult.error;
      if (productsResult.error) throw productsResult.error;
      if (uomsResult.error) throw uomsResult.error;

      setVendors(vendorsResult.data || []);
      setWarehouses(warehousesResult.data || []);
      setProducts(productsResult.data || []);
      setUOMs(uomsResult.data || []);
    } catch (error) {
      console.error('Error fetching initial data:', error);
      toast.error('Failed to load form data');
    }
  };

  const generatePONumber = async () => {
    try {
      const today = new Date();
      const dateStr = format(today, 'yyyyMMdd');
      
      // Get the last PO number for today
      const { data, error } = await supabase
        .from('purchase_orders')
        .select('po_number')
        .like('po_number', `WH-PO-${dateStr}-%`)
        .order('po_number', { ascending: false })
        .limit(1);

      if (error) throw error;

      let nextNumber = 1;
      if (data && data.length > 0) {
        const lastNumber = parseInt(data[0].po_number.split('-').pop() || '0');
        nextNumber = lastNumber + 1;
      }

      const poNumber = `WH-PO-${dateStr}-${nextNumber.toString().padStart(4, '0')}`;
      form.setValue('po_number', poNumber);
    } catch (error) {
      console.error('Error generating PO number:', error);
    }
  };

  const fetchPurchaseOrder = async (id: number, duplicate = false) => {
    try {
      setLoading(true);
      
      const { data: poData, error: poError } = await supabase
        .from('purchase_orders')
        .select('*')
        .eq('po_id', id)
        .single();

      if (poError) throw poError;

      const { data: itemsData, error: itemsError } = await supabase
        .from('purchase_order_details')
        .select('*')
        .eq('po_id', id)
        .order('po_detail_id');

      if (itemsError) throw itemsError;

      if (duplicate) {
        await generatePONumber();
      } else {
        form.setValue('po_number', poData.po_number);
      }

      form.setValue('po_date', new Date(poData.po_date));
      form.setValue('vendor_id', poData.vendor_id);
      form.setValue('warehouse_id', poData.warehouse_id);
      form.setValue('reference_number', poData.reference_number || '');
      form.setValue('quote_number', poData.quote_number || '');
      form.setValue('expected_delivery_date', poData.expected_delivery_date ? new Date(poData.expected_delivery_date) : undefined);
      form.setValue('currency', poData.currency || 'INR');
      form.setValue('exchange_rate', poData.exchange_rate || 1);
      form.setValue('payment_terms', poData.payment_terms || '');
      form.setValue('delivery_terms', poData.delivery_terms || '');
      form.setValue('shipping_address', poData.shipping_address || '');
      form.setValue('special_instructions', poData.special_instructions || '');
      form.setValue('terms_conditions', poData.terms_conditions || '');
      form.setValue('internal_notes', poData.internal_notes || '');
      form.setValue('freight_charges', poData.freight_charges || 0);
      form.setValue('other_charges', poData.other_charges || 0);

      const items = itemsData.map(item => ({
        product_id: item.product_id,
        variant_id: item.variant_id || undefined,
        product_code: item.product_code || '',
        product_name: item.product_name || '',
        product_description: item.product_description || '',
        hsn_code: item.hsn_code || '',
        uom_id: item.uom_id,
        quantity: item.quantity,
        rate: item.rate,
        discount_percent: item.discount_percent || 0,
        discount_amount: item.discount_amount || 0,
        tax_rate: item.tax_rate || 0,
        expected_delivery_date: item.expected_delivery_date ? new Date(item.expected_delivery_date) : undefined,
        special_instructions: item.special_instructions || ''
      }));

      form.setValue('items', items);
    } catch (error) {
      console.error('Error fetching purchase order:', error);
      toast.error('Failed to load purchase order');
    } finally {
      setLoading(false);
    }
  };

  const onProductChange = (index: number, productId: number) => {
    const product = products.find(p => p.product_id === productId);
    if (product) {
      form.setValue(`items.${index}.product_id`, productId);
      form.setValue(`items.${index}.product_code`, product.product_code);
      form.setValue(`items.${index}.product_name`, product.product_name);
      form.setValue(`items.${index}.product_description`, product.product_description || '');
      form.setValue(`items.${index}.hsn_code`, product.hsn_sac_code || '');
      form.setValue(`items.${index}.uom_id`, product.primary_uom_id);
      form.setValue(`items.${index}.rate`, product.purchase_rate || 0);
    }
  };

  const calculateLineTotal = (item: any) => {
    const subtotal = item.quantity * item.rate;
    const discountAmount = item.discount_percent > 0 ? (subtotal * item.discount_percent / 100) : item.discount_amount;
    const taxableAmount = subtotal - discountAmount;
    const taxAmount = taxableAmount * item.tax_rate / 100;
    return taxableAmount + taxAmount;
  };

  const calculateTotals = () => {
    const items = form.getValues('items');
    const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.rate), 0);
    const totalDiscount = items.reduce((sum, item) => {
      const lineSubtotal = item.quantity * item.rate;
      return sum + (item.discount_percent > 0 ? (lineSubtotal * item.discount_percent / 100) : item.discount_amount);
    }, 0);
    const taxableAmount = subtotal - totalDiscount;
    const totalTax = items.reduce((sum, item) => {
      const lineSubtotal = item.quantity * item.rate;
      const lineDiscount = item.discount_percent > 0 ? (lineSubtotal * item.discount_percent / 100) : item.discount_amount;
      const lineTaxable = lineSubtotal - lineDiscount;
      return sum + (lineTaxable * item.tax_rate / 100);
    }, 0);
    const freightCharges = form.getValues('freight_charges') || 0;
    const otherCharges = form.getValues('other_charges') || 0;
    const grandTotal = taxableAmount + totalTax + freightCharges + otherCharges;

    return {
      subtotal,
      totalDiscount,
      taxableAmount,
      totalTax,
      freightCharges,
      otherCharges,
      grandTotal
    };
  };

  const onSubmit = async (data: PurchaseOrderForm, saveAsDraft = true) => {
    try {
      setLoading(true);

      const totals = calculateTotals();
      
      const poData = {
        company_id: 1, // This should come from auth context
        warehouse_id: data.warehouse_id,
        po_number: data.po_number,
        po_date: format(data.po_date, 'yyyy-MM-dd'),
        vendor_id: data.vendor_id,
        reference_number: data.reference_number || null,
        quote_number: data.quote_number || null,
        expected_delivery_date: data.expected_delivery_date ? format(data.expected_delivery_date, 'yyyy-MM-dd') : null,
        currency: data.currency,
        exchange_rate: data.exchange_rate,
        subtotal: totals.subtotal,
        discount_amount: totals.totalDiscount,
        tax_amount: totals.totalTax,
        freight_charges: data.freight_charges,
        other_charges: data.other_charges,
        total_amount: totals.grandTotal,
        payment_terms: data.payment_terms || null,
        delivery_terms: data.delivery_terms || null,
        shipping_address: data.shipping_address || null,
        special_instructions: data.special_instructions || null,
        terms_conditions: data.terms_conditions || null,
        internal_notes: data.internal_notes || null,
        po_status: saveAsDraft ? 'draft' as const : 'pending_approval' as const,
        approval_status: 'pending' as const,
        created_by: 1 // This should come from auth context
      };

      let finalPoId: number;

      if (isEdit && !isDuplicate) {
        // Update existing PO
        const { error: updateError } = await supabase
          .from('purchase_orders')
          .update(poData)
          .eq('po_id', parseInt(poId!));

        if (updateError) throw updateError;

        // Delete existing items
        const { error: deleteError } = await supabase
          .from('purchase_order_details')
          .delete()
          .eq('po_id', parseInt(poId!));

        if (deleteError) throw deleteError;

        finalPoId = parseInt(poId!);
      } else {
        // Create new PO
        const { data: newPO, error: insertError } = await supabase
          .from('purchase_orders')
          .insert([poData])
          .select('po_id')
          .single();

        if (insertError) throw insertError;
        finalPoId = newPO.po_id;
      }

      // Insert items
      const itemsData = data.items.map(item => {
        const lineSubtotal = item.quantity * item.rate;
        const lineDiscount = item.discount_percent > 0 ? (lineSubtotal * item.discount_percent / 100) : item.discount_amount;
        const lineTaxable = lineSubtotal - lineDiscount;
        const lineTax = lineTaxable * item.tax_rate / 100;
        const lineTotal = lineTaxable + lineTax;

        return {
          po_id: finalPoId,
          product_id: item.product_id,
          variant_id: item.variant_id || null,
          product_code: item.product_code,
          product_name: item.product_name,
          product_description: item.product_description || null,
          hsn_code: item.hsn_code || null,
          uom_id: item.uom_id,
          quantity: item.quantity,
          rate: item.rate,
          discount_percent: item.discount_percent,
          discount_amount: lineDiscount,
          taxable_amount: lineTaxable,
          tax_rate: item.tax_rate,
          tax_amount: lineTax,
          total_amount: lineTotal,
          received_quantity: 0,
          pending_quantity: item.quantity,
          line_status: 'pending' as const,
          expected_delivery_date: item.expected_delivery_date ? format(item.expected_delivery_date, 'yyyy-MM-dd') : null,
          special_instructions: item.special_instructions || null
        };
      });

      const { error: itemsError } = await supabase
        .from('purchase_order_details')
        .insert(itemsData);

      if (itemsError) throw itemsError;

      toast.success(isEdit && !isDuplicate ? 'Purchase order updated successfully' : 'Purchase order created successfully');
      navigate('/purchase/orders/list');
    } catch (error) {
      console.error('Error saving purchase order:', error);
      toast.error('Failed to save purchase order');
    } finally {
      setLoading(false);
    }
  };

  const totals = calculateTotals();

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate('/purchase/orders/list')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to List
          </Button>
          <div>
            <h1 className="text-3xl font-bold">
              {isEdit && !isDuplicate ? 'Edit Purchase Order' : 'Add Purchase Order'}
            </h1>
            <p className="text-muted-foreground">
              {isEdit && !isDuplicate ? 'Update purchase order details' : 'Create a new purchase order'}
            </p>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit((data) => onSubmit(data, true))} className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Purchase Order Details</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="po_number"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>PO Number</FormLabel>
                      <FormControl>
                        <Input {...field} readOnly />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="po_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>PO Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full justify-start text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {field.value ? format(field.value, "PPP") : "Select date"}
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            className="pointer-events-auto"
                          />
                        </PopoverContent>
                      </Popover>
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
                      <Select
                        value={field.value?.toString()}
                        onValueChange={(value) => field.onChange(parseInt(value))}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select vendor" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {vendors.map((vendor) => (
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
                      <Select
                        value={field.value?.toString()}
                        onValueChange={(value) => field.onChange(parseInt(value))}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select warehouse" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {warehouses.map((warehouse) => (
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
                  name="reference_number"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Reference Number</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="quote_number"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Quote Number</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="expected_delivery_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Expected Delivery Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full justify-start text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {field.value ? format(field.value, "PPP") : "Select date"}
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            className="pointer-events-auto"
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="currency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Currency</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="exchange_rate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Exchange Rate</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.0001"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Line Items</CardTitle>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => append({
                    product_id: 0,
                    product_code: "",
                    product_name: "",
                    product_description: "",
                    hsn_code: "",
                    uom_id: 0,
                    quantity: 1,
                    rate: 0,
                    discount_percent: 0,
                    discount_amount: 0,
                    tax_rate: 0
                  })}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Item
                </Button>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>UOM</TableHead>
                      <TableHead>Qty</TableHead>
                      <TableHead>Rate</TableHead>
                      <TableHead>Disc %</TableHead>
                      <TableHead>Tax %</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {fields.map((field, index) => (
                      <TableRow key={field.id}>
                        <TableCell>
                          <FormField
                            control={form.control}
                            name={`items.${index}.product_id`}
                            render={({ field }) => (
                              <Select
                                value={field.value?.toString()}
                                onValueChange={(value) => onProductChange(index, parseInt(value))}
                              >
                                <SelectTrigger className="w-40">
                                  <SelectValue placeholder="Select product" />
                                </SelectTrigger>
                                <SelectContent>
                                  {products.map((product) => (
                                    <SelectItem key={product.product_id} value={product.product_id.toString()}>
                                      {product.product_name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            )}
                          />
                        </TableCell>
                        <TableCell>
                          <FormField
                            control={form.control}
                            name={`items.${index}.uom_id`}
                            render={({ field }) => (
                              <Select
                                value={field.value?.toString()}
                                onValueChange={(value) => field.onChange(parseInt(value))}
                              >
                                <SelectTrigger className="w-24">
                                  <SelectValue placeholder="UOM" />
                                </SelectTrigger>
                                <SelectContent>
                                  {uoms.map((uom) => (
                                    <SelectItem key={uom.uom_id} value={uom.uom_id.toString()}>
                                      {uom.uom_name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            )}
                          />
                        </TableCell>
                        <TableCell>
                          <FormField
                            control={form.control}
                            name={`items.${index}.quantity`}
                            render={({ field }) => (
                              <Input
                                type="number"
                                step="0.01"
                                className="w-20"
                                {...field}
                                onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                              />
                            )}
                          />
                        </TableCell>
                        <TableCell>
                          <FormField
                            control={form.control}
                            name={`items.${index}.rate`}
                            render={({ field }) => (
                              <Input
                                type="number"
                                step="0.01"
                                className="w-24"
                                {...field}
                                onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                              />
                            )}
                          />
                        </TableCell>
                        <TableCell>
                          <FormField
                            control={form.control}
                            name={`items.${index}.discount_percent`}
                            render={({ field }) => (
                              <Input
                                type="number"
                                step="0.01"
                                className="w-20"
                                {...field}
                                onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                              />
                            )}
                          />
                        </TableCell>
                        <TableCell>
                          <FormField
                            control={form.control}
                            name={`items.${index}.tax_rate`}
                            render={({ field }) => (
                              <Input
                                type="number"
                                step="0.01"
                                className="w-20"
                                {...field}
                                onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                              />
                            )}
                          />
                        </TableCell>
                        <TableCell>
                          ₹{calculateLineTotal(form.getValues(`items.${index}`)).toFixed(2)}
                        </TableCell>
                        <TableCell>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => remove(index)}
                            disabled={fields.length === 1}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Additional Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="payment_terms"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Payment Terms</FormLabel>
                        <FormControl>
                          <Textarea {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="delivery_terms"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Delivery Terms</FormLabel>
                        <FormControl>
                          <Textarea {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="shipping_address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Shipping Address</FormLabel>
                        <FormControl>
                          <Textarea {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="special_instructions"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Special Instructions</FormLabel>
                        <FormControl>
                          <Textarea {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="terms_conditions"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Terms & Conditions</FormLabel>
                        <FormControl>
                          <Textarea {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="internal_notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Internal Notes</FormLabel>
                        <FormControl>
                          <Textarea {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>₹{totals.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Discount:</span>
                    <span>₹{totals.totalDiscount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Taxable Amount:</span>
                    <span>₹{totals.taxableAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax:</span>
                    <span>₹{totals.totalTax.toFixed(2)}</span>
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="freight_charges"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Freight Charges</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="other_charges"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Other Charges</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex justify-between font-bold text-lg border-t pt-2">
                    <span>Grand Total:</span>
                    <span>₹{totals.grandTotal.toFixed(2)}</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="flex gap-4 justify-end">
              <Button type="button" variant="outline" onClick={() => navigate('/purchase/orders/list')}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Saving...' : 'Save as Draft'}
              </Button>
              <Button
                type="button"
                onClick={form.handleSubmit((data) => onSubmit(data, false))}
                disabled={loading}
              >
                {loading ? 'Submitting...' : 'Submit for Approval'}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </Layout>
  );
};

export default PurchaseOrderEdit;
