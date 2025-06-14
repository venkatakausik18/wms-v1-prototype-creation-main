
-- Fix customer_id type in sales_returns table to match customers table (UUID)
ALTER TABLE sales_returns 
ALTER COLUMN customer_id TYPE uuid USING customer_id::text::uuid;

-- Add foreign key constraint to ensure referential integrity
ALTER TABLE sales_returns 
ADD CONSTRAINT fk_sales_returns_customer_id 
FOREIGN KEY (customer_id) REFERENCES customers(customer_id);

-- Add foreign key constraint for original_invoice_id
ALTER TABLE sales_returns 
ADD CONSTRAINT fk_sales_returns_original_invoice_id 
FOREIGN KEY (original_invoice_id) REFERENCES sales_invoices(sales_id);

-- Ensure sales_return_details has proper foreign key constraints
ALTER TABLE sales_return_details 
ADD CONSTRAINT fk_sales_return_details_sales_return_id 
FOREIGN KEY (sales_return_id) REFERENCES sales_returns(sales_return_id);

ALTER TABLE sales_return_details 
ADD CONSTRAINT fk_sales_return_details_product_id 
FOREIGN KEY (product_id) REFERENCES products(product_id);
