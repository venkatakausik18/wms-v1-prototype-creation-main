
// Shared type definitions for inventory components

export interface StockDetail {
  product_id?: number;
  variant_id?: number;
  quantity: number;
  unit_cost: number;
  total_cost: number;
  uom_id?: number;
  bin_id?: number;
  previous_stock: number;
  new_stock: number;
  product?: {
    product_id: number;
    product_code: string;
    product_name: string;
    base_uom_id: number;
  };
  uom?: {
    uom_id: number;
    uom_name: string;
  };
}

export interface FormData {
  txn_number: string;
  txn_type: 'sale_out' | 'transfer_out' | 'adjustment_out';
  txn_date: string;
  txn_time: string;
  warehouse_id: string;
  reference_document: string;
  remarks: string;
}

export interface WarehouseData {
  warehouse_id: number;
  warehouse_code: string;
  warehouse_name: string;
}

export interface StorageBinData {
  bin_id: number;
  bin_code: string;
}

export interface ProductVariant {
  variant_id: number;
  variant_code: string;
  variant_name: string;
}
