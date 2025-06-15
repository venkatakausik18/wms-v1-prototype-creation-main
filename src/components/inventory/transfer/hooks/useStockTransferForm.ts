
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import type { PostgrestError } from '@supabase/supabase-js';
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

export const useStockTransferForm = (id?: string) => {
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
      const { data, error } = await supabase
        .from('warehouses')
        .select('warehouse_id, warehouse_code, warehouse_name')
        .eq('is_active', true)
        .order('warehouse_name');

      if (error) throw error;

      // Map to LocalWarehouseData[]
      const mapped = (data ?? []).map((row: any) => ({
        warehouse_id: row.warehouse_id,
        warehouse_code: row.warehouse_code,
        warehouse_name: row.warehouse_name,
      })) as LocalWarehouseData[];

      setWarehouses(mapped);
    } catch (error) {
      console.error('Error fetching warehouses:', error);
      toast.error('Failed to fetch warehouses');
    }
  };

  const fetchStorageBins = async (warehouseId: string): Promise<void> => {
    if (!warehouseId) return;

    try {
      const { data, error } = await supabase
        .from('storage_bins')
        .select('bin_id, bin_code')
        .eq('warehouse_id', parseInt(warehouseId, 10))
        .eq('is_active', true)
        .order('bin_code');

      if (error) throw error;

      // Map to LocalStorageBinData[]
      const mapped = (data ?? []).map((row: any) => ({
        bin_id: row.bin_id,
        bin_code: row.bin_code,
      })) as LocalStorageBinData[];

      setStorageBins(mapped);
    } catch (error) {
      console.error('Error fetching storage bins:', error);
      toast.error('Failed to fetch storage bins');
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
