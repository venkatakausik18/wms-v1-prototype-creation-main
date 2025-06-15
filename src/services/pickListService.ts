
import { supabase } from "@/integrations/supabase/client";

export interface PickList {
  pick_list_id: number;
  company_id: number;
  warehouse_id: number;
  pick_list_number: string;
  pick_list_date: string;
  picker_id?: number;
  status: 'draft' | 'assigned' | 'in_progress' | 'completed' | 'cancelled';
  priority_level: 'low' | 'normal' | 'high' | 'urgent';
  special_instructions?: string;
}

export interface PickListDetail {
  pick_detail_id?: number;
  pick_list_id?: number;
  product_id: number;
  variant_id?: number;
  warehouse_id: number;
  bin_id?: number;
  required_quantity: number;
  picked_quantity: number;
  uom_id: number;
  pick_sequence?: number;
  pick_instructions?: string;
  serial_numbers?: string[];
  batch_numbers?: string[];
  expiry_dates?: string[];
  status: 'pending' | 'partial' | 'completed' | 'short';
  notes?: string;
  product?: any;
  variant?: any;
  uom?: any;
}

export const generatePickList = async (
  warehouseId: number,
  items: PickListDetail[]
): Promise<PickList | null> => {
  try {
    // Generate pick list number
    const pickListNumber = `PL-${Date.now()}`;

    // Create pick list header
    const { data: pickList, error: pickListError } = await supabase
      .from('pick_lists')
      .insert({
        company_id: 1,
        warehouse_id: warehouseId,
        pick_list_number: pickListNumber,
        priority_level: 'normal',
        created_by: 1
      })
      .select()
      .single();

    if (pickListError) throw pickListError;

    // Create pick list details with optimized sequence
    const optimizedItems = items.map((item, index) => ({
      pick_list_id: pickList.pick_list_id,
      product_id: item.product_id,
      variant_id: item.variant_id,
      warehouse_id: item.warehouse_id,
      bin_id: item.bin_id,
      required_quantity: item.required_quantity,
      picked_quantity: 0,
      uom_id: item.uom_id,
      pick_sequence: index + 1,
      pick_instructions: item.pick_instructions,
      status: 'pending' as const
    }));

    const { error: detailsError } = await supabase
      .from('pick_list_details')
      .insert(optimizedItems);

    if (detailsError) throw detailsError;

    return pickList;
  } catch (error) {
    console.error('Error generating pick list:', error);
    return null;
  }
};

export const getPickListDetails = async (pickListId: number): Promise<PickListDetail[]> => {
  try {
    const { data, error } = await supabase
      .from('pick_list_details')
      .select(`
        *,
        products!product_id(product_id, product_code, product_name),
        product_variants!variant_id(variant_id, variant_code, variant_name),
        units_of_measure!uom_id(uom_id, uom_name)
      `)
      .eq('pick_list_id', pickListId)
      .order('pick_sequence');

    if (error) throw error;

    return data?.map(item => ({
      ...item,
      product: item.products,
      variant: item.product_variants,
      uom: item.units_of_measure
    })) || [];
  } catch (error) {
    console.error('Error fetching pick list details:', error);
    return [];
  }
};

export const updatePickQuantity = async (
  pickDetailId: number,
  pickedQuantity: number
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('pick_list_details')
      .update({ 
        picked_quantity: pickedQuantity,
        status: pickedQuantity > 0 ? 'partial' : 'pending'
      })
      .eq('pick_detail_id', pickDetailId);

    return !error;
  } catch (error) {
    console.error('Error updating pick quantity:', error);
    return false;
  }
};
