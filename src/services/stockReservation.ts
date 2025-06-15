
import { supabase } from "@/integrations/supabase/client";

export interface StockReservation {
  reservation_id: number;
  company_id: number;
  product_id: number;
  variant_id?: number;
  warehouse_id: number;
  bin_id?: number;
  reserved_quantity: number;
  reference_type: string;
  reference_id?: number;
  reference_number?: string;
  reserved_by: number;
  reservation_date: string;
  expiry_date?: string;
  status: string;
  notes?: string;
}

export interface ReservationRequest {
  product_id: number;
  variant_id?: number;
  warehouse_id: number;
  bin_id?: number;
  quantity: number;
  reference_type: string;
  reference_id?: number;
  reference_number?: string;
  expiry_date?: string;
  notes?: string;
}

export const createReservation = async (request: ReservationRequest): Promise<StockReservation | null> => {
  try {
    const { data, error } = await supabase
      .from('stock_reservations')
      .insert({
        company_id: 1, // Default company
        product_id: request.product_id,
        variant_id: request.variant_id,
        warehouse_id: request.warehouse_id,
        bin_id: request.bin_id,
        reserved_quantity: request.quantity,
        reference_type: request.reference_type,
        reference_id: request.reference_id,
        reference_number: request.reference_number,
        reserved_by: 1, // Current user
        expiry_date: request.expiry_date,
        notes: request.notes,
        created_by: 1
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating reservation:', error);
    return null;
  }
};

export const releaseReservation = async (reservationId: number): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('stock_reservations')
      .update({ 
        status: 'released',
        updated_by: 1,
        updated_at: new Date().toISOString()
      })
      .eq('reservation_id', reservationId);

    return !error;
  } catch (error) {
    console.error('Error releasing reservation:', error);
    return false;
  }
};

export const getActiveReservations = async (
  productId: number,
  warehouseId: number,
  variantId?: number
): Promise<StockReservation[]> => {
  try {
    let query = supabase
      .from('stock_reservations')
      .select('*')
      .eq('product_id', productId)
      .eq('warehouse_id', warehouseId)
      .eq('status', 'active');

    if (variantId) {
      query = query.eq('variant_id', variantId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching reservations:', error);
    return [];
  }
};
