
-- Create enum for transfer status (only if it doesn't exist)
DO $$ BEGIN
    CREATE TYPE transfer_status AS ENUM (
      'draft',
      'pending_approval',
      'approved',
      'in_transit',
      'partially_received',
      'completed',
      'cancelled'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create enum for transport method (only if it doesn't exist)
DO $$ BEGIN
    CREATE TYPE transport_method AS ENUM (
      'internal',
      'courier',
      'truck',
      'rail',
      'air',
      'sea'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create stock_transfers table
CREATE TABLE public.stock_transfers (
  transfer_id SERIAL PRIMARY KEY,
  company_id INTEGER NOT NULL,
  transfer_number VARCHAR(100) NOT NULL UNIQUE,
  transfer_date DATE NOT NULL,
  transfer_time TIME NOT NULL,
  from_warehouse_id INTEGER NOT NULL,
  to_warehouse_id INTEGER NOT NULL,
  transfer_status transfer_status NOT NULL DEFAULT 'draft',
  approval_status approval_status NOT NULL DEFAULT 'pending',
  priority_level VARCHAR(20) NOT NULL DEFAULT 'normal',
  transfer_type VARCHAR(50) NOT NULL DEFAULT 'standard',
  
  -- Approval workflow
  requires_approval BOOLEAN NOT NULL DEFAULT false,
  approved_by INTEGER,
  approved_at TIMESTAMP,
  approval_remarks TEXT,
  
  -- Transport details
  transport_method transport_method,
  carrier_name VARCHAR(255),
  tracking_number VARCHAR(255),
  expected_delivery_date DATE,
  actual_delivery_date DATE,
  
  -- GPS and monitoring
  current_location VARCHAR(500),
  temperature_monitored BOOLEAN DEFAULT false,
  temperature_range_min DECIMAL(5,2),
  temperature_range_max DECIMAL(5,2),
  
  -- Financial
  estimated_cost DECIMAL(15,2) DEFAULT 0,
  actual_cost DECIMAL(15,2) DEFAULT 0,
  
  -- Totals
  total_items INTEGER DEFAULT 0,
  total_quantity DECIMAL(15,3) DEFAULT 0,
  total_value DECIMAL(15,2) DEFAULT 0,
  
  -- Template support
  template_id INTEGER,
  is_template BOOLEAN DEFAULT false,
  template_name VARCHAR(255),
  
  -- Documentation
  special_instructions TEXT,
  internal_notes TEXT,
  shipping_documents JSON,
  
  -- Audit
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_by INTEGER NOT NULL,
  updated_by INTEGER
);

-- Create transfer_details table
CREATE TABLE public.transfer_details (
  detail_id SERIAL PRIMARY KEY,
  transfer_id INTEGER NOT NULL REFERENCES stock_transfers(transfer_id) ON DELETE CASCADE,
  product_id INTEGER NOT NULL,
  variant_id INTEGER,
  
  -- Quantities
  requested_quantity DECIMAL(15,3) NOT NULL,
  shipped_quantity DECIMAL(15,3) DEFAULT 0,
  received_quantity DECIMAL(15,3) DEFAULT 0,
  
  -- UOM and costing
  uom_id INTEGER NOT NULL,
  unit_cost DECIMAL(15,4) DEFAULT 0,
  total_cost DECIMAL(15,2) DEFAULT 0,
  
  -- Source location
  from_bin_id INTEGER,
  
  -- Destination location
  to_bin_id INTEGER,
  
  -- Tracking
  serial_numbers TEXT[],
  batch_numbers TEXT[],
  expiry_dates DATE[],
  
  -- Status
  line_status VARCHAR(50) NOT NULL DEFAULT 'pending',
  quality_status VARCHAR(50) DEFAULT 'approved',
  
  -- Special handling
  temperature_sensitive BOOLEAN DEFAULT false,
  fragile BOOLEAN DEFAULT false,
  hazardous BOOLEAN DEFAULT false,
  special_handling_notes TEXT,
  
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create transfer_approvals table for multi-step approval
CREATE TABLE public.transfer_approvals (
  approval_id SERIAL PRIMARY KEY,
  transfer_id INTEGER NOT NULL REFERENCES stock_transfers(transfer_id) ON DELETE CASCADE,
  approval_step INTEGER NOT NULL,
  approver_id INTEGER NOT NULL,
  approval_level VARCHAR(50) NOT NULL,
  status approval_status NOT NULL DEFAULT 'pending',
  approved_at TIMESTAMP,
  rejection_reason TEXT,
  comments TEXT,
  
  -- Approval rules
  min_value_threshold DECIMAL(15,2),
  max_value_threshold DECIMAL(15,2),
  
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create transfer_tracking table for GPS and status updates
CREATE TABLE public.transfer_tracking (
  tracking_id SERIAL PRIMARY KEY,
  transfer_id INTEGER NOT NULL REFERENCES stock_transfers(transfer_id) ON DELETE CASCADE,
  
  -- Location data
  latitude DECIMAL(10,8),
  longitude DECIMAL(11,8),
  location_name VARCHAR(255),
  
  -- Status and timing
  status VARCHAR(100) NOT NULL,
  event_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  -- Environmental monitoring
  temperature DECIMAL(5,2),
  humidity DECIMAL(5,2),
  
  -- Additional data
  notes TEXT,
  photos JSON,
  recorded_by INTEGER,
  
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create transfer_templates table
CREATE TABLE public.transfer_templates (
  template_id SERIAL PRIMARY KEY,
  company_id INTEGER NOT NULL,
  template_name VARCHAR(255) NOT NULL,
  template_code VARCHAR(100) NOT NULL,
  description TEXT,
  
  -- Default settings
  from_warehouse_id INTEGER,
  to_warehouse_id INTEGER,
  transport_method transport_method,
  priority_level VARCHAR(20) DEFAULT 'normal',
  requires_approval BOOLEAN DEFAULT false,
  
  -- Template details (JSON for flexibility)
  default_products JSON,
  
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_by INTEGER NOT NULL
);

-- Add indexes for performance
CREATE INDEX idx_stock_transfers_company ON stock_transfers(company_id);
CREATE INDEX idx_stock_transfers_status ON stock_transfers(transfer_status);
CREATE INDEX idx_stock_transfers_date ON stock_transfers(transfer_date);
CREATE INDEX idx_stock_transfers_warehouses ON stock_transfers(from_warehouse_id, to_warehouse_id);
CREATE INDEX idx_transfer_details_transfer ON transfer_details(transfer_id);
CREATE INDEX idx_transfer_details_product ON transfer_details(product_id);
CREATE INDEX idx_transfer_tracking_transfer ON transfer_tracking(transfer_id);
CREATE INDEX idx_transfer_tracking_time ON transfer_tracking(event_time);

-- Enable RLS
ALTER TABLE stock_transfers ENABLE ROW LEVEL SECURITY;
ALTER TABLE transfer_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE transfer_approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE transfer_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE transfer_templates ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (basic company-based access)
CREATE POLICY "Users can access transfers for their company" 
  ON stock_transfers FOR ALL 
  USING (company_id = 1);

CREATE POLICY "Users can access transfer details for their company" 
  ON transfer_details FOR ALL 
  USING (EXISTS (
    SELECT 1 FROM stock_transfers st 
    WHERE st.transfer_id = transfer_details.transfer_id 
    AND st.company_id = 1
  ));

CREATE POLICY "Users can access transfer approvals for their company" 
  ON transfer_approvals FOR ALL 
  USING (EXISTS (
    SELECT 1 FROM stock_transfers st 
    WHERE st.transfer_id = transfer_approvals.transfer_id 
    AND st.company_id = 1
  ));

CREATE POLICY "Users can access transfer tracking for their company" 
  ON transfer_tracking FOR ALL 
  USING (EXISTS (
    SELECT 1 FROM stock_transfers st 
    WHERE st.transfer_id = transfer_tracking.transfer_id 
    AND st.company_id = 1
  ));

CREATE POLICY "Users can access transfer templates for their company" 
  ON transfer_templates FOR ALL 
  USING (company_id = 1);
