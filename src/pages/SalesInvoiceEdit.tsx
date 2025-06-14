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
import { ArrowLeft, Save, Plus, Trash2, Scan } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import Layout from "@/components/Layout";

interface SalesInvoiceForm {
  invoice_number: string;
  invoice_date: string;
  invoice_time: string;
  customer_id: string;
  customer_gst_number: string;
  place_of_supply: string;
  billing_address: string;
  shipping_address: string;
  due_date: string;
  salesperson_id: string;
  reference_number: string;
  payment_terms: string;
  payment_mode: string;
  advance_received: string;
  terms_conditions: string;
  internal_notes: string;
  vehicle_number: string;
}

interface InvoiceLineItem {
  id?: number;
  product_id: number;
  product_code: string;
  product_name: string;
  product_description: string;
  hsn_code: string;
  uom_id: number;
  quantity: number;
  rate: number;
  discount_percent: number;
  discount_amount: number;
  taxable_amount: number;
  tax_cgst_percent: number;
  tax_cgst_amount: number;
  tax_sgst_percent: number;
  tax_sgst_amount: number;
  tax_igst_percent: number;
  tax_igst_amount: number;
  total_amount: number;
}

const SalesInvoiceEdit = () => {
  const { salesId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [lineItems, setLineItems] = useState<InvoiceLineItem[]>([]);
  const [calculations, setCalculations] = useState({
    subtotal: 0,
    totalDiscount: 0,
    taxableAmount: 0,
    totalCgst: 0,
    totalSgst: 0,
    totalIgst: 0,
    freightCharges: 0,
    packingCharges: 0,
    roundOff: 0,
    grandTotal: 0,
  });

  const isEdit = Boolean(salesId);

  const form = useForm<SalesInvoiceForm>({
    defaultValues: {
      invoice_number: "",
      invoice_date: new Date().toISOString().split('T')[0],
      invoice_time: new Date().toTimeString().split(' ')[0],
      customer_id: "",
      customer_gst_number: "",
      place_of_supply: "",
      billing_address: "",
      shipping_address: "",
      due_date: "",
      salesperson_id: "",
      reference_number: "",
      payment_terms: "NET 30",
      payment_mode: "credit",
      advance_received: "0",
      terms_conditions: "",
      internal_notes: "",
      vehicle_number: "",
    },
  });

  // Generate invoice number
  const generateInvoiceNumber = async () => {
    try {
      const { data: company } = await supabase
        .from('companies')
        .select('company_code')
        .single();
      
      const today = new Date();
      const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
      
      const { count } = await supabase
        .from('sales_invoices')
        .select('*', { count: 'exact', head: true })
        .gte('invoice_date', today.toISOString().split('T')[0]);
      
      const sequentialNumber = (count || 0) + 1;
      const invoiceNumber = `${company?.company_code || 'COMP'}-INV-${dateStr}-${sequentialNumber.toString().padStart(4, '0')}`;
      
      return invoiceNumber;
    } catch (error) {
      console.error('Error generating invoice number:', error);
      return `INV-${Date.now()}`;
    }
  };

  // Initialize invoice number for new invoices
  useEffect(() => {
    if (!isEdit) {
      generateInvoiceNumber().then(invoiceNumber => {
        form.setValue('invoice_number', invoiceNumber);
      });
    }
  }, [isEdit, form]);

  // Fetch customers
  const { data: customers } = useQuery({
    queryKey: ['customers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('customers')
        .select('customer_id, customer_name, gstin, payment_terms')
        .eq('is_active', true)
        .order('customer_name');
      
      if (error) throw error;
      return data;
    },
  });

  // Fetch products
  const { data: products } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('product_id, product_code, product_name, product_description, hsn_sac_code, retail_rate, base_uom_id')
        .eq('is_active', true)
        .order('product_name');
      
      if (error) throw error;
      return data;
    },
  });

  // Watch customer selection to auto-populate fields
  const selectedCustomerId = form.watch('customer_id');
  useEffect(() => {
    if (selectedCustomerId && customers) {
      const customer = customers.find(c => c.customer_id === selectedCustomerId);
      if (customer) {
        form.setValue('customer_gst_number', customer.gstin || '');
        form.setValue('payment_terms', customer.payment_terms || 'NET 30');
        
        // Set due date based on payment terms
        const invoiceDate = new Date(form.getValues('invoice_date'));
        const daysToAdd = customer.payment_terms?.includes('30') ? 30 : 0;
        const dueDate = new Date(invoiceDate.getTime() + (daysToAdd * 24 * 60 * 60 * 1000));
        form.setValue('due_date', dueDate.toISOString().split('T')[0]);
      }
    }
  }, [selectedCustomerId, customers, form]);

  // Add new line item
  const addLineItem = () => {
    const newItem: InvoiceLineItem = {
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
      taxable_amount: 0,
      tax_cgst_percent: 9,
      tax_cgst_amount: 0,
      tax_sgst_percent: 9,
      tax_sgst_amount: 0,
      tax_igst_percent: 0,
      tax_igst_amount: 0,
      total_amount: 0,
    };
    setLineItems([...lineItems, newItem]);
  };

  // Remove line item
  const removeLineItem = (index: number) => {
    const updatedItems = lineItems.filter((_, i) => i !== index);
    setLineItems(updatedItems);
  };

  // Update line item
  const updateLineItem = (index: number, field: keyof InvoiceLineItem, value: any) => {
    const updatedItems = [...lineItems];
    updatedItems[index] = { ...updatedItems[index], [field]: value };

    // Auto-populate product details when product is selected
    if (field === 'product_id' && products) {
      const product = products.find(p => p.product_id === value);
      if (product) {
        updatedItems[index].product_code = product.product_code;
        updatedItems[index].product_name = product.product_name;
        updatedItems[index].product_description = product.product_description || '';
        updatedItems[index].hsn_code = product.hsn_sac_code || '';
        updatedItems[index].rate = Number(product.retail_rate) || 0;
        updatedItems[index].uom_id = product.base_uom_id;
      }
    }

    // Recalculate line amounts
    if (['quantity', 'rate', 'discount_percent', 'discount_amount'].includes(field)) {
      const item = updatedItems[index];
      const lineTotal = item.quantity * item.rate;
      
      if (field === 'discount_percent') {
        item.discount_amount = (lineTotal * item.discount_percent) / 100;
      }
      
      item.taxable_amount = lineTotal - item.discount_amount;
      item.tax_cgst_amount = (item.taxable_amount * item.tax_cgst_percent) / 100;
      item.tax_sgst_amount = (item.taxable_amount * item.tax_sgst_percent) / 100;
      item.tax_igst_amount = (item.taxable_amount * item.tax_igst_percent) / 100;
      item.total_amount = item.taxable_amount + item.tax_cgst_amount + item.tax_sgst_amount + item.tax_igst_amount;
    }

    setLineItems(updatedItems);
  };

  // Calculate totals whenever line items change
  useEffect(() => {
    const subtotal = lineItems.reduce((sum, item) => sum + (item.quantity * item.rate), 0);
    const totalDiscount = lineItems.reduce((sum, item) => sum + item.discount_amount, 0);
    const taxableAmount = subtotal - totalDiscount;
    const totalCgst = lineItems.reduce((sum, item) => sum + item.tax_cgst_amount, 0);
    const totalSgst = lineItems.reduce((sum, item) => sum + item.tax_sgst_amount, 0);
    const totalIgst = lineItems.reduce((sum, item) => sum + item.tax_igst_amount, 0);
    
    const freightCharges = 0; // Can be added as form field
    const packingCharges = 0; // Can be added as form field
    const beforeRounding = taxableAmount + totalCgst + totalSgst + totalIgst + freightCharges + packingCharges;
    const roundOff = Math.round(beforeRounding) - beforeRounding;
    const grandTotal = beforeRounding + roundOff;

    setCalculations({
      subtotal,
      totalDiscount,
      taxableAmount,
      totalCgst,
      totalSgst,
      totalIgst,
      freightCharges,
      packingCharges,
      roundOff,
      grandTotal,
    });
  }, [lineItems]);

  // Save mutation
  const saveMutation = useMutation({
    mutationFn: async (data: SalesInvoiceForm) => {
      const invoiceData = {
        company_id: 1, // This should come from context/auth
        warehouse_id: 1, // This should be selectable
        invoice_number: data.invoice_number,
        invoice_date: data.invoice_date,
        invoice_time: data.invoice_time,
        customer_id: parseInt(data.customer_id), // Convert string to number
        customer_gst_number: data.customer_gst_number,
        place_of_supply: data.place_of_supply,
        billing_address: data.billing_address,
        shipping_address: data.shipping_address,
        due_date: data.due_date,
        salesperson_id: data.salesperson_id ? parseInt(data.salesperson_id) : null,
        reference_number: data.reference_number,
        subtotal: calculations.subtotal,
        discount_amount: calculations.totalDiscount,
        taxable_amount: calculations.taxableAmount,
        tax_cgst_amount: calculations.totalCgst,
        tax_sgst_amount: calculations.totalSgst,
        tax_igst_amount: calculations.totalIgst,
        freight_charges: calculations.freightCharges,
        packing_charges: calculations.packingCharges,
        round_off_amount: calculations.roundOff,
        grand_total: calculations.grandTotal,
        payment_terms: data.payment_terms,
        payment_mode: data.payment_mode as 'credit' | 'cash' | 'bank' | 'cheque' | 'online',
        advance_received: parseFloat(data.advance_received),
        balance_amount: calculations.grandTotal - parseFloat(data.advance_received),
        payment_status: (
          parseFloat(data.advance_received) === 0
            ? 'unpaid'
            : parseFloat(data.advance_received) >= calculations.grandTotal
              ? 'paid'
              : 'partial'
        ) as 'unpaid' | 'partial' | 'paid',
        terms_conditions: data.terms_conditions,
        internal_notes: data.internal_notes,
        vehicle_number: data.vehicle_number,
        is_credit_note: false,
        created_by: 1, // This should come from auth context
      };

      if (isEdit && salesId) {
        // Update existing invoice
        const { error } = await supabase
          .from('sales_invoices')
          .update({
            ...invoiceData,
            updated_by: 1, // This should come from auth context
          })
          .eq('sales_id', parseInt(salesId));
        
        if (error) throw error;

        // Delete existing line items and re-insert
        await supabase
          .from('sales_invoice_details')
          .delete()
          .eq('sales_id', parseInt(salesId));

        if (lineItems.length > 0) {
          const lineItemsData = lineItems.map(item => ({
            sales_id: parseInt(salesId),
            product_id: item.product_id,
            product_code: item.product_code,
            product_name: item.product_name,
            product_description: item.product_description,
            hsn_code: item.hsn_code,
            uom_id: item.uom_id,
            quantity: item.quantity,
            rate: item.rate,
            discount_percent: item.discount_percent,
            discount_amount: item.discount_amount,
            taxable_amount: item.taxable_amount,
            tax_cgst_percent: item.tax_cgst_percent,
            tax_cgst_amount: item.tax_cgst_amount,
            tax_sgst_percent: item.tax_sgst_percent,
            tax_sgst_amount: item.tax_sgst_amount,
            tax_igst_percent: item.tax_igst_percent,
            tax_igst_amount: item.tax_igst_amount,
            total_amount: item.total_amount,
          }));

          const { error: lineError } = await supabase
            .from('sales_invoice_details')
            .insert(lineItemsData);
          
          if (lineError) throw lineError;
        }

        return { sales_id: parseInt(salesId) };
      } else {
        // Create new invoice
        const { data: newInvoice, error } = await supabase
          .from('sales_invoices')
          .insert(invoiceData)
          .select()
          .single();
        
        if (error) throw error;

        // Insert line items
        if (lineItems.length > 0) {
          const lineItemsData = lineItems.map(item => ({
            sales_id: newInvoice.sales_id,
            product_id: item.product_id,
            product_code: item.product_code,
            product_name: item.product_name,
            product_description: item.product_description,
            hsn_code: item.hsn_code,
            uom_id: item.uom_id,
            quantity: item.quantity,
            rate: item.rate,
            discount_percent: item.discount_percent,
            discount_amount: item.discount_amount,
            taxable_amount: item.taxable_amount,
            tax_cgst_percent: item.tax_cgst_percent,
            tax_cgst_amount: item.tax_cgst_amount,
            tax_sgst_percent: item.tax_sgst_percent,
            tax_sgst_amount: item.tax_sgst_amount,
            tax_igst_percent: item.tax_igst_percent,
            tax_igst_amount: item.tax_igst_amount,
            total_amount: item.total_amount,
          }));

          const { error: lineError } = await supabase
            .from('sales_invoice_details')
            .insert(lineItemsData);
          
          if (lineError) throw lineError;
        }

        return newInvoice;
      }
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: `Sales invoice ${isEdit ? 'updated' : 'created'} successfully.`,
      });
      navigate('/sales/invoices/list');
    },
    onError: (error: any) => {
      console.error('Error saving sales invoice:', error);
      toast({
        title: "Error",
        description: `Failed to ${isEdit ? 'update' : 'create'} sales invoice.`,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: SalesInvoiceForm) => {
    if (lineItems.length === 0) {
      toast({
        title: "Error",
        description: "Please add at least one line item.",
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
          <Button variant="outline" onClick={() => navigate('/sales/invoices/list')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-3xl font-bold">
            {isEdit ? 'Edit Sales Invoice' : 'Create Sales Invoice'}
          </h1>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Invoice Header */}
            <Card>
              <CardHeader>
                <CardTitle>Invoice Information</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="invoice_number"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Invoice Number</FormLabel>
                      <FormControl>
                        <Input {...field} readOnly className="bg-gray-50" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="invoice_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Invoice Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="invoice_time"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Invoice Time</FormLabel>
                      <FormControl>
                        <Input type="time" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="customer_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Customer</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select customer" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {customers?.map((customer) => (
                            <SelectItem key={customer.customer_id} value={customer.customer_id.toString()}>
                              {customer.customer_name}
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
                  name="due_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Due Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
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
                        <Input {...field} placeholder="PO Number, etc." />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Line Items */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Line Items</CardTitle>
                  <Button type="button" onClick={addLineItem}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Item
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {lineItems.length > 0 ? (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Product</TableHead>
                          <TableHead>Qty</TableHead>
                          <TableHead>Rate</TableHead>
                          <TableHead>Disc %</TableHead>
                          <TableHead>Taxable</TableHead>
                          <TableHead>Tax</TableHead>
                          <TableHead>Total</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {lineItems.map((item, index) => (
                          <TableRow key={index}>
                            <TableCell>
                              <Select
                                value={item.product_id.toString()}
                                onValueChange={(value) => updateLineItem(index, 'product_id', parseInt(value))}
                              >
                                <SelectTrigger className="w-48">
                                  <SelectValue placeholder="Select product" />
                                </SelectTrigger>
                                <SelectContent>
                                  {products?.map((product) => (
                                    <SelectItem key={product.product_id} value={product.product_id.toString()}>
                                      {product.product_name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </TableCell>
                            <TableCell>
                              <Input
                                type="number"
                                value={item.quantity}
                                onChange={(e) => updateLineItem(index, 'quantity', parseFloat(e.target.value) || 0)}
                                className="w-20"
                              />
                            </TableCell>
                            <TableCell>
                              <Input
                                type="number"
                                step="0.01"
                                value={item.rate}
                                onChange={(e) => updateLineItem(index, 'rate', parseFloat(e.target.value) || 0)}
                                className="w-24"
                              />
                            </TableCell>
                            <TableCell>
                              <Input
                                type="number"
                                step="0.01"
                                value={item.discount_percent}
                                onChange={(e) => updateLineItem(index, 'discount_percent', parseFloat(e.target.value) || 0)}
                                className="w-20"
                              />
                            </TableCell>
                            <TableCell>₹{item.taxable_amount.toFixed(2)}</TableCell>
                            <TableCell>₹{(item.tax_cgst_amount + item.tax_sgst_amount + item.tax_igst_amount).toFixed(2)}</TableCell>
                            <TableCell>₹{item.total_amount.toFixed(2)}</TableCell>
                            <TableCell>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => removeLineItem(index)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No line items added yet. Click "Add Item" to get started.
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Calculations */}
            <Card>
              <CardHeader>
                <CardTitle>Invoice Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 max-w-md ml-auto">
                  <div className="text-right">Subtotal:</div>
                  <div>₹{calculations.subtotal.toFixed(2)}</div>
                  
                  <div className="text-right">Total Discount:</div>
                  <div>₹{calculations.totalDiscount.toFixed(2)}</div>
                  
                  <div className="text-right">Taxable Amount:</div>
                  <div>₹{calculations.taxableAmount.toFixed(2)}</div>
                  
                  <div className="text-right">CGST:</div>
                  <div>₹{calculations.totalCgst.toFixed(2)}</div>
                  
                  <div className="text-right">SGST:</div>
                  <div>₹{calculations.totalSgst.toFixed(2)}</div>
                  
                  <div className="text-right">IGST:</div>
                  <div>₹{calculations.totalIgst.toFixed(2)}</div>
                  
                  <div className="text-right">Round Off:</div>
                  <div>₹{calculations.roundOff.toFixed(2)}</div>
                  
                  <div className="text-right font-bold text-lg border-t pt-2">Grand Total:</div>
                  <div className="font-bold text-lg border-t pt-2">₹{calculations.grandTotal.toFixed(2)}</div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Information */}
            <Card>
              <CardHeader>
                <CardTitle>Payment Information</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="payment_mode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Payment Mode</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select payment mode" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="credit">Credit</SelectItem>
                          <SelectItem value="cash">Cash</SelectItem>
                          <SelectItem value="bank">Bank Transfer</SelectItem>
                          <SelectItem value="cheque">Cheque</SelectItem>
                          <SelectItem value="online">Online</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="advance_received"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Advance Received</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          {...field}
                          placeholder="0.00"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div>
                  <FormLabel>Balance Amount</FormLabel>
                  <Input
                    value={`₹${(calculations.grandTotal - parseFloat(form.watch('advance_received') || '0')).toFixed(2)}`}
                    readOnly
                    className="bg-gray-50"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/sales/invoices/list')}
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
                  ? 'Update Invoice'
                  : 'Create Invoice'}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </Layout>
  );
};

export default SalesInvoiceEdit;
