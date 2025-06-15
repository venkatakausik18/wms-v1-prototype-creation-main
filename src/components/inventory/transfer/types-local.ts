
// Local flat types for transfer components to avoid deep type recursion
export interface LocalWarehouseData {
  warehouse_id: number;
  warehouse_code: string;
  warehouse_name: string;
}

export interface LocalStorageBinData {
  bin_id: number;
  bin_code: string;
}

export interface LocalTransferFormData {
  transfer_number: string;
  transfer_date: string;
  transfer_time: string;
  from_warehouse_id: string;
  to_warehouse_id: string;
  priority_level: string;
  transfer_type: string;
  transport_method: string;
  carrier_name: string;
  tracking_number: string;
  expected_delivery_date: string;
  temperature_monitored: boolean;
  temperature_range_min: string;
  temperature_range_max: string;
  special_instructions: string;
  internal_notes: string;
}

export interface LocalTransferDetail {
  detail_id?: number;
  transfer_id?: number;
  product_id?: number;
  variant_id?: number;
  requested_quantity: number;
  shipped_quantity: number;
  received_quantity: number;
  uom_id?: number;
  unit_cost: number;
  total_cost: number;
  from_bin_id?: number;
  to_bin_id?: number;
  serial_numbers?: string[];
  batch_numbers?: string[];
  expiry_dates?: string[];
  line_status: string;
  quality_status: string;
  temperature_sensitive: boolean;
  fragile: boolean;
  hazardous: boolean;
  special_handling_notes?: string;
  created_at?: string;
  updated_at?: string;
}
