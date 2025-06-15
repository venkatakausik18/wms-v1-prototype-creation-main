
-- Add stock reservations table for holding inventory
CREATE TABLE stock_reservations (
  reservation_id SERIAL PRIMARY KEY,
  company_id INTEGER NOT NULL,
  product_id INTEGER NOT NULL,
  variant_id INTEGER,
  warehouse_id INTEGER NOT NULL,
  bin_id INTEGER,
  reserved_quantity NUMERIC NOT NULL DEFAULT 0,
  reference_type VARCHAR(50) NOT NULL, -- 'sales_order', 'transfer_request', etc.
  reference_id INTEGER,
  reference_number VARCHAR(100),
  reserved_by INTEGER NOT NULL,
  reservation_date DATE NOT NULL DEFAULT CURRENT_DATE,
  expiry_date DATE,
  status VARCHAR(20) NOT NULL DEFAULT 'active',
  notes TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_by INTEGER NOT NULL,
  updated_by INTEGER
);

-- Add serial numbers tracking table
CREATE TABLE product_serial_numbers (
  serial_id SERIAL PRIMARY KEY,
  company_id INTEGER NOT NULL,
  product_id INTEGER NOT NULL,
  variant_id INTEGER,
  serial_number VARCHAR(100) NOT NULL,
  warehouse_id INTEGER,
  bin_id INTEGER,
  status VARCHAR(20) NOT NULL DEFAULT 'available', -- available, reserved, sold, damaged, returned
  purchase_date DATE,
  expiry_date DATE,
  supplier_batch VARCHAR(100),
  internal_batch VARCHAR(100),
  cost_price NUMERIC,
  selling_price NUMERIC,
  current_location VARCHAR(200),
  last_transaction_id INTEGER,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(company_id, serial_number)
);

-- Add quality control holds table
CREATE TABLE quality_control_holds (
  qc_hold_id SERIAL PRIMARY KEY,
  company_id INTEGER NOT NULL,
  product_id INTEGER NOT NULL,
  variant_id INTEGER,
  warehouse_id INTEGER NOT NULL,
  bin_id INTEGER,
  serial_number VARCHAR(100),
  hold_quantity NUMERIC NOT NULL DEFAULT 0,
  hold_reason VARCHAR(100) NOT NULL,
  hold_date DATE NOT NULL DEFAULT CURRENT_DATE,
  inspector_id INTEGER,
  inspection_notes TEXT,
  release_date DATE,
  released_by INTEGER,
  release_notes TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'on_hold', -- on_hold, released, rejected
  related_transaction_id INTEGER,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_by INTEGER NOT NULL,
  updated_by INTEGER
);

-- Add pick lists table for optimized picking
CREATE TABLE pick_lists (
  pick_list_id SERIAL PRIMARY KEY,
  company_id INTEGER NOT NULL,
  warehouse_id INTEGER NOT NULL,
  pick_list_number VARCHAR(100) NOT NULL,
  pick_list_date DATE NOT NULL DEFAULT CURRENT_DATE,
  picker_id INTEGER,
  status VARCHAR(20) NOT NULL DEFAULT 'draft', -- draft, assigned, in_progress, completed, cancelled
  priority_level VARCHAR(10) NOT NULL DEFAULT 'normal', -- low, normal, high, urgent
  estimated_pick_time INTERVAL,
  actual_pick_time INTERVAL,
  pick_route_optimized BOOLEAN DEFAULT false,
  special_instructions TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_by INTEGER NOT NULL,
  updated_by INTEGER
);

