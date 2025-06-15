
import { supabase } from "@/integrations/supabase/client";

export interface QualityControlHold {
  qc_hold_id?: number;
  company_id: number;
  product_id: number;
  variant_id?: number;
  warehouse_id: number;
  bin_id?: number;
  serial_number?: string;
  hold_quantity: number;
  hold_reason: string;
  hold_date: string;
  inspector_id?: number;
  inspection_notes?: string;
  status: 'on_hold' | 'released' | 'rejected';
  related_transaction_id?: number;
}

export const createQCHold = async (hold: Omit<QualityControlHold, 'qc_hold_id'>): Promise<QualityControlHold | null> => {
  try {
    const { data, error } = await supabase
      .from('quality_control_holds')
      .insert({
        ...hold,
        created_by: 1
      })
      .select()
      .single();

    if (error) throw error;
    return data as QualityControlHold;
  } catch (error) {
    console.error('Error creating QC hold:', error);
    return null;
  }
};

export const releaseQCHold = async (
  qcHoldId: number,
  releaseNotes?: string
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('quality_control_holds')
      .update({
        status: 'released',
        release_date: new Date().toISOString().split('T')[0],
        released_by: 1,
        release_notes: releaseNotes,
        updated_by: 1,
        updated_at: new Date().toISOString()
      })
      .eq('qc_hold_id', qcHoldId);

    return !error;
  } catch (error) {
    console.error('Error releasing QC hold:', error);
    return false;
  }
};

export const getActiveQCHolds = async (
  productId: number,
  warehouseId: number
): Promise<QualityControlHold[]> => {
  try {
    const { data, error } = await supabase
      .from('quality_control_holds')
      .select('*')
      .eq('product_id', productId)
      .eq('warehouse_id', warehouseId)
      .eq('status', 'on_hold');

    if (error) throw error;
    return (data || []) as QualityControlHold[];
  } catch (error) {
    console.error('Error fetching QC holds:', error);
    return [];
  }
};
