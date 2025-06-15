import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import type { TransferFormData, TransferDetail } from "../types";
import type { WarehouseData, StorageBinData } from "../../types";

interface UseStockTransferFormReturn {
  loading: boolean;
  warehouses: WarehouseData[];
  storageBins: StorageBinData[];
  formData: TransferFormData;
  details: TransferDetail[];
  updateFormData: (updates: Partial<TransferFormData>) => void;
  updateDetails: (newDetails: TransferDetail[]) => void;
  addNewItem: () => void;
  removeItem: (index: number) => void;
  handleSave: () => Promise<void>;
  handleSubmitForApproval: () => Promise<void>;
  handleShip: () => Promise<void>;
}

export const useStockTransferForm = (id?: string): UseStockTransferFormReturn => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [warehouses, setWarehouses] = useState<WarehouseData[]>([]);
  const [storageBins, setStorageBins] = useState<StorageBinData[]>([]);

  const [formData, setFormData] = useState<TransferFormData>({
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

  const [details, setDetails] = useState<TransferDetail[]>([]);

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

  const fetchWarehouses = async () => {
    try {
      const { data, error } = await supabase
        .from('warehouses')
        .select('warehouse_id, warehouse_code, warehouse_name')
        .eq('is_active', true)
        .order('warehouse_name');

      if (error) throw error;
      setWarehouses(data || []);
    } catch (error) {
      console.error('Error fetching warehouses:', error);
      toast.error('Failed to fetch warehouses');
    }
  };

  const fetchStorageBins = async (warehouseId: string) => {
    if (!warehouseId) return;
    try {
      const { data, error } = await supabase
        .from('storage_bins')
        .select('bin_id, bin_code')
        .eq('warehouse_id', parseInt(warehouseId))
        .eq('is_active', true)
        .order('bin_code');

      if (error) throw error;
      setStorageBins(data || []);
    } catch (error) {
      console.error('Error fetching storage bins:', error);
    }
  };

  const generateTransferNumber = () => {
    const prefix = 'TR';
    const timestamp = Date.now();
    setFormData(prev => ({
      ...prev,
      transfer_number: `${prefix}-${timestamp}`
    }));
  };

  const fetchStockTransfer = async () => {
    // Implementation for editing existing transfers
  };

  const updateFormData = (updates: Partial<TransferFormData>) => {
    setFormData(prev => ({
      ...prev,
      ...updates,
    }));
    
    if (updates.from_warehouse_id || updates.to_warehouse_id) {
      fetchStorageBins(updates.from_warehouse_id || formData.from_warehouse_id);
    }
  };

  const updateDetails = (newDetails: TransferDetail[]) => {
    setDetails(newDetails);
  };

  const addNewItem = () => {
    const newItem: TransferDetail = {
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

  const removeItem = (index: number) => {
    if (details.length > 1) {
      setDetails(prev => prev.filter((_, i) => i !== index));
    }
  };

  const handleSave = async () => {
    console.log('Saving transfer as draft...');
    toast.success('Transfer saved as draft');
  };

  const handleSubmitForApproval = async () => {
    console.log('Submitting transfer for approval...');
    toast.success('Transfer submitted for approval');
  };

  const handleShip = async () => {
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
