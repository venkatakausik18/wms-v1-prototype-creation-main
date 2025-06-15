
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface SimpleWarehouse {
  warehouse_id: number;
  warehouse_name: string;
}

export interface SimpleProduct {
  product_id: number;
  product_name: string;
  product_code: string;
}

export interface SimpleStorageBin {
  bin_id: number;
  bin_code: string;
}

export interface PhysicalCountRecord {
  count_id: number;
  count_number: string;
  company_id: number;
  warehouse_id: number;
  count_date: string;
  count_time: string;
  count_type: string;
  method: string;
  scheduled_by: number;
  counted_by: number;
  status: string;
  created_by: number;
}

export const useWarehouses = () => {
  const [warehouses, setWarehouses] = useState<SimpleWarehouse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWarehouses = async () => {
      try {
        const { data, error } = await supabase
          .from('warehouses')
          .select('warehouse_id, warehouse_name')
          .eq('is_active', true)
          .order('warehouse_name');
        
        if (error) throw error;
        setWarehouses(data || []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchWarehouses();
  }, []);

  return { warehouses, loading, error };
};

export const useProducts = () => {
  const [products, setProducts] = useState<SimpleProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('product_id, product_name, product_code')
          .eq('is_active', true)
          .order('product_name');
        
        if (error) throw error;
        setProducts(data || []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return { products, loading, error };
};

export const useStorageBins = (warehouseId: string) => {
  const [bins, setBins] = useState<SimpleStorageBin[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!warehouseId) {
      setBins([]);
      return;
    }

    const fetchBins = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('storage_bins')
          .select('bin_id, bin_code')
          .eq('warehouse_id', warehouseId)
          .eq('is_active', true)
          .order('bin_code');
        
        if (error) throw error;
        setBins(data || []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBins();
  }, [warehouseId]);

  return { bins, loading, error };
};

export const useCreatePhysicalCount = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createCount = async (setupData: any): Promise<PhysicalCountRecord> => {
    setLoading(true);
    setError(null);
    
    try {
      const countNumber = `CNT-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${String(Date.now()).slice(-4)}`;

      const { data, error } = await supabase
        .from('physical_counts')
        .insert([{
          company_id: 1,
          warehouse_id: parseInt(setupData.warehouse_id),
          count_number: countNumber,
          count_date: setupData.count_date,
          count_time: setupData.count_time,
          count_type: setupData.count_type,
          method: setupData.method,
          scheduled_by: setupData.scheduled_by,
          counted_by: setupData.counted_by,
          status: 'scheduled',
          created_by: 1
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { createCount, loading, error };
};
