
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import Layout from "@/components/Layout";

interface OutstandingInvoice {
  sales_id: number;
  invoice_number: string;
  grand_total: number;
  advance_received: number;
  outstanding_balance: number;
  amount_applied: number;
}

interface FormData {
  receipt_number: string;
  receipt_date: string;
  receipt_time: string;
  customer_id: string;
  payment_mode: string;
  bank_account: string;
  reference_number: string;
  total_amount_received: number;
  currency: string;
  exchange_rate: number;
  discount_allowed: number;
  advance_adjustment: number;
}

const CustomerReceiptEdit = () => {
  const navigate = useNavigate();
  const { receiptId } = useParams();
  const { toast } = useToast();
  const isEdit = !!receiptId;

  const [formData, setFormData] = useState<FormData>({
    receipt_number: '',
    receipt_date: new Date().toISOString().split('T')[0],
    receipt_time: new Date().toTimeString().slice(0, 5),
    customer_id: '',
    payment_mode: 'cash',
    bank_account: '',
    reference_number: '',
    total_amount_received: 0,
    currency: 'INR',
    exchange_rate: 1,
    discount_allowed: 0,
    advance_adjustment: 0
  });

  const [outstandingInvoices, setOutstandingInvoices] = useState<OutstandingInvoice[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch customers
  const { data: customers } = useQuery({
    queryKey: ['customers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('customers')
        .select('customer_id, customer_name')
        .eq('is_active', true)
        .order('customer_name');
      
      if (error) throw error;
      return data;
    },
  });

  // Fetch company data for receipt number generation
  const { data: company } = useQuery({
    queryKey: ['company'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('companies')
        .select('company_code')
        .eq('is_active', true)
        .single();
      
      if (error) throw error;
      return data;
    },
  });

  // Generate receipt number
  useEffect(() => {
    if (!isEdit && company?.company_code) {
      const generateReceiptNumber = async () => {
        const today = new Date();
        const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
        
        // Get count of receipts for today
        const { data, error } = await supabase
          .from('customer_receipts')
          .select('receipt_id', { count: 'exact' })
          .gte('receipt_date', today.toISOString().split('T')[0])
          .lte('receipt_date', today.toISOString().split('T')[0]);
        
        const count = (data?.length || 0) + 1;
        const receiptNumber = `${company.company_code}-REC-${dateStr}-${count.toString().padStart(4, '0')}`;
        
        setFormData(prev => ({ ...prev, receipt_number: receiptNumber }));
      };
      
      generateReceiptNumber();
    }
  }, [isEdit, company]);

  // Fetch outstanding invoices when customer changes
  useEffect(() => {
    if (formData.customer_id) {
      const fetchOutstandingInvoices = async () => {
        const { data, error } = await supabase
          .from('sales_invoices')
          .select('sales_id, invoice_number, grand_total, advance_received')
          .eq('customer_id', formData.customer_id)
          .neq('payment_status', 'paid');
        
        if (error) {
          console.error('Error fetching outstanding invoices:', error);
          return;
        }
        
        const invoicesWithBalance = data?.map(invoice => ({
          sales_id: invoice.sales_id,
          invoice_number: invoice.invoice_number,
          grand_total: invoice.grand_total,
          advance_received: invoice.advance_received || 0,
          outstanding_balance: invoice.grand_total - (invoice.advance_received || 0),
          amount_applied: 0
        })) || [];
        
        setOutstandingInvoices(invoicesWithBalance);
      };
      
      fetchOutstandingInvoices();
    } else {
      setOutstandingInvoices([]);
    }
  }, [formData.customer_id]);

  const handleInputChange = (field: keyof FormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAllocationChange = (invoiceId: number, amount: number) => {
    setOutstandingInvoices(prev => 
      prev.map(invoice => 
        invoice.sales_id === invoiceId 
          ? { ...invoice, amount_applied: Math.min(amount, invoice.outstanding_balance) }
          : invoice
      )
    );
  };

  const getTotalAllocated = () => {
    return outstandingInvoices.reduce((sum, invoice) => sum + invoice.amount_applied, 0);
  };

  const getBalanceAfterReceipt = () => {
    const currentOutstanding = outstandingInvoices.reduce((sum, invoice) => sum + invoice.outstanding_balance, 0);
    return currentOutstanding - formData.total_amount_received;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Validate allocations
      const totalAllocated = getTotalAllocated();
      if (totalAllocated > formData.total_amount_received) {
        toast({
          title: "Validation Error",
          description: "Total allocated amount cannot exceed amount received.",
          variant: "destructive",
        });
        return;
      }

      // Prepare allocation details
      const allocationDetails = outstandingInvoices
        .filter(invoice => invoice.amount_applied > 0)
        .map(invoice => ({
          sales_id: invoice.sales_id,
          invoice_number: invoice.invoice_number,
          amount_applied: invoice.amount_applied
        }));

      // Insert customer receipt
      const { data: receiptData, error: receiptError } = await supabase
        .from('customer_receipts')
        .insert([{
          company_id: 1, // TODO: Get from context
          customer_id: formData.customer_id,
          receipt_number: formData.receipt_number,
          receipt_date: formData.receipt_date,
          receipt_time: formData.receipt_time,
          payment_mode: formData.payment_mode,
          bank_account: formData.payment_mode !== 'cash' ? formData.bank_account : null,
          reference_number: formData.payment_mode !== 'cash' ? formData.reference_number : null,
          total_amount_received: formData.total_amount_received,
          currency: formData.currency,
          exchange_rate: formData.exchange_rate,
          allocation_details: JSON.stringify(allocationDetails),
          discount_allowed: formData.discount_allowed,
          advance_adjustment: formData.advance_adjustment,
          balance_after_receipt: getBalanceAfterReceipt(),
          created_by: 1 // TODO: Get from auth context
        }])
        .select()
        .single();

      if (receiptError) throw receiptError;

      // Update sales invoices
      for (const allocation of allocationDetails) {
        const invoice = outstandingInvoices.find(inv => inv.sales_id === allocation.sales_id);
        if (invoice) {
          const newAdvanceReceived = invoice.advance_received + allocation.amount_applied;
          const newBalanceAmount = invoice.grand_total - newAdvanceReceived;
          const newPaymentStatus = newBalanceAmount <= 0 ? 'paid' : 'partial';

          await supabase
            .from('sales_invoices')
            .update({
              advance_received: newAdvanceReceived,
              balance_amount: newBalanceAmount,
              payment_status: newPaymentStatus
            })
            .eq('sales_id', allocation.sales_id);
        }
      }

      // Insert financial transaction
      await supabase.from('financial_transactions').insert([{
        company_id: 1, // TODO: Get from context
        module: 'receipt',
        module_reference_id: receiptData.receipt_id,
        transaction_date: formData.receipt_date,
        transaction_time: formData.receipt_time,
        gl_entry_created: false,
        created_by: 1 // TODO: Get from auth context
      }]);

      toast({
        title: "Success",
        description: "Customer receipt created successfully.",
      });

      navigate('/sales/receipts/list');
    } catch (error) {
      console.error('Error creating receipt:', error);
      toast({
        title: "Error",
        description: "Failed to create customer receipt.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">
            {isEdit ? 'Edit' : 'Add'} Customer Receipt
          </h1>
          <Button variant="outline" onClick={() => navigate('/sales/receipts/list')}>
            Back to List
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Receipt Information</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="receipt_number">Receipt Number</Label>
                <Input
                  id="receipt_number"
                  value={formData.receipt_number}
                  onChange={(e) => handleInputChange('receipt_number', e.target.value)}
                  required
                  disabled
                />
              </div>
              
              <div>
                <Label htmlFor="receipt_date">Receipt Date</Label>
                <Input
                  id="receipt_date"
                  type="date"
                  value={formData.receipt_date}
                  onChange={(e) => handleInputChange('receipt_date', e.target.value)}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="receipt_time">Receipt Time</Label>
                <Input
                  id="receipt_time"
                  type="time"
                  value={formData.receipt_time}
                  onChange={(e) => handleInputChange('receipt_time', e.target.value)}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="customer_id">Customer</Label>
                <Select value={formData.customer_id} onValueChange={(value) => handleInputChange('customer_id', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select customer" />
                  </SelectTrigger>
                  <SelectContent>
                    {customers?.map((customer) => (
                      <SelectItem key={customer.customer_id} value={customer.customer_id}>
                        {customer.customer_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="payment_mode">Payment Mode</Label>
                <Select value={formData.payment_mode} onValueChange={(value) => handleInputChange('payment_mode', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="bank">Bank</SelectItem>
                    <SelectItem value="cheque">Cheque</SelectItem>
                    <SelectItem value="online">Online</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {formData.payment_mode !== 'cash' && (
                <>
                  <div>
                    <Label htmlFor="bank_account">Bank Account</Label>
                    <Input
                      id="bank_account"
                      value={formData.bank_account}
                      onChange={(e) => handleInputChange('bank_account', e.target.value)}
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="reference_number">
                      {formData.payment_mode === 'cheque' ? 'Cheque Number' : 'Transaction ID'}
                    </Label>
                    <Input
                      id="reference_number"
                      value={formData.reference_number}
                      onChange={(e) => handleInputChange('reference_number', e.target.value)}
                      required
                    />
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Amount Information */}
          <Card>
            <CardHeader>
              <CardTitle>Amount Details</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="total_amount_received">Total Amount Received</Label>
                <Input
                  id="total_amount_received"
                  type="number"
                  step="0.01"
                  value={formData.total_amount_received}
                  onChange={(e) => handleInputChange('total_amount_received', parseFloat(e.target.value) || 0)}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="currency">Currency</Label>
                <Input
                  id="currency"
                  value={formData.currency}
                  onChange={(e) => handleInputChange('currency', e.target.value)}
                  disabled
                />
              </div>
              
              <div>
                <Label htmlFor="exchange_rate">Exchange Rate</Label>
                <Input
                  id="exchange_rate"
                  type="number"
                  step="0.0001"
                  value={formData.exchange_rate}
                  onChange={(e) => handleInputChange('exchange_rate', parseFloat(e.target.value) || 1)}
                />
              </div>
              
              <div>
                <Label htmlFor="discount_allowed">Discount Allowed</Label>
                <Input
                  id="discount_allowed"
                  type="number"
                  step="0.01"
                  value={formData.discount_allowed}
                  onChange={(e) => handleInputChange('discount_allowed', parseFloat(e.target.value) || 0)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Invoice Allocation */}
          {formData.customer_id && outstandingInvoices.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Invoice Allocation</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Invoice Number</TableHead>
                      <TableHead>Grand Total</TableHead>
                      <TableHead>Advance Received</TableHead>
                      <TableHead>Outstanding Balance</TableHead>
                      <TableHead>Amount Applied</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {outstandingInvoices.map((invoice) => (
                      <TableRow key={invoice.sales_id}>
                        <TableCell>{invoice.invoice_number}</TableCell>
                        <TableCell>₹{invoice.grand_total.toFixed(2)}</TableCell>
                        <TableCell>₹{invoice.advance_received.toFixed(2)}</TableCell>
                        <TableCell>₹{invoice.outstanding_balance.toFixed(2)}</TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            step="0.01"
                            max={invoice.outstanding_balance}
                            value={invoice.amount_applied}
                            onChange={(e) => handleAllocationChange(invoice.sales_id, parseFloat(e.target.value) || 0)}
                            className="w-32"
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                
                <div className="mt-4 flex justify-between items-center text-sm">
                  <span>Total Allocated: ₹{getTotalAllocated().toFixed(2)}</span>
                  <span>Balance After Receipt: ₹{getBalanceAfterReceipt().toFixed(2)}</span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Submit Button */}
          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={() => navigate('/sales/receipts/list')}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : (isEdit ? 'Update' : 'Create')} Receipt
            </Button>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default CustomerReceiptEdit;
