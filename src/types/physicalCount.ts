
import type { Database } from "@/integrations/supabase/types";

// Use Supabase generated types for better type safety
export type Warehouse = Pick<Database['public']['Tables']['warehouses']['Row'], 'warehouse_id' | 'warehouse_name'>;
export type Product = Pick<Database['public']['Tables']['products']['Row'], 'product_id' | 'product_name' | 'product_code'>;
export type StorageBin = Pick<Database['public']['Tables']['storage_bins']['Row'], 'bin_id' | 'bin_code'>;

export interface CountDetail {
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

export interface PhysicalCountRecord {
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

export interface SetupData {
  count_date: string;
  count_time: string;
  warehouse_id: string;
  count_type: "full" | "partial" | "cycle";
  method: "full" | "partial" | "abc";
  scheduled_by: number;
  counted_by: number;
}
