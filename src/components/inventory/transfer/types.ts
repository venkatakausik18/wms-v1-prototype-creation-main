
// Stock Transfer specific type definitions

export interface StockTransfer {
  transfer_id: number;
  company_id: number;
  transfer_number: string;
  transfer_date: string;
  transfer_time: string;
  from_warehouse_id: number;
  to_warehouse_id: number;
  transfer_status: TransferStatus;
  approval_status: ApprovalStatus;
  priority_level: string;
  transfer_type: string;
  requires_approval: boolean;
  approved_by?: number;
  approved_at?: string;
  approval_remarks?: string;
  transport_method?: TransportMethod;
  carrier_name?: string;
  tracking_number?: string;
  expected_delivery_date?: string;
  actual_delivery_date?: string;
  current_location?: string;
  temperature_monitored: boolean;
  temperature_range_min?: number;
  temperature_range_max?: number;
  estimated_cost: number;
  actual_cost: number;
  total_items: number;
  total_quantity: number;
  total_value: number;
  template_id?: number;
  is_template: boolean;
  template_name?: string;
  special_instructions?: string;
  internal_notes?: string;
  shipping_documents?: any;
  created_at: string;
  updated_at: string;
  created_by: number;
  updated_by?: number;
}

export interface TransferDetail {
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

export interface TransferFormData {
  transfer_number: string;
  transfer_date: string;
  transfer_time: string;
  from_warehouse_id: string;
  to_warehouse_id: string;
  priority_level: string;
  transfer_type: string;
  transport_method: TransportMethod | '';
  carrier_name: string;
  tracking_number: string;
  expected_delivery_date: string;
  temperature_monitored: boolean;
  temperature_range_min: string;
  temperature_range_max: string;
  special_instructions: string;
  internal_notes: string;
}

export type TransferStatus = 
  | 'draft'
  | 'pending_approval'
  | 'approved'
  | 'in_transit'
  | 'partially_received'
  | 'completed'
  | 'cancelled';

export type ApprovalStatus = 'pending' | 'approved' | 'rejected';

export type TransportMethod = 
  | 'internal'
  | 'courier'
  | 'truck'
  | 'rail'
  | 'air'
  | 'sea';

export interface TransferApproval {
  approval_id: number;
  transfer_id: number;
  approval_step: number;
  approver_id: number;
  approval_level: string;
  status: ApprovalStatus;
  approved_at?: string;
  rejection_reason?: string;
  comments?: string;
  min_value_threshold?: number;
  max_value_threshold?: number;
  created_at: string;
}

export interface TransferTracking {
  tracking_id: number;
  transfer_id: number;
  latitude?: number;
  longitude?: number;
  location_name?: string;
  status: string;
  event_time: string;
  temperature?: number;
  humidity?: number;
  notes?: string;
  photos?: any;
  recorded_by?: number;
  created_at: string;
}

export interface TransferTemplate {
  template_id: number;
  company_id: number;
  template_name: string;
  template_code: string;
  description?: string;
  from_warehouse_id?: number;
  to_warehouse_id?: number;
  transport_method?: TransportMethod;
  priority_level: string;
  requires_approval: boolean;
  default_products?: any;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  created_by: number;
}
