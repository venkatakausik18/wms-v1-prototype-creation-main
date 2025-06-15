
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import type { 
  LocalTransferFormData, 
  LocalTransferDetail, 
  LocalWarehouseData, 
  LocalStorageBinData 
} from "../types-local";

interface UseStockTransferFormReturn {
  loading: boolean;
  warehouses: LocalWarehouseData[];
  storageBins: LocalStorageBinData[];
  formData: LocalTransferFormData;
  details: LocalTransferDetail[];
  updateFormData: (updates: Partial<LocalTransferFormData>) => void;
  updateDetails: (newDetails: LocalTransferDetail[]) => void;
  addNewItem: () => void;
  removeItem: (index: number) => void;
  handleSave: () => Promise<void>;
  handleSubmitForApproval: () => Promise<void>;
  handleShip: () => Promise<void>;
}

export const useStockTransferForm = (id?: string): UseStockTransferFormReturn => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState<boolean>(false);
  const [warehouses, setWarehouses] = useState<LocalWarehouseData[]>([]);
  const [storageBins, setStorageBins] = useState<LocalStorageBinData[]>([]);

  const [formData, setFormData] = useState<LocalTransferFormData>({
    transfer_number: '',
    transfer_date: new Date().toISOString().split('T')[0],
    transfer_time: new Date().toTimeString().slice(0, 5),
    from_warehouse_id: '',
    to_warehouse_id: '',
    priority_level: 'normal',
    transfer_type: 'standard',
    transport_method: '',
    carrier_name: '',
    tracking_number: '',
    expected_delivery_date: '',
    temperature_monitored: false,
    temperature_range_min: '',
    temperature_range_max: '',
    special_instructions: '',
    internal_notes: '',
  });

  const [details, setDetails] = useState<LocalTransferDetail[]>([]);

  useEffect(() => {
    fetchWarehouses();
    if (id && id !== 'new') {
      fetchStockTransfer();
    } else {
      generateTransferNumber();
      addNewItem();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchWarehouses = async (): Promise<void> => {
    try {
      // Explicitly type the response to avoid deep type instantiation
      const { data, error } = await supabase
        .from('warehouses')
        .select('warehouse_id, warehouse_code, warehouse_name')
        .eq('is_active', true)
        .order('warehouse_name') as {
          data: Array<{
            warehouse_id: number;
            warehouse_code: string | null;
            warehouse_name: string;
          }> | null;
          error: any;
        };

      if (error) throw error;
      
      // Map to our local type structure
      const localWarehouses: LocalWarehouseData[] = (data || []).map(w => ({
        warehouse_id: w.warehouse_id,
        warehouse_code: w.warehouse_code || '',
        warehouse_name: w.warehouse_name
      }));
      
      setWarehouses(localWarehouses);
    } catch (error) {
      console.error('Error fetching warehouses:', error);
      toast.error('Failed to fetch warehouses');
    }
  };

  const fetchStorageBins = async (warehouseId: string): Promise<void> => {
    if (!warehouseId) return;
    try {
      // Explicitly type the response to avoid deep type instantiation
      const { data, error } = await supabase
        .from('storage_bins')
        .select('bin_id, bin_code')
        .eq('warehouse_id', parseInt(warehouseId))
        .eq('is_active', true)
        .order('bin_code') as {
          data: Array<{
            bin_id: number;
            bin_code: string;
          }> | null;
          error: any;
        };

      if (error) throw error;
      
      // Map to our local type structure
      const localBins: LocalStorageBinData[] = (data || []).map(b => ({
        bin_id: b.bin_id,
        bin_code: b.bin_code
      }));
      
      setStorageBins(localBins);
    } catch (error) {
      console.error('Error fetching storage bins:', error);
    }
  };

  const generateTransferNumber = (): void => {
    const prefix = 'TR';
    const timestamp = Date.now();
    setFormData(prev => ({
      ...prev,
      transfer_number: `${prefix}-${timestamp}`
    }));
  };

  const fetchStockTransfer = async (): Promise<void> => {
    // Implementation for editing existing transfers
  };

  const updateFormData = (updates: Partial<LocalTransferFormData>): void => {
    setFormData(prev => ({
      ...prev,
      ...updates,
    }));

    if (updates.from_warehouse_id || updates.to_warehouse_id) {
      const warehouseId = updates.from_warehouse_id || formData.from_warehouse_id;
      fetchStorageBins(warehouseId);
    }
  };

  const updateDetails = (newDetails: LocalTransferDetail[]): void => {
    setDetails(newDetails);
  };

  const addNewItem = (): void => {
    const newItem: LocalTransferDetail = {
      requested_quantity: 0,
      shipped_quantity: 0,
      received_quantity: 0,
      unit_cost: 0,
      total_cost: 0,
      line_status: 'pending',
      quality_status: 'approved',
      temperature_sensitive: false,
      fragile: false,
      hazardous: false
    };
    setDetails(prev => [...prev, newItem]);
  };

  const removeItem = (index: number): void => {
    if (details.length > 1) {
      setDetails(prev => prev.filter((_, i) => i !== index));
    }
  };

  const handleSave = async (): Promise<void> => {
    console.log('Saving transfer as draft...');
    toast.success('Transfer saved as draft');
  };

  const handleSubmitForApproval = async (): Promise<void> => {
    console.log('Submitting transfer for approval...');
    toast.success('Transfer submitted for approval');
  };

  const handleShip = async (): Promise<void> => {
    console.log('Shipping transfer...');
    toast.success('Transfer shipped');
  };

  return {
    loading,
    warehouses,
    storageBins,
    formData,
    details,
    updateFormData,
    updateDetails,
    addNewItem,
    removeItem,
    handleSave,
    handleSubmitForApproval,
    handleShip
  };
};
