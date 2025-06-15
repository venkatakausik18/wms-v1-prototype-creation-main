
import { supabase } from "@/integrations/supabase/client";

export interface DamageAssessment {
  damage_id?: number;
  company_id: number;
  warehouse_id: number;
  product_id: number;
  variant_id?: number;
  serial_number?: string;
  damaged_quantity: number;
  damage_type: string;
  damage_severity: 'minor' | 'major' | 'total_loss';
  damage_description?: string;
  damage_photos?: string[];
  assessed_by: number;
  assessment_date: string;
  estimated_loss_value?: number;
  action_taken?: 'write_off' | 'repair' | 'return_to_vendor' | 'dispose';
  insurance_claim_number?: string;
  related_transaction_id?: number;
}

export const createDamageAssessment = async (
  assessment: Omit<DamageAssessment, 'damage_id'>
): Promise<DamageAssessment | null> => {
  try {
    const { data, error } = await supabase
      .from('damage_assessments')
      .insert({
        ...assessment,
        created_by: 1
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating damage assessment:', error);
    return null;
  }
};

export const getDamageAssessments = async (
  warehouseId: number,
  fromDate?: string,
  toDate?: string
): Promise<DamageAssessment[]> => {
  try {
    let query = supabase
      .from('damage_assessments')
      .select(`
        *,
        products!product_id(product_code, product_name),
        product_variants!variant_id(variant_code, variant_name)
      `)
      .eq('warehouse_id', warehouseId);

    if (fromDate) {
      query = query.gte('assessment_date', fromDate);
    }
    if (toDate) {
      query = query.lte('assessment_date', toDate);
    }

    const { data, error } = await query.order('assessment_date', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching damage assessments:', error);
    return [];
  }
};
