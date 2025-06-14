
-- Update customer_addresses table to use UUID foreign key
ALTER TABLE public.customer_addresses 
DROP CONSTRAINT IF EXISTS customer_addresses_customer_id_fkey;

-- Change customer_id column type to UUID
ALTER TABLE public.customer_addresses 
ALTER COLUMN customer_id TYPE UUID USING customer_id::text::uuid;

-- Add the foreign key constraint back with UUID reference
ALTER TABLE public.customer_addresses 
ADD CONSTRAINT customer_addresses_customer_id_fkey 
FOREIGN KEY (customer_id) REFERENCES public.customers(customer_id) ON DELETE CASCADE;
