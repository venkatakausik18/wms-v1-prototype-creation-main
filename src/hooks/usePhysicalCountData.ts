
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Warehouse, Product, StorageBin } from "@/types/physicalCount";

interface UsePhysicalCountDataReturn {
  warehouses: Warehouse[] | undefined;
  products: Product[] | undefined;
  bins: StorageBin[] | undefined;
  isLoadingWarehouses: boolean;
  isLoadingProducts: boolean;
  isLoadingBins: boolean;
}

export const usePhysicalCountData = (warehouseId: string): UsePhysicalCountDataReturn => {
  const warehousesQuery = useQuery({
    queryKey: ['warehouses'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('warehouses')
        .select('warehouse_id, warehouse_name')
        .eq('is_active', true)
        .order('warehouse_name');
      
      if (error) throw error;
      return data as Warehouse[];
    },
  });

  const productsQuery = useQuery({
    queryKey: ['products-for-count'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('product_id, product_name, product_code')
        .eq('is_active', true)
        .order('product_name');
      
      if (error) throw error;
      return data as Product[];
    },
  });

  const binsQuery = useQuery({
    queryKey: ['storage-bins', warehouseId],
    queryFn: async () => {
      if (!warehouseId) return [] as StorageBin[];
      
      const { data, error } = await supabase
        .from('storage_bins')
        .select('bin_id, bin_code')
        .eq('warehouse_id', warehouseId)
        .eq('is_active', true)
        .order('bin_code');
      
      if (error) throw error;
      return data as StorageBin[];
    },
    enabled: !!warehouseId,
  });

  return {
    warehouses: warehousesQuery.data,
    products: productsQuery.data,
    bins: binsQuery.data,
    isLoadingWarehouses: warehousesQuery.isLoading,
    isLoadingProducts: productsQuery.isLoading,
    isLoadingBins: binsQuery.isLoading,
  };
};
