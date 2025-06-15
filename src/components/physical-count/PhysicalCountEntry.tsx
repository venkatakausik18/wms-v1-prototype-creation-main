
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useProducts, useStorageBins, SimpleWarehouse } from "@/hooks/usePhysicalCountData";
import CountDetailsTable, { CountDetail } from "./CountDetailsTable";

interface SetupData {
  count_date: string;
  count_time: string;
  warehouse_id: string;
  count_type: "full" | "partial" | "cycle";
  method: "full" | "partial" | "abc";
  scheduled_by: number;
  counted_by: number;
}

interface PhysicalCountEntryProps {
  countId: number;
  setupData: SetupData;
  warehouses: SimpleWarehouse[];
  onBackToSetup: () => void;
  onComplete: () => void;
}

const PhysicalCountEntry: React.FC<PhysicalCountEntryProps> = ({
  countId,
  setupData,
  warehouses,
  onBackToSetup,
  onComplete
}) => {
  const { toast } = useToast();
  const { products } = useProducts();
  const { bins } = useStorageBins(setupData.warehouse_id);
  const [details, setDetails] = useState<CountDetail[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
        
        if (field === 'system_quantity' || field === 'counted_quantity') {
          updated.variance_quantity = updated.counted_quantity - updated.system_quantity;
          
          if (updated.variance_quantity === 0) {
            updated.adjustment_decision = 'no_change';
          } else if (Math.abs(updated.variance_quantity) > 10) {
            updated.adjustment_decision = 'investigate';
          } else {
            updated.adjustment_decision = 'adjust_to_count';
          }
        }
        
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

  const handleSubmit = async (e: React.FormEvent) => {
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

    try {
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

      const { error: updateError } = await supabase
        .from('physical_counts')
        .update({ 
          status: 'completed',
          total_items_counted: details.length,
          total_variance: details.reduce((sum, d) => sum + Math.abs(d.variance_quantity), 0)
        })
        .eq('count_id', countId);

      if (updateError) throw updateError;

      const adjustmentItems = details.filter(d => d.adjustment_decision === 'adjust_to_count' && d.adjustment_quantity !== 0);
      
      if (adjustmentItems.length > 0) {
        const adjustmentNumber = `ADJ-PC-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${String(Date.now()).slice(-4)}`;
        
        const { data: adjustmentData, error: adjError } = await supabase
          .from('inventory_transactions')
          .insert([{
            company_id: 1,
            warehouse_id: parseInt(setupData.warehouse_id),
            txn_number: adjustmentNumber,
            txn_type: 'adjustment_in',
            txn_date: setupData.count_date,
            txn_time: setupData.count_time,
            reference_document: `Physical Count ${countId}`,
            total_items: adjustmentItems.length,
            total_quantity: adjustmentItems.reduce((sum, item) => sum + Math.abs(item.adjustment_quantity), 0),
            total_value: 0,
            remarks: 'Physical Count Adjustment',
            created_by: 1
          }])
          .select()
          .single();

        if (adjError) throw adjError;

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

      toast({
        title: "Success",
        description: `Physical count completed successfully. ${adjustmentItems.length} adjustments processed.`,
      });
      
      onComplete();
    } catch (error: any) {
      toast({
        title: "Error",
        description: `Failed to complete physical count: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedWarehouse = warehouses?.find(w => w.warehouse_id.toString() === setupData.warehouse_id);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
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
              <div className="font-medium">{selectedWarehouse?.warehouse_name}</div>
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

      <Card>
        <CardContent>
          <CountDetailsTable
            details={details}
            products={products || []}
            bins={bins || []}
            onAddDetail={addDetailRow}
            onRemoveDetail={removeDetailRow}
            onUpdateDetail={updateDetail}
          />
        </CardContent>
      </Card>

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

      <div className="flex justify-end gap-4">
        <Button type="button" variant="outline" onClick={onBackToSetup}>
          Back to Setup
        </Button>
        <Button type="submit" disabled={isSubmitting || details.length === 0}>
          <Save className="h-4 w-4 mr-2" />
          {isSubmitting ? "Completing Count..." : "Complete Count"}
        </Button>
      </div>
    </form>
  );
};

export default PhysicalCountEntry;
