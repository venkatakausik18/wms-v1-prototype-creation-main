
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Save, Calculator } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import Layout from "@/components/Layout";

interface CountDetail {
  id: string;
  product_id: number;
  product_name: string;
  variant_id?: number;
  uom_id: number;
  system_quantity: number;
  counted_quantity: number;
  variance_quantity: number;
  bin_id?: number;
  reason_for_variance: string;
  adjustment_decision: 'no_change' | 'adjust_to_count' | 'investigate';
  adjustment_quantity: number;
}

interface Warehouse {
  warehouse_id: number;
  warehouse_name: string;
}

interface Product {
  product_id: number;
  product_name: string;
  product_code: string;
}

interface StorageBin {
  bin_id: number;
  bin_code: string;
}

interface PhysicalCountRecord {
  count_id: number;
  count_number: string;
  company_id: number;
  warehouse_id: number;
  count_date: string;
  count_time: string;
  count_type: string;
  method: string;
  scheduled_by: number;
  counted_by: number;
  status: string;
  created_by: number;
}

const PhysicalCount = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState<'setup' | 'counting'>('setup');
  const [countId, setCountId] = useState<number | null>(null);

  // Form state for count setup
  const [setupData, setSetupData] = useState({
    count_date: new Date().toISOString().split('T')[0],
    count_time: new Date().toTimeString().split(' ')[0].slice(0, 5),
    warehouse_id: "",
    count_type: "full" as "full" | "partial" | "cycle",
    method: "full" as "full" | "partial" | "abc",
    scheduled_by: 1, // TODO: Get from auth context
    counted_by: 1 // TODO: Get from auth context
  });

  const [details, setDetails] = useState<CountDetail[]>([]);

  // Fetch warehouses with explicit typing
  const { data: warehouses } = useQuery<Warehouse[]>({
    queryKey: ['warehouses'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('warehouses')
        .select('warehouse_id, warehouse_name')
        .eq('is_active', true)
        .order('warehouse_name');
      
      if (error) throw error;
      return (data || []) as Warehouse[];
    },
  });

  // Fetch products with explicit typing
  const { data: products } = useQuery<Product[]>({
    queryKey: ['products-for-count'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('product_id, product_name, product_code')
        .eq('is_active', true)
        .order('product_name');
      
      if (error) throw error;
      return (data || []) as Product[];
    },
  });

  // Fetch storage bins with explicit typing
  const { data: bins } = useQuery<StorageBin[]>({
    queryKey: ['storage-bins', setupData.warehouse_id],
    queryFn: async () => {
      if (!setupData.warehouse_id) return [];
      
      const { data, error } = await supabase
        .from('storage_bins')
        .select('bin_id, bin_code')
        .eq('warehouse_id', setupData.warehouse_id)
        .eq('is_active', true)
        .order('bin_code');
      
      if (error) throw error;
      return (data || []) as StorageBin[];
    },
    enabled: !!setupData.warehouse_id,
  });

  const createCountSetup = useMutation<PhysicalCountRecord, Error, void>({
    mutationFn: async (): Promise<PhysicalCountRecord> => {
      // Generate count number
      const countNumber = `CNT-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${String(Date.now()).slice(-4)}`;

      const { data, error } = await supabase
        .from('physical_counts')
        .insert([{
          company_id: 1, // TODO: Get from auth context
          warehouse_id: parseInt(setupData.warehouse_id),
          count_number: countNumber,
          count_date: setupData.count_date,
          count_time: setupData.count_time,
          count_type: setupData.count_type,
          method: setupData.method,
          scheduled_by: setupData.scheduled_by,
          counted_by: setupData.counted_by,
          status: 'scheduled',
          created_by: 1 // TODO: Get from auth context
        }])
        .select()
        .single();

      if (error) throw error;
      return data as PhysicalCountRecord;
    },
    onSuccess: (data: PhysicalCountRecord) => {
      setCountId(data.count_id);
      setCurrentStep('counting');
      toast({
        title: "Success",
        description: "Physical count setup created. You can now start counting.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to create count setup: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const addDetailRow = () => {
    const newRow: CountDetail = {
      id: Date.now().toString(),
      product_id: 0,
      product_name: "",
      variant_id: undefined,
      uom_id: 1,
      system_quantity: 0,
      counted_quantity: 0,
      variance_quantity: 0,
      bin_id: undefined,
      reason_for_variance: "",
      adjustment_decision: 'no_change',
      adjustment_quantity: 0
    };
    setDetails([...details, newRow]);
  };

  const removeDetailRow = (id: string) => {
    setDetails(details.filter(detail => detail.id !== id));
  };

  const updateDetail = (id: string, field: keyof CountDetail, value: any) => {
    setDetails(details.map(detail => {
      if (detail.id === id) {
        const updated = { ...detail, [field]: value };
        
        // Calculate variance when system or counted quantity changes
        if (field === 'system_quantity' || field === 'counted_quantity') {
          updated.variance_quantity = updated.counted_quantity - updated.system_quantity;
          
          // Auto-set adjustment decision based on variance
          if (updated.variance_quantity === 0) {
            updated.adjustment_decision = 'no_change';
          } else if (Math.abs(updated.variance_quantity) > 10) { // Threshold for investigation
            updated.adjustment_decision = 'investigate';
          } else {
            updated.adjustment_decision = 'adjust_to_count';
          }
        }
        
        // Calculate adjustment quantity based on decision
        if (field === 'adjustment_decision') {
          if (updated.adjustment_decision === 'adjust_to_count') {
            updated.adjustment_quantity = updated.variance_quantity;
          } else {
            updated.adjustment_quantity = 0;
          }
        }
        
        return updated;
      }
      return detail;
    }));
  };

  const submitCountDetails = useMutation<{ countId: number; adjustmentItems: number }, Error, void>({
    mutationFn: async () => {
      if (!countId) throw new Error("Count ID not found");

      // Insert count details
      const detailsToInsert = details.map(detail => ({
        count_id: countId,
        product_id: detail.product_id,
        variant_id: detail.variant_id || null,
        uom_id: detail.uom_id,
        system_quantity: detail.system_quantity,
        counted_quantity: detail.counted_quantity,
        bin_id: detail.bin_id || null,
        reason_for_variance: detail.reason_for_variance,
        adjustment_decision: detail.adjustment_decision,
        adjustment_quantity: detail.adjustment_quantity
      }));

      const { error: detailsError } = await supabase
        .from('physical_count_details')
        .insert(detailsToInsert);

      if (detailsError) throw detailsError;

      // Update count status
      const { error: updateError } = await supabase
        .from('physical_counts')
        .update({ 
          status: 'completed',
          total_items_counted: details.length,
          total_variance: details.reduce((sum, d) => sum + Math.abs(d.variance_quantity), 0)
        })
        .eq('count_id', countId);

      if (updateError) throw updateError;

      // Process adjustments for items marked as "adjust_to_count"
      const adjustmentItems = details.filter(d => d.adjustment_decision === 'adjust_to_count' && d.adjustment_quantity !== 0);
      
      if (adjustmentItems.length > 0) {
        // Create stock adjustment record
        const adjustmentNumber = `ADJ-PC-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${String(Date.now()).slice(-4)}`;
        
        const { data: adjustmentData, error: adjError } = await supabase
          .from('inventory_transactions')
          .insert([{
            company_id: 1, // TODO: Get from auth context
            warehouse_id: parseInt(setupData.warehouse_id),
            txn_number: adjustmentNumber,
            txn_type: 'adjustment_in', // or adjustment_out based on variance
            txn_date: setupData.count_date,
            txn_time: setupData.count_time,
            reference_document: `Physical Count ${countId}`,
            total_items: adjustmentItems.length,
            total_quantity: adjustmentItems.reduce((sum, item) => sum + Math.abs(item.adjustment_quantity), 0),
            total_value: 0,
            remarks: 'Physical Count Adjustment',
            created_by: 1 // TODO: Get from auth context
          }])
          .select()
          .single();

        if (adjError) throw adjError;

        // Insert adjustment details
        const adjustmentDetails = adjustmentItems.map(item => ({
          txn_id: adjustmentData.txn_id,
          product_id: item.product_id,
          variant_id: item.variant_id || null,
          uom_id: item.uom_id,
          quantity: Math.abs(item.adjustment_quantity),
          unit_cost: 0,
          total_cost: 0,
          from_warehouse_id: null,
          to_warehouse_id: parseInt(setupData.warehouse_id),
          bin_id: item.bin_id || null,
          previous_stock: item.system_quantity,
          new_stock: item.counted_quantity,
          reason_code: `Physical Count Adjustment: ${item.reason_for_variance}`
        }));

        const { error: adjDetailsError } = await supabase
          .from('inventory_transaction_details')
          .insert(adjustmentDetails);

        if (adjDetailsError) throw adjDetailsError;
      }

      return { countId, adjustmentItems: adjustmentItems.length };
    },
    onSuccess: (result) => {
      toast({
        title: "Success",
        description: `Physical count completed successfully. ${result.adjustmentItems} adjustments processed.`,
      });
      queryClient.invalidateQueries({ queryKey: ['physical-counts'] });
      navigate('/inventory/counts');
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to complete physical count: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const handleSetupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!setupData.warehouse_id) {
      toast({
        title: "Error",
        description: "Please select a warehouse.",
        variant: "destructive",
      });
      return;
    }
    await createCountSetup.mutateAsync();
  };

  const handleCountSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (details.length === 0) {
      toast({
        title: "Error",
        description: "Please add at least one item to count.",
        variant: "destructive",
      });
      return;
    }
    setIsSubmitting(true);
    await submitCountDetails.mutateAsync();
    setIsSubmitting(false);
  };

  const getVarianceBadge = (variance: number) => {
    if (variance === 0) return <Badge variant="secondary">No Variance</Badge>;
    if (variance > 0) return <Badge className="bg-green-500">+{variance}</Badge>;
    return <Badge variant="destructive">{variance}</Badge>;
  };

  const getDecisionBadge = (decision: string) => {
    switch (decision) {
      case 'no_change': return <Badge variant="secondary">No Change</Badge>;
      case 'adjust_to_count': return <Badge className="bg-blue-500">Adjust</Badge>;
      case 'investigate': return <Badge variant="destructive">Investigate</Badge>;
      default: return <Badge variant="outline">{decision}</Badge>;
    }
  };

  if (currentStep === 'setup') {
    return (
      <Layout>
        <div className="container mx-auto p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">Physical Stock Count - Setup</h1>
            <Button 
              variant="outline" 
              onClick={() => navigate('/inventory')}
            >
              Back to Inventory
            </Button>
          </div>

          <form onSubmit={handleSetupSubmit} className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Count Setup</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="count_date">Count Date</Label>
                    <Input
                      id="count_date"
                      type="date"
                      value={setupData.count_date}
                      onChange={(e) => setSetupData({ ...setupData, count_date: e.target.value })}
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="count_time">Count Time</Label>
                    <Input
                      id="count_time"
                      type="time"
                      value={setupData.count_time}
                      onChange={(e) => setSetupData({ ...setupData, count_time: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="warehouse_id">Warehouse</Label>
                    <Select 
                      value={setupData.warehouse_id} 
                      onValueChange={(value) => setSetupData({ ...setupData, warehouse_id: value })}
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
                    <Label htmlFor="count_type">Count Type</Label>
                    <Select 
                      value={setupData.count_type} 
                      onValueChange={(value: "full" | "partial" | "cycle") => setSetupData({ ...setupData, count_type: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="full">Full Count</SelectItem>
                        <SelectItem value="partial">Partial Count</SelectItem>
                        <SelectItem value="cycle">Cycle Count</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="method">Method</Label>
                    <Select 
                      value={setupData.method} 
                      onValueChange={(value: "full" | "partial" | "abc") => setSetupData({ ...setupData, method: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="full">Full</SelectItem>
                        <SelectItem value="partial">Partial</SelectItem>
                        <SelectItem value="abc">ABC Analysis</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end gap-4">
              <Button type="button" variant="outline" onClick={() => navigate('/inventory')}>
                Cancel
              </Button>
              <Button type="submit">
                <Calculator className="h-4 w-4 mr-2" />
                Start Count
              </Button>
            </div>
          </form>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Physical Stock Count - Entry</h1>
          <Button 
            variant="outline" 
            onClick={() => setCurrentStep('setup')}
          >
            Back to Setup
          </Button>
        </div>

        <form onSubmit={handleCountSubmit} className="space-y-6">
          {/* Count Info */}
          <Card>
            <CardHeader>
              <CardTitle>Count Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 gap-4 text-sm">
                <div>
                  <Label>Count ID</Label>
                  <div className="font-medium">{countId}</div>
                </div>
                <div>
                  <Label>Warehouse</Label>
                  <div className="font-medium">
                    {warehouses?.find(w => w.warehouse_id.toString() === setupData.warehouse_id)?.warehouse_name}
                  </div>
                </div>
                <div>
                  <Label>Count Type</Label>
                  <div className="font-medium capitalize">{setupData.count_type}</div>
                </div>
                <div>
                  <Label>Method</Label>
                  <div className="font-medium capitalize">{setupData.method}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Items Count Grid */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Items to Count</CardTitle>
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
                      <TableHead>Bin</TableHead>
                      <TableHead>System Qty</TableHead>
                      <TableHead>Counted Qty</TableHead>
                      <TableHead>Variance</TableHead>
                      <TableHead>Reason</TableHead>
                      <TableHead>Decision</TableHead>
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
                          <Select
                            value={detail.bin_id?.toString() || ""}
                            onValueChange={(value) => updateDetail(detail.id, 'bin_id', value ? parseInt(value) : undefined)}
                          >
                            <SelectTrigger className="w-24">
                              <SelectValue placeholder="Bin" />
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
                            value={detail.system_quantity}
                            onChange={(e) => updateDetail(detail.id, 'system_quantity', parseFloat(e.target.value) || 0)}
                            className="w-20"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            value={detail.counted_quantity}
                            onChange={(e) => updateDetail(detail.id, 'counted_quantity', parseFloat(e.target.value) || 0)}
                            className="w-20"
                          />
                        </TableCell>
                        <TableCell>
                          {getVarianceBadge(detail.variance_quantity)}
                        </TableCell>
                        <TableCell>
                          <Input
                            value={detail.reason_for_variance}
                            onChange={(e) => updateDetail(detail.id, 'reason_for_variance', e.target.value)}
                            className="w-32"
                            placeholder="Reason"
                          />
                        </TableCell>
                        <TableCell>
                          <Select
                            value={detail.adjustment_decision}
                            onValueChange={(value: 'no_change' | 'adjust_to_count' | 'investigate') => 
                              updateDetail(detail.id, 'adjustment_decision', value)
                            }
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="no_change">No Change</SelectItem>
                              <SelectItem value="adjust_to_count">Adjust</SelectItem>
                              <SelectItem value="investigate">Investigate</SelectItem>
                            </SelectContent>
                          </Select>
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
                <CardTitle>Count Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-4 gap-4">
                  <div>
                    <Label>Total Items</Label>
                    <div className="font-medium text-lg">{details.length}</div>
                  </div>
                  <div>
                    <Label>Items with Variance</Label>
                    <div className="font-medium text-lg">
                      {details.filter(d => d.variance_quantity !== 0).length}
                    </div>
                  </div>
                  <div>
                    <Label>Items to Adjust</Label>
                    <div className="font-medium text-lg">
                      {details.filter(d => d.adjustment_decision === 'adjust_to_count').length}
                    </div>
                  </div>
                  <div>
                    <Label>Items to Investigate</Label>
                    <div className="font-medium text-lg">
                      {details.filter(d => d.adjustment_decision === 'investigate').length}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Submit Button */}
          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={() => setCurrentStep('setup')}>
              Back to Setup
            </Button>
            <Button type="submit" disabled={isSubmitting || details.length === 0}>
              <Save className="h-4 w-4 mr-2" />
              {isSubmitting ? "Completing Count..." : "Complete Count"}
            </Button>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default PhysicalCount;
