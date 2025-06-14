
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

interface VendorPaymentForm {
  payment_number: string;
  payment_date: string;
  vendor_id: string;
  payment_mode: string;
  bank_account: string;
  reference_number: string;
  amount_paid: string;
  currency: string;
  exchange_rate: string;
  discount_taken: string;
  tds_deduction: string;
  net_amount: string;
  balance_outstanding: string;
}

interface InvoiceAllocation {
  invoice_id: number;
  invoice_number: string;
  invoice_amount: number;
  amount_applied: number;
}

const VendorPaymentEdit = () => {
  const { paymentId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [invoiceAllocations, setInvoiceAllocations] = useState<InvoiceAllocation[]>([]);
  const [showBankFields, setShowBankFields] = useState(false);

  const isEdit = Boolean(paymentId);

  const form = useForm<VendorPaymentForm>({
    defaultValues: {
      payment_number: "",
      payment_date: new Date().toISOString().split('T')[0],
      vendor_id: "",
      payment_mode: "",
      bank_account: "",
      reference_number: "",
      amount_paid: "0",
      currency: "INR",
      exchange_rate: "1",
      discount_taken: "0",
      tds_deduction: "0",
      net_amount: "0",
      balance_outstanding: "0",
    },
  });

  // Generate payment number
  const generatePaymentNumber = async () => {
    try {
      const { data: company } = await supabase
        .from('companies')
        .select('company_code')
        .single();
      
      const today = new Date();
      const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
      
      // Get the count of payments for today to generate sequential number
      const { count } = await supabase
        .from('vendor_payments')
        .select('*', { count: 'exact', head: true })
        .gte('payment_date', today.toISOString().split('T')[0]);
      
      const sequentialNumber = (count || 0) + 1;
      const paymentNumber = `${company?.company_code || 'COMP'}-VP-${dateStr}-${sequentialNumber.toString().padStart(4, '0')}`;
      
      return paymentNumber;
    } catch (error) {
      console.error('Error generating payment number:', error);
      return `VP-${Date.now()}`;
    }
  };

  // Initialize payment number for new payments
  useEffect(() => {
    if (!isEdit) {
      generatePaymentNumber().then(paymentNumber => {
        form.setValue('payment_number', paymentNumber);
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

  // Fetch existing payment data if editing
  const { data: existingPayment } = useQuery({
    queryKey: ['vendor-payment', paymentId],
    queryFn: async () => {
      if (!isEdit || !paymentId) return null;
      
      const { data, error } = await supabase
        .from('vendor_payments')
        .select('*')
        .eq('payment_id', parseInt(paymentId))
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: isEdit && Boolean(paymentId),
  });

  // Populate form with existing data
  useEffect(() => {
    if (existingPayment) {
      form.reset({
        payment_number: String(existingPayment.payment_number || ""),
        payment_date: String(existingPayment.payment_date || ""),
        vendor_id: String(existingPayment.vendor_id || ""),
        payment_mode: String(existingPayment.payment_mode || ""),
        bank_account: String(existingPayment.bank_account || ""),
        reference_number: String(existingPayment.reference_number || ""),
        amount_paid: String(existingPayment.amount_paid || "0"),
        currency: String(existingPayment.currency || "INR"),
        exchange_rate: String(existingPayment.exchange_rate || "1"),
        discount_taken: String(existingPayment.discount_taken || "0"),
        tds_deduction: String(existingPayment.tds_deduction || "0"),
        net_amount: String(existingPayment.net_amount || "0"),
        balance_outstanding: String(existingPayment.balance_outstanding || "0"),
      });

      setShowBankFields(existingPayment.payment_mode !== 'cash');

      if (existingPayment.invoice_allocation) {
        try {
          const allocations = JSON.parse(String(existingPayment.invoice_allocation));
          setInvoiceAllocations(allocations);
        } catch (error) {
          console.error('Error parsing invoice allocation:', error);
        }
      }
    }
  }, [existingPayment, form]);

  // Watch payment mode to show/hide bank fields
  const paymentMode = form.watch('payment_mode');
  useEffect(() => {
    setShowBankFields(paymentMode !== 'cash');
    if (paymentMode === 'cash') {
      form.setValue('bank_account', '');
      form.setValue('reference_number', '');
    }
  }, [paymentMode, form]);

  // Calculate net amount and balance
  const calculateAmounts = () => {
    const amountPaid = parseFloat(form.getValues('amount_paid')) || 0;
    const discountTaken = parseFloat(form.getValues('discount_taken')) || 0;
    const tdsDeduction = parseFloat(form.getValues('tds_deduction')) || 0;
    
    const netAmount = amountPaid - discountTaken - tdsDeduction;
    form.setValue('net_amount', netAmount.toString());
    
    // This is a simplified calculation - in real implementation,
    // you would fetch the vendor's current outstanding balance
    const balanceOutstanding = 0 - netAmount;
    form.setValue('balance_outstanding', balanceOutstanding.toString());
  };

  // Watch amount fields to recalculate
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name && ['amount_paid', 'discount_taken', 'tds_deduction'].includes(name)) {
        calculateAmounts();
      }
    });
    return () => subscription.unsubscribe();
  }, [form]);

  // Save mutation
  const saveMutation = useMutation({
    mutationFn: async (data: VendorPaymentForm) => {
      const paymentData = {
        payment_number: data.payment_number,
        payment_date: data.payment_date,
        vendor_id: parseInt(data.vendor_id),
        payment_mode: data.payment_mode,
        bank_account: data.bank_account || null,
        reference_number: data.reference_number || null,
        amount_paid: parseFloat(data.amount_paid),
        currency: data.currency,
        exchange_rate: parseFloat(data.exchange_rate),
        invoice_allocation: invoiceAllocations.length > 0 ? JSON.stringify(invoiceAllocations) : null,
        discount_taken: parseFloat(data.discount_taken),
        tds_deduction: parseFloat(data.tds_deduction),
        net_amount: parseFloat(data.net_amount),
        balance_outstanding: parseFloat(data.balance_outstanding),
        company_id: 1, // This should come from context/auth
        created_by: 1, // This should come from auth context
      };

      if (isEdit && paymentId) {
        // Update existing payment
        const { error } = await supabase
          .from('vendor_payments')
          .update({
            ...paymentData,
            updated_by: 1, // This should come from auth context
          })
          .eq('payment_id', parseInt(paymentId));
        
        if (error) throw error;
        return { payment_id: parseInt(paymentId) };
      } else {
        // Create new payment
        const { data: newPayment, error } = await supabase
          .from('vendor_payments')
          .insert([paymentData])
          .select()
          .single();
        
        if (error) throw error;
        return newPayment;
      }
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: `Vendor payment ${isEdit ? 'updated' : 'created'} successfully.`,
      });
      navigate('/purchase/payments/list');
    },
    onError: (error: any) => {
      console.error('Error saving vendor payment:', error);
      toast({
        title: "Error",
        description: `Failed to ${isEdit ? 'update' : 'create'} vendor payment.`,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: VendorPaymentForm) => {
    saveMutation.mutate(data);
  };

  return (
    <Layout>
      <div className="container mx-auto p-6">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="outline" onClick={() => navigate('/purchase/payments/list')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-3xl font-bold">
            {isEdit ? 'Edit Vendor Payment' : 'Create Vendor Payment'}
          </h1>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle>Payment Information</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="payment_number"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Payment Number</FormLabel>
                      <FormControl>
                        <Input {...field} readOnly className="bg-gray-50" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="payment_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Payment Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
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

                {showBankFields && (
                  <>
                    <FormField
                      control={form.control}
                      name="bank_account"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Bank Account</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Bank account details" />
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
                            <Input {...field} placeholder="Cheque no. or transaction ID" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </>
                )}

                <FormField
                  control={form.control}
                  name="amount_paid"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Amount Paid</FormLabel>
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

                <FormField
                  control={form.control}
                  name="currency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Currency</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="INR" />
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
                          placeholder="1.0000"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="discount_taken"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Discount Taken</FormLabel>
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

                <FormField
                  control={form.control}
                  name="tds_deduction"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>TDS Deduction</FormLabel>
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

                <FormField
                  control={form.control}
                  name="net_amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Net Amount</FormLabel>
                      <FormControl>
                        <Input {...field} readOnly className="bg-gray-50" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Invoice Allocation Section */}
            <Card>
              <CardHeader>
                <CardTitle>Invoice Allocation</CardTitle>
              </CardHeader>
              <CardContent>
                {invoiceAllocations.length > 0 ? (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Invoice Number</TableHead>
                          <TableHead>Invoice Amount</TableHead>
                          <TableHead>Amount Applied</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {invoiceAllocations.map((allocation, index) => (
                          <TableRow key={index}>
                            <TableCell>{allocation.invoice_number}</TableCell>
                            <TableCell>₹{allocation.invoice_amount.toFixed(2)}</TableCell>
                            <TableCell>
                              <Input
                                type="number"
                                step="0.01"
                                value={allocation.amount_applied}
                                onChange={(e) => {
                                  const updatedAllocations = [...invoiceAllocations];
                                  updatedAllocations[index].amount_applied = parseFloat(e.target.value) || 0;
                                  setInvoiceAllocations(updatedAllocations);
                                }}
                                className="w-32"
                              />
                            </TableCell>
                            <TableCell>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  const updatedAllocations = invoiceAllocations.filter((_, i) => i !== index);
                                  setInvoiceAllocations(updatedAllocations);
                                }}
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
                    No invoice allocations added yet
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/purchase/payments/list')}
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
                  ? 'Update Payment'
                  : 'Create Payment'}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </Layout>
  );
};

export default VendorPaymentEdit;
