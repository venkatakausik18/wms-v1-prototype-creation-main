
-- Update sales_invoices table to use UUID for customer_id to match customers table
-- First, we need to handle the type conversion and add the foreign key constraint

-- Step 1: Add a temporary UUID column
ALTER TABLE public.sales_invoices 
ADD COLUMN customer_id_temp UUID;

-- Step 2: Update the temporary column with converted values
-- Note: This assumes existing customer_id values correspond to actual customer records
UPDATE public.sales_invoices 
SET customer_id_temp = customers.customer_id 
FROM public.customers 
WHERE customers.customer_id::text = public.sales_invoices.customer_id::text;

-- Step 3: Drop the old customer_id column
ALTER TABLE public.sales_invoices 
DROP COLUMN customer_id;

-- Step 4: Rename the temporary column to customer_id
ALTER TABLE public.sales_invoices 
RENAME COLUMN customer_id_temp TO customer_id;

-- Step 5: Make the column NOT NULL (assuming all invoices should have customers)
ALTER TABLE public.sales_invoices 
ALTER COLUMN customer_id SET NOT NULL;

-- Step 6: Add foreign key constraint
ALTER TABLE public.sales_invoices 
ADD CONSTRAINT sales_invoices_customer_id_fkey 
FOREIGN KEY (customer_id) REFERENCES public.customers(customer_id) ON DELETE RESTRICT;

-- Step 7: Add index for performance
CREATE INDEX idx_sales_invoices_customer_id ON public.sales_invoices(customer_id);
