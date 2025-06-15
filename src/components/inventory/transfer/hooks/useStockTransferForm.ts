
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import type {
  TransferFormData,
  TransferDetail,
  TransferStatus
} from "../types";
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
    internal_notes: ''
  });

  const [details, setDetails] = useState<TransferDetail[]>([]);

  useEffect(() => {
    fetchWarehouses();
    if (id && id !== 'new') {
      fetchTransfer();
    } else {
      generateTransferNumber();
      addNewItem();
    }
  }, [id]);

  const fetchWarehouses = async () => {
    try {
      const { data, error } = await supabase
        .from('warehouses')
        .select('warehouse_id, warehouse_code, warehouse_name')
        .eq('is_active', true)
        .order('warehouse_name');

      if (error) throw error;
      
      setWarehouses((data || []) as WarehouseData[]);
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
      
      setStorageBins((data || []) as StorageBinData[]);
    } catch (error) {
      console.error('Error fetching storage bins:', error);
    }
  };

  const generateTransferNumber = () => {
    const prefix = 'TXF';
    const timestamp = Date.now();
    setFormData(prev => ({
      ...prev,
      transfer_number: `${prefix}-${timestamp}`
    }));
  };

  const fetchTransfer = async () => {
    if (!id || id === 'new') return;

    try {
      const { data: transfer, error: transferError } = await supabase
        .from('stock_transfers')
        .select('*')
        .eq('transfer_id', parseInt(id))
        .single();

      if (transferError) throw transferError;

      if (transfer) {
        setFormData({
          transfer_number: transfer.transfer_number,
          transfer_date: transfer.transfer_date,
          transfer_time: transfer.transfer_time,
          from_warehouse_id: transfer.from_warehouse_id.toString(),
          to_warehouse_id: transfer.to_warehouse_id.toString(),
          priority_level: transfer.priority_level,
          transfer_type: transfer.transfer_type,
          transport_method: transfer.transport_method || '',
          carrier_name: transfer.carrier_name || '',
          tracking_number: transfer.tracking_number || '',
          expected_delivery_date: transfer.expected_delivery_date || '',
          temperature_monitored: transfer.temperature_monitored,
          temperature_range_min: transfer.temperature_range_min?.toString() || '',
          temperature_range_max: transfer.temperature_range_max?.toString() || '',
          special_instructions: transfer.special_instructions || '',
          internal_notes: transfer.internal_notes || ''
        });

        const { data: transferDetails, error: detailsError } = await supabase
          .from('transfer_details')
          .select('*')
          .eq('transfer_id', transfer.transfer_id);

        if (detailsError) throw detailsError;

        setDetails(transferDetails || []);
      }
    } catch (error) {
      console.error('Error fetching transfer:', error);
      toast.error('Failed to fetch transfer details');
    }
  };

  const updateFormData = (updates: Partial<TransferFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
    if (updates.from_warehouse_id || updates.to_warehouse_id) {
      fetchStorageBins(updates.from_warehouse_id || updates.to_warehouse_id || '');
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
    await saveTransfer('draft');
  };

  const handleSubmitForApproval = async () => {
    await saveTransfer('pending_approval');
  };

  const handleShip = async () => {
    await saveTransfer('in_transit');
  };

  const saveTransfer = async (status: TransferStatus) => {
    if (!formData.from_warehouse_id || !formData.to_warehouse_id) {
      toast.error('Please select both source and destination warehouses');
      return;
    }

    if (formData.from_warehouse_id === formData.to_warehouse_id) {
      toast.error('Source and destination warehouses cannot be the same');
      return;
    }

    if (details.length === 0 || !details.some(d => d.product_id && d.requested_quantity > 0)) {
      toast.error('Please add at least one item');
      return;
    }

    setLoading(true);

    try {
      const transferData = {
        company_id: 1,
        transfer_number: formData.transfer_number,
        transfer_date: formData.transfer_date,
        transfer_time: formData.transfer_time,
        from_warehouse_id: parseInt(formData.from_warehouse_id),
        to_warehouse_id: parseInt(formData.to_warehouse_id),
        transfer_status: status,
        priority_level: formData.priority_level,
        transfer_type: formData.transfer_type,
        transport_method: formData.transport_method || null,
        carrier_name: formData.carrier_name || null,
        tracking_number: formData.tracking_number || null,
        expected_delivery_date: formData.expected_delivery_date || null,
        temperature_monitored: formData.temperature_monitored,
        temperature_range_min: formData.temperature_range_min ? parseFloat(formData.temperature_range_min) : null,
        temperature_range_max: formData.temperature_range_max ? parseFloat(formData.temperature_range_max) : null,
        special_instructions: formData.special_instructions,
        internal_notes: formData.internal_notes,
        total_items: details.filter(d => d.product_id).length,
        total_quantity: details.reduce((sum, d) => sum + d.requested_quantity, 0),
        total_value: details.reduce((sum, d) => sum + d.total_cost, 0),
        created_by: 1
      };

      const { data: transfer, error: transferError } = await supabase
        .from('stock_transfers')
        .insert(transferData)
        .select()
        .single();

      if (transferError) throw transferError;

      const transferDetails = details
        .filter(d => d.product_id && d.requested_quantity > 0)
        .map(d => ({
          transfer_id: transfer.transfer_id,
          product_id: d.product_id!,
          variant_id: d.variant_id,
          requested_quantity: d.requested_quantity,
          uom_id: d.uom_id!,
          unit_cost: d.unit_cost,
          total_cost: d.total_cost,
          from_bin_id: d.from_bin_id,
          to_bin_id: d.to_bin_id,
          line_status: d.line_status,
          quality_status: d.quality_status,
          temperature_sensitive: d.temperature_sensitive,
          fragile: d.fragile,
          hazardous: d.hazardous,
          special_handling_notes: d.special_handling_notes
        }));

      const { error: detailsError } = await supabase
        .from('transfer_details')
        .insert(transferDetails);

      if (detailsError) throw detailsError;

      toast.success(`Stock transfer ${status === 'draft' ? 'saved' : status === 'pending_approval' ? 'submitted for approval' : 'shipped'} successfully`);
      navigate('/inventory/transfer');
    } catch (error) {
      console.error('Error saving transfer:', error);
      toast.error('Failed to save transfer');
    } finally {
      setLoading(false);
    }
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
