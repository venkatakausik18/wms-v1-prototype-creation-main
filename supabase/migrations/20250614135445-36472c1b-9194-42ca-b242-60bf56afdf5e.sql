
-- Step 1: Create backup of existing customers data (if needed)
-- Note: You may want to export existing data before running this migration

-- Step 2: Drop existing customers table and recreate with comprehensive schema
DROP TABLE IF EXISTS public.customers CASCADE;

-- Step 3: Create the new comprehensive customers table
CREATE TABLE public.customers (
  customer_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Basic Identifiers
  customer_code       TEXT NOT NULL UNIQUE,
  customer_name       TEXT NOT NULL,
  contact_person      TEXT NOT NULL,
  mobile_phone        TEXT NOT NULL,
  telephone_no        TEXT,
  whatsapp_number     TEXT,

  -- Address Section
  address_line1       TEXT NOT NULL,
  address_line2       TEXT,
  town_city           TEXT NOT NULL,
  district            TEXT NOT NULL,
  state               TEXT NOT NULL,
  pincode             TEXT NOT NULL,
  country             TEXT NOT NULL DEFAULT 'India',

  -- Identification/Registration
  gstin               TEXT,
  pan_number          TEXT,
  aadhar_number       TEXT,
  uin_number          TEXT,
  udyog_adhar         TEXT,
  fssai_number        TEXT,

  -- Licensing & Transport
  drug_license_no     TEXT,
  dl_upto             DATE,
  transport_details   TEXT,
  transport_gstin     TEXT,
  other_country       BOOLEAN NOT NULL DEFAULT FALSE,
  currency            TEXT NOT NULL DEFAULT 'INR',

  -- Banking & Payment Terms
  payment_terms       TEXT NOT NULL DEFAULT 'NET 30',
  bank_account        TEXT,
  ifsc_code           TEXT,
  max_credit_limit    NUMERIC(12,2) NOT NULL DEFAULT 0.00,
  credit_site_days    INT NOT NULL DEFAULT 0,
  locking_days        INT NOT NULL DEFAULT 0,
  int_percentage      NUMERIC(5,2) NOT NULL DEFAULT 0.00,
  freight_charge      NUMERIC(12,2) NOT NULL DEFAULT 0.00,
  no_of_bills         INT NOT NULL DEFAULT 0,
  discount_amount     NUMERIC(12,2) NOT NULL DEFAULT 0.00,
  discount_within_days INT NOT NULL DEFAULT 0,
  default_return_days INT NOT NULL DEFAULT 0,
  
  -- Opening Balances & Sundry Debitor Flag
  opening_balance_dr  NUMERIC(12,2) NOT NULL DEFAULT 0.00,
  opening_balance_cr  NUMERIC(12,2) NOT NULL DEFAULT 0.00,
  sundry_debitor      BOOLEAN NOT NULL DEFAULT FALSE,

  -- Additional Flags & Options
  tds_applicable      BOOLEAN NOT NULL DEFAULT FALSE,
  allow_credit        BOOLEAN NOT NULL DEFAULT TRUE,
  show_due_bills      BOOLEAN NOT NULL DEFAULT FALSE,
  institute_sub_dealer BOOLEAN NOT NULL DEFAULT FALSE,
  allow_discount_on_bill BOOLEAN NOT NULL DEFAULT FALSE,
  discontinue_sleep   BOOLEAN NOT NULL DEFAULT FALSE,
  out_of_state        BOOLEAN NOT NULL DEFAULT FALSE,
  govt_no_tcs         BOOLEAN NOT NULL DEFAULT FALSE,
  auto_interest       BOOLEAN NOT NULL DEFAULT FALSE,
  hard_lock           BOOLEAN NOT NULL DEFAULT FALSE,
  order_challan       BOOLEAN NOT NULL DEFAULT FALSE,

  -- Area/Line/Camp Grid (Locate Tab)
  line_area_camp      TEXT,
  dl_no1              TEXT,
  dl_no2              TEXT,
  dl_no3              TEXT,
  tin_number          TEXT,
  srin_number         TEXT,
  locate_cr_site_days INT,
  locate_locking_days  INT,
  locate_credit_limit NUMERIC(12,2),
  locate_discount     NUMERIC(12,2),
  
  -- Metadata
  company_id          INTEGER NOT NULL DEFAULT 1,
  is_active           BOOLEAN NOT NULL DEFAULT TRUE,
  created_by          INTEGER,
  updated_by          INTEGER,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Step 4: Enable Row Level Security
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

-- Step 5: Create RLS policies for the new table
CREATE POLICY "Users can view customers from their company"
  ON public.customers FOR SELECT
  USING (company_id = 1);

CREATE POLICY "Users can insert customers to their company"
  ON public.customers FOR INSERT
  WITH CHECK (company_id = 1);

CREATE POLICY "Users can update customers from their company"
  ON public.customers FOR UPDATE
  USING (company_id = 1)
  WITH CHECK (company_id = 1);

CREATE POLICY "Users can delete customers from their company"
  ON public.customers FOR DELETE
  USING (company_id = 1);

-- Step 6: Create indexes for performance
CREATE INDEX idx_customers_customer_code ON public.customers(customer_code);
CREATE INDEX idx_customers_customer_name ON public.customers(customer_name);
CREATE INDEX idx_customers_company_id ON public.customers(company_id);
CREATE INDEX idx_customers_mobile_phone ON public.customers(mobile_phone);
CREATE INDEX idx_customers_gstin ON public.customers(gstin);

-- Step 7: Update the customer outstanding calculation function if it exists
CREATE OR REPLACE FUNCTION public.calculate_customer_outstanding(p_customer_id UUID)
 RETURNS numeric
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
    outstanding_amount NUMERIC DEFAULT 0;
BEGIN
    -- Calculate outstanding amount for a customer
    SELECT COALESCE(
        (
            SELECT SUM(si.grand_total) 
            FROM sales_invoices si 
            WHERE si.customer_id = p_customer_id 
            AND si.payment_status != 'paid'
        ), 0
    ) - COALESCE(
        (
            SELECT SUM(cr.total_amount_received) 
            FROM customer_receipts cr 
            WHERE cr.customer_id = p_customer_id
        ), 0
    ) INTO outstanding_amount;
    
    RETURN outstanding_amount;
END;
$function$;
