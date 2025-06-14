
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

interface SalesReturnForm {
  return_number: string;
  return_date: string;
  return_time: string;
  original_invoice_id: string;
  customer_id: string;
  return_reason: string;
  return_authorization: string;
  refund_mode: string;
}

interface ReturnLineItem {
  id?: number;
  product_id: number;
  product_code: string;
  product_name: string;
  product_description: string;
  hsn_code: string;
  uom_id: number;
  quantity_returned: number;
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
  condition: string;
  disposition: string;
  max_quantity: number;
}

const SalesReturnEdit = () => {
  const { returnId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [lineItems, setLineItems] = useState<ReturnLineItem[]>([]);
  const [selectedInvoiceItems, setSelectedInvoiceItems] = useState<any[]>([]);
  const [calculations, setCalculations] = useState({
    subtotal: 0,
    totalDiscount: 0,
    taxableAmount: 0,
    totalCgst: 0,
    totalSgst: 0,
    totalIgst: 0,
    grandTotal: 0,
  });

  const isEdit = Boolean(returnId);

  const form = useForm<SalesReturnForm>({
    defaultValues: {
      return_number: "",
      return_date: new Date().toISOString().split('T')[0],
      return_time: new Date().toTimeString().split(' ')[0],
      original_invoice_id: "",
      customer_id: "",
      return_reason: "",
      return_authorization: "",
      refund_mode: "cash",
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
      
      const { count } = await supabase
        .from('sales_returns')
        .select('*', { count: 'exact', head: true })
        .gte('return_date', today.toISOString().split('T')[0]);
      
      const sequentialNumber = (count || 0) + 1;
      const returnNumber = `${company?.company_code || 'COMP'}-SR-${dateStr}-${sequentialNumber.toString().padStart(4, '0')}`;
      
      return returnNumber;
    } catch (error) {
      console.error('Error generating return number:', error);
      return `SR-${Date.now()}`;
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

  // Fetch sales invoices for dropdown (only unpaid or partially paid)
  const { data: salesInvoices } = useQuery({
    queryKey: ['sales-invoices-for-return'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sales_invoices')
        .select('sales_id, invoice_number, customer_id, customers(customer_name)')
        .in('payment_status', ['unpaid', 'partial'])
        .order('invoice_date', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  // Watch invoice selection to load invoice details
  const selectedInvoiceId = form.watch('original_invoice_id');
  
  const { data: invoiceDetails } = useQuery({
    queryKey: ['invoice-details', selectedInvoiceId],
    queryFn: async () => {
      if (!selectedInvoiceId) return null;
      
      const { data, error } = await supabase
        .from('sales_invoice_details')
        .select(`
          *,
          products(product_name, product_code, product_description, hsn_sac_code)
        `)
        .eq('sales_id', parseInt(selectedInvoiceId));
      
      if (error) throw error;
      return data;
    },
    enabled: !!selectedInvoiceId,
  });

  // Auto-populate customer when invoice is selected
  useEffect(() => {
    if (selectedInvoiceId && salesInvoices) {
      const invoice = salesInvoices.find(inv => inv.sales_id === parseInt(selectedInvoiceId));
      if (invoice) {
        form.setValue('customer_id', invoice.customer_id);
        
        // Load invoice line items for return
        if (invoiceDetails) {
          const returnItems: ReturnLineItem[] = invoiceDetails.map(item => ({
            product_id: item.product_id,
            product_code: item.product_code || item.products?.product_code || '',
            product_name: item.product_name || item.products?.product_name || '',
            product_description: item.product_description || item.products?.product_description || '',
            hsn_code: item.hsn_code || item.products?.hsn_sac_code || '',
            uom_id: item.uom_id,
            quantity_returned: 0,
            rate: item.rate,
            discount_percent: item.discount_percent,
            discount_amount: 0,
            taxable_amount: 0,
            tax_cgst_percent: item.tax_cgst_percent,
            tax_cgst_amount: 0,
            tax_sgst_percent: item.tax_sgst_percent,
            tax_sgst_amount: 0,
            tax_igst_percent: item.tax_igst_percent,
            tax_igst_amount: 0,
            total_amount: 0,
            condition: 'good',
            disposition: 'restock',
            max_quantity: item.quantity
          }));
          setSelectedInvoiceItems(returnItems);
        }
      }
    }
  }, [selectedInvoiceId, salesInvoices, invoiceDetails, form]);

  // Add line item from invoice
  const addLineItem = (invoiceItem: ReturnLineItem) => {
    const existingItem = lineItems.find(item => item.product_id === invoiceItem.product_id);
    if (existingItem) {
      toast({
        title: "Item already added",
        description: "This product is already in the return list.",
        variant: "destructive",
      });
      return;
    }
    
    setLineItems([...lineItems, { ...invoiceItem, quantity_returned: 1 }]);
  };

  // Remove line item
  const removeLineItem = (index: number) => {
    const updatedItems = lineItems.filter((_, i) => i !== index);
    setLineItems(updatedItems);
  };

  // Update line item
  const updateLineItem = (index: number, field: keyof ReturnLineItem, value: any) => {
    const updatedItems = [...lineItems];
    updatedItems[index] = { ...updatedItems[index], [field]: value };

    // Recalculate line amounts
    if (['quantity_returned', 'rate', 'discount_percent'].includes(field)) {
      const item = updatedItems[index];
      const lineTotal = item.quantity_returned * item.rate;
      
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
    const subtotal = lineItems.reduce((sum, item) => sum + (item.quantity_returned * item.rate), 0);
    const totalDiscount = lineItems.reduce((sum, item) => sum + item.discount_amount, 0);
    const taxableAmount = subtotal - totalDiscount;
    const totalCgst = lineItems.reduce((sum, item) => sum + item.tax_cgst_amount, 0);
    const totalSgst = lineItems.reduce((sum, item) => sum + item.tax_sgst_amount, 0);
    const totalIgst = lineItems.reduce((sum, item) => sum + item.tax_igst_amount, 0);
    const grandTotal = taxableAmount + totalCgst + totalSgst + totalIgst;

    setCalculations({
      subtotal,
      totalDiscount,
      taxableAmount,
      totalCgst,
      totalSgst,
      totalIgst,
      grandTotal,
    });
  }, [lineItems]);

  // Save mutation
  const saveMutation = useMutation({
    mutationFn: async (data: SalesReturnForm) => {
      const returnData = {
        company_id: 1, // This should come from context/auth
        warehouse_id: 1, // This should be selectable
        return_number: data.return_number,
        return_date: data.return_date,
        return_time: data.return_time,
        original_invoice_id: parseInt(data.original_invoice_id),
        customer_id: data.customer_id,
        return_reason: data.return_reason,
        return_authorization: data.return_authorization,
        subtotal: calculations.subtotal,
        discount_amount: calculations.totalDiscount,
        taxable_amount: calculations.taxableAmount,
        tax_cgst_amount: calculations.totalCgst,
        tax_sgst_amount: calculations.totalSgst,
        tax_igst_amount: calculations.totalIgst,
        total_amount: calculations.grandTotal,
        refund_mode: data.refund_mode as 'cash' | 'bank' | 'credit_note',
        return_status: 'draft',
        created_by: 1, // This should come from auth context
      };

      if (isEdit && returnId) {
        // Update existing return
        const { error } = await supabase
          .from('sales_returns')
          .update({
            ...returnData,
            updated_by: 1, // This should come from auth context
          })
          .eq('sales_return_id', parseInt(returnId));
        
        if (error) throw error;

        // Delete existing line items and re-insert
        await supabase
          .from('sales_return_details')
          .delete()
          .eq('sales_return_id', parseInt(returnId));

        if (lineItems.length > 0) {
          const lineItemsData = lineItems.map(item => ({
            sales_return_id: parseInt(returnId),
            product_id: item.product_id,
            product_code: item.product_code,
            product_name: item.product_name,
            product_description: item.product_description,
            hsn_code: item.hsn_code,
            uom_id: item.uom_id,
            quantity_returned: item.quantity_returned,
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
            .from('sales_return_details')
            .insert(lineItemsData);
          
          if (lineError) throw lineError;
        }

        return { sales_return_id: parseInt(returnId) };
      } else {
        // Create new return
        const { data: newReturn, error } = await supabase
          .from('sales_returns')
          .insert(returnData)
          .select()
          .single();
        
        if (error) throw error;

        // Insert line items
        if (lineItems.length > 0) {
          const lineItemsData = lineItems.map(item => ({
            sales_return_id: newReturn.sales_return_id,
            product_id: item.product_id,
            product_code: item.product_code,
            product_name: item.product_name,
            product_description: item.product_description,
            hsn_code: item.hsn_code,
            uom_id: item.uom_id,
            quantity_returned: item.quantity_returned,
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
            .from('sales_return_details')
            .insert(lineItemsData);
          
          if (lineError) throw lineError;
        }

        // Create financial transaction record
        await supabase
          .from('financial_transactions')
          .insert({
            company_id: 1,
            module: 'sales',
            module_reference_id: newReturn.sales_return_id,
            transaction_date: data.return_date,
            transaction_time: data.return_time,
            gl_entry_created: false,
            created_by: 1,
          });

        return newReturn;
      }
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: `Sales return ${isEdit ? 'updated' : 'created'} successfully.`,
      });
      navigate('/sales/returns/list');
    },
    onError: (error: any) => {
      console.error('Error saving sales return:', error);
      toast({
        title: "Error",
        description: `Failed to ${isEdit ? 'update' : 'create'} sales return.`,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: SalesReturnForm) => {
    if (lineItems.length === 0) {
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
          <Button variant="outline" onClick={() => navigate('/sales/returns/list')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-3xl font-bold">
            {isEdit ? 'Edit Sales Return' : 'Create Sales Return'}
          </h1>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Return Header */}
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
                  name="original_invoice_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Original Invoice</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select invoice" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {salesInvoices?.map((invoice) => (
                            <SelectItem key={invoice.sales_id} value={invoice.sales_id.toString()}>
                              {invoice.invoice_number} - {invoice.customers?.customer_name}
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
                  name="refund_mode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Refund Mode</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select refund mode" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="cash">Cash</SelectItem>
                          <SelectItem value="bank">Bank Transfer</SelectItem>
                          <SelectItem value="credit_note">Credit Note</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="return_authorization"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Return Authorization</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Authorization code" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="md:col-span-2 lg:col-span-3">
                  <FormField
                    control={form.control}
                    name="return_reason"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Return Reason</FormLabel>
                        <FormControl>
                          <Textarea {...field} placeholder="Reason for return..." />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Available Items from Invoice */}
            {selectedInvoiceItems.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Available Items from Invoice</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Product</TableHead>
                          <TableHead>Original Qty</TableHead>
                          <TableHead>Rate</TableHead>
                          <TableHead>Action</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selectedInvoiceItems.map((item, index) => (
                          <TableRow key={index}>
                            <TableCell>{item.product_name}</TableCell>
                            <TableCell>{item.max_quantity}</TableCell>
                            <TableCell>₹{item.rate.toFixed(2)}</TableCell>
                            <TableCell>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => addLineItem(item)}
                                disabled={lineItems.some(li => li.product_id === item.product_id)}
                              >
                                <Plus className="h-4 w-4 mr-1" />
                                Add to Return
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Return Items */}
            <Card>
              <CardHeader>
                <CardTitle>Return Items</CardTitle>
              </CardHeader>
              <CardContent>
                {lineItems.length > 0 ? (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Product</TableHead>
                          <TableHead>Return Qty</TableHead>
                          <TableHead>Rate</TableHead>
                          <TableHead>Condition</TableHead>
                          <TableHead>Disposition</TableHead>
                          <TableHead>Total</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {lineItems.map((item, index) => (
                          <TableRow key={index}>
                            <TableCell>{item.product_name}</TableCell>
                            <TableCell>
                              <Input
                                type="number"
                                value={item.quantity_returned}
                                onChange={(e) => updateLineItem(index, 'quantity_returned', parseFloat(e.target.value) || 0)}
                                max={item.max_quantity}
                                min={0}
                                className="w-20"
                              />
                            </TableCell>
                            <TableCell>₹{item.rate.toFixed(2)}</TableCell>
                            <TableCell>
                              <Select
                                value={item.condition}
                                onValueChange={(value) => updateLineItem(index, 'condition', value)}
                              >
                                <SelectTrigger className="w-24">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="new">New</SelectItem>
                                  <SelectItem value="good">Good</SelectItem>
                                  <SelectItem value="damaged">Damaged</SelectItem>
                                </SelectContent>
                              </Select>
                            </TableCell>
                            <TableCell>
                              <Select
                                value={item.disposition}
                                onValueChange={(value) => updateLineItem(index, 'disposition', value)}
                              >
                                <SelectTrigger className="w-24">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="restock">Restock</SelectItem>
                                  <SelectItem value="scrap">Scrap</SelectItem>
                                </SelectContent>
                              </Select>
                            </TableCell>
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
                    No items added for return yet. Select an invoice and add items above.
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Calculations */}
            {lineItems.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Return Summary</CardTitle>
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
                    
                    <div className="text-right font-bold text-lg border-t pt-2">Total Return Amount:</div>
                    <div className="font-bold text-lg border-t pt-2">₹{calculations.grandTotal.toFixed(2)}</div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Actions */}
            <div className="flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/sales/returns/list')}
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

export default SalesReturnEdit;
