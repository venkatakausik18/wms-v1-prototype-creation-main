
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Warehouse, Product, StorageBin } from "@/types/physicalCount";

export const usePhysicalCountData = (warehouseId: string) => {
  const warehouses = useQuery<Warehouse[]>({
    queryKey: ['warehouses'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('warehouses')
        .select('warehouse_id, warehouse_name')
        .eq('is_active', true)
        .order('warehouse_name');
      
      if (error) throw error;
      return (data || []) as Warehouse[];
    },
  });

  const products = useQuery<Product[]>({
    queryKey: ['products-for-count'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('product_id, product_name, product_code')
        .eq('is_active', true)
        .order('product_name');
      
      if (error) throw error;
      return (data || []) as Product[];
    },
  });

  const bins = useQuery<StorageBin[]>({
    queryKey: ['storage-bins', warehouseId],
    queryFn: async () => {
      if (!warehouseId) return [];
      
      const { data, error } = await supabase
        .from('storage_bins')
        .select('bin_id, bin_code')
        .eq('warehouse_id', warehouseId)
        .eq('is_active', true)
        .order('bin_code');
      
      if (error) throw error;
      return (data || []) as StorageBin[];
    },
    enabled: !!warehouseId,
  });

  return {
    warehouses: warehouses.data,
    products: products.data,
    bins: bins.data,
    isLoadingWarehouses: warehouses.isLoading,
    isLoadingProducts: products.isLoading,
    isLoadingBins: bins.isLoading,
  };
};
