
import { supabase } from "@/integrations/supabase/client";

export interface SerialNumber {
  serial_id: number;
  company_id: number;
  product_id: number;
  variant_id?: number;
  serial_number: string;
  warehouse_id?: number;
  bin_id?: number;
  status: 'available' | 'reserved' | 'sold' | 'damaged' | 'returned';
  purchase_date?: string;
  expiry_date?: string;
  supplier_batch?: string;
  internal_batch?: string;
  cost_price?: number;
  selling_price?: number;
  current_location?: string;
  last_transaction_id?: number;
}

export const getAvailableSerialNumbers = async (
  productId: number,
  warehouseId: number,
  variantId?: number
): Promise<SerialNumber[]> => {
  try {
    let query = supabase
      .from('product_serial_numbers')
      .select('*')
      .eq('product_id', productId)
      .eq('status', 'available');

    if (warehouseId) {
      query = query.eq('warehouse_id', warehouseId);
    }

    if (variantId) {
      query = query.eq('variant_id', variantId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching serial numbers:', error);
    return [];
  }
};

export const updateSerialNumberStatus = async (
  serialNumbers: string[],
  status: SerialNumber['status'],
  transactionId?: number
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('product_serial_numbers')
      .update({ 
        status,
        last_transaction_id: transactionId,
        updated_at: new Date().toISOString()
      })
      .in('serial_number', serialNumbers);

    return !error;
  } catch (error) {
    console.error('Error updating serial number status:', error);
    return false;
  }
};

export const createSerialNumbers = async (serialNumbers: Partial<SerialNumber>[]): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('product_serial_numbers')
      .insert(serialNumbers.map(sn => ({
        ...sn,
        company_id: 1 // Default company
      })));

    return !error;
  } catch (error) {
    console.error('Error creating serial numbers:', error);
    return false;
  }
};
