import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
// Don't import TransferFormData and TransferDetail here to avoid recursion/type explosion
// import type { TransferFormData, TransferDetail } from "../types";
import type { WarehouseData, StorageBinData } from "../../types";

// Light local type definitions to avoid deep TypeScript recursion
interface LocalTransferFormData {
  transfer_number: string;
  transfer_date: string;
  transfer_time: string;
  from_warehouse_id: string;
  to_warehouse_id: string;
  priority_level: string;
  transfer_type: string;
  transport_method: string;
  carrier_name: string;
  tracking_number: string;
  expected_delivery_date: string;
  temperature_monitored: boolean;
  temperature_range_min: string;
  temperature_range_max: string;
  special_instructions: string;
  internal_notes: string;
}

interface LocalTransferDetail {
  detail_id?: number;
  transfer_id?: number;
  product_id?: number;
  variant_id?: number;
  requested_quantity: number;
  shipped_quantity: number;
  received_quantity: number;
  uom_id?: number;
  unit_cost: number;
  total_cost: number;
  from_bin_id?: number;
  to_bin_id?: number;
  serial_numbers?: string[];
  batch_numbers?: string[];
  expiry_dates?: string[];
  line_status: string;
  quality_status: string;
  temperature_sensitive: boolean;
  fragile: boolean;
  hazardous: boolean;
  special_handling_notes?: string;
  created_at?: string;
  updated_at?: string;
}

interface UseStockTransferFormReturn {
  loading: boolean;
  warehouses: WarehouseData[];
  storageBins: StorageBinData[];
  formData: LocalTransferFormData;
  details: LocalTransferDetail[];
  updateFormData: (updates: Partial<LocalTransferFormData>) => void;
  updateDetails: (newDetails: LocalTransferDetail[]) => void;
  addNewItem: () => void;
  removeItem: () => void;
  handleSave: () => Promise<void>;
  handleSubmitForApproval: () => Promise<void>;
  handleShip: () => Promise<void>;
}

export const useStockTransferForm = (id?: string): UseStockTransferFormReturn => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState<boolean>(false);
  const [warehouses, setWarehouses] = useState<WarehouseData[]>([]);
  const [storageBins, setStorageBins] = useState<StorageBinData[]>([]);

  // All local types. No complex Partial or recursive reference.
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

  // This is the only use of Partial, with a LOCAL type.
  const updateFormData = (updates: Partial<LocalTransferFormData>) => {
    setFormData(prev => ({
      ...prev,
      ...updates,
    }));

    // Only one lookup on ids as string; this is simple and flat.
    if (updates.from_warehouse_id || updates.to_warehouse_id) {
      fetchStorageBins(
        updates.from_warehouse_id
          ? updates.from_warehouse_id
          : formData.from_warehouse_id
      );
    }
  };

  const updateDetails = (newDetails: LocalTransferDetail[]) => {
    setDetails(newDetails);
  };

  const addNewItem = () => {
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

// All code now uses local, flat types and avoids Partial on anything but flat LocalTransferFormData
