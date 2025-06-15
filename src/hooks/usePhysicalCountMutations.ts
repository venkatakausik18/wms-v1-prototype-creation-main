
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { PhysicalCountRecord, SetupData, CountDetail } from "@/types/physicalCount";

export const usePhysicalCountMutations = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createCountSetup = useMutation<PhysicalCountRecord, Error, SetupData>({
    mutationFn: async (setupData: SetupData): Promise<PhysicalCountRecord> => {
      const countNumber = `CNT-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${String(Date.now()).slice(-4)}`;

      const { data, error } = await supabase
        .from('physical_counts')
        .insert([{
          company_id: 1,
          warehouse_id: parseInt(setupData.warehouse_id),
          count_number: countNumber,
          count_date: setupData.count_date,
          count_time: setupData.count_time,
          count_type: setupData.count_type,
          method: setupData.method,
          scheduled_by: setupData.scheduled_by,
          counted_by: setupData.counted_by,
          status: 'scheduled',
          created_by: 1
        }])
        .select()
        .single();

      if (error) throw error;
      return data as PhysicalCountRecord;
    },
    onSuccess: () => {
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

  const submitCountDetails = useMutation<{ countId: number; adjustmentItems: number }, Error, { countId: number; details: CountDetail[]; setupData: SetupData }>({
    mutationFn: async ({ countId, details, setupData }) => {
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

      return { countId, adjustmentItems: adjustmentItems.length };
    },
    onSuccess: (result) => {
      toast({
        title: "Success",
        description: `Physical count completed successfully. ${result.adjustmentItems} adjustments processed.`,
      });
      queryClient.invalidateQueries({ queryKey: ['physical-counts'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to complete physical count: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  return {
    createCountSetup,
    submitCountDetails,
  };
};