-- Add pick list details for individual items
CREATE TABLE pick_list_details (
  pick_detail_id SERIAL PRIMARY KEY,
  pick_list_id INTEGER NOT NULL REFERENCES pick_lists(pick_list_id),
  product_id INTEGER NOT NULL,
  variant_id INTEGER,
  warehouse_id INTEGER NOT NULL,
  bin_id INTEGER,
  required_quantity NUMERIC NOT NULL,
  picked_quantity NUMERIC DEFAULT 0,
  uom_id INTEGER NOT NULL,
  pick_sequence INTEGER,
  pick_instructions TEXT,
  serial_numbers TEXT[], -- Array of serial numbers for serialized items
  batch_numbers TEXT[], -- Array of batch numbers
  expiry_dates DATE[], -- Array of expiry dates for batch items
  status VARCHAR(20) NOT NULL DEFAULT 'pending', -- pending, partial, completed, short
  notes TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Add damage assessment table
CREATE TABLE damage_assessments (
  damage_id SERIAL PRIMARY KEY,
  company_id INTEGER NOT NULL,
  warehouse_id INTEGER NOT NULL,
  product_id INTEGER NOT NULL,
  variant_id INTEGER,
  serial_number VARCHAR(100),
  damaged_quantity NUMERIC NOT NULL,
  damage_type VARCHAR(50) NOT NULL, -- physical, expired, contaminated, etc.
  damage_severity VARCHAR(20) NOT NULL, -- minor, major, total_loss
  damage_description TEXT,
  damage_photos JSON, -- Array of photo URLs
  assessed_by INTEGER NOT NULL,
  assessment_date DATE NOT NULL DEFAULT CURRENT_DATE,
  estimated_loss_value NUMERIC,
  action_taken VARCHAR(50), -- write_off, repair, return_to_vendor, dispose
  insurance_claim_number VARCHAR(100),
  related_transaction_id INTEGER,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_by INTEGER NOT NULL,
  updated_by INTEGER
);

-- Add batch tracking enhancements to inventory_transaction_details
ALTER TABLE inventory_transaction_details 
ADD COLUMN IF NOT EXISTS batch_number VARCHAR(100),
ADD COLUMN IF NOT EXISTS expiry_date DATE,
ADD COLUMN IF NOT EXISTS manufacturing_date DATE,
ADD COLUMN IF NOT EXISTS serial_numbers TEXT[],
ADD COLUMN IF NOT EXISTS quality_status VARCHAR(20) DEFAULT 'approved',
ADD COLUMN IF NOT EXISTS reservation_id INTEGER,
ADD COLUMN IF NOT EXISTS pick_list_id INTEGER;

-- Create indexes for better performance
CREATE INDEX idx_stock_reservations_product_warehouse ON stock_reservations(product_id, warehouse_id, status);
CREATE INDEX idx_serial_numbers_product ON product_serial_numbers(product_id, status);
CREATE INDEX idx_qc_holds_product_warehouse ON quality_control_holds(product_id, warehouse_id, status);
CREATE INDEX idx_pick_lists_warehouse_status ON pick_lists(warehouse_id, status);
CREATE INDEX idx_damage_assessments_product ON damage_assessments(product_id, assessment_date);

-- Add RLS policies for data security
ALTER TABLE stock_reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_serial_numbers ENABLE ROW LEVEL SECURITY;
ALTER TABLE quality_control_holds ENABLE ROW LEVEL SECURITY;
ALTER TABLE pick_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE pick_list_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE damage_assessments ENABLE ROW LEVEL SECURITY;

-- Basic RLS policies (can be enhanced based on specific company requirements)
CREATE POLICY "Company isolation for stock_reservations" ON stock_reservations FOR ALL USING (company_id = 1);
CREATE POLICY "Company isolation for product_serial_numbers" ON product_serial_numbers FOR ALL USING (company_id = 1);
CREATE POLICY "Company isolation for quality_control_holds" ON quality_control_holds FOR ALL USING (company_id = 1);
CREATE POLICY "Company isolation for pick_lists" ON pick_lists FOR ALL USING (company_id = 1);
CREATE POLICY "Company isolation for damage_assessments" ON damage_assessments FOR ALL USING (company_id = 1);

-- Add some useful database functions
CREATE OR REPLACE FUNCTION get_available_stock(
  p_product_id INTEGER,
  p_warehouse_id INTEGER,
  p_variant_id INTEGER DEFAULT NULL,
  p_bin_id INTEGER DEFAULT NULL
) RETURNS NUMERIC AS $$
DECLARE
  total_stock NUMERIC DEFAULT 0;
  reserved_stock NUMERIC DEFAULT 0;
  qc_hold_stock NUMERIC DEFAULT 0;
BEGIN
  -- Get current stock from stock validation service
  SELECT COALESCE(current_stock, 0) INTO total_stock
  FROM (
    SELECT SUM(
      CASE 
        WHEN it.txn_type IN ('purchase_in', 'purchase_return_in', 'transfer_in', 'adjustment_in') 
        THEN itd.quantity
        ELSE -itd.quantity
      END
    ) as current_stock
    FROM inventory_transaction_details itd
    JOIN inventory_transactions it ON itd.txn_id = it.txn_id
    WHERE itd.product_id = p_product_id
    AND itd.to_warehouse_id = p_warehouse_id
    AND (p_variant_id IS NULL OR itd.variant_id = p_variant_id)
    AND (p_bin_id IS NULL OR itd.bin_id = p_bin_id)
  ) stock_calc;
  
  -- Get reserved stock
  SELECT COALESCE(SUM(reserved_quantity), 0) INTO reserved_stock
  FROM stock_reservations
  WHERE product_id = p_product_id
  AND warehouse_id = p_warehouse_id
  AND (p_variant_id IS NULL OR variant_id = p_variant_id)
  AND (p_bin_id IS NULL OR bin_id = p_bin_id)
  AND status = 'active';
  
  -- Get QC hold stock
  SELECT COALESCE(SUM(hold_quantity), 0) INTO qc_hold_stock
  FROM quality_control_holds
  WHERE product_id = p_product_id
  AND warehouse_id = p_warehouse_id
  AND (p_variant_id IS NULL OR variant_id = p_variant_id)
  AND (p_bin_id IS NULL OR bin_id = p_bin_id)
  AND status = 'on_hold';
  
  RETURN GREATEST(total_stock - reserved_stock - qc_hold_stock, 0);
END;
$$ LANGUAGE plpgsql;
