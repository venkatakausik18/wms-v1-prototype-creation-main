
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

// Explicit type definitions
interface FormData {
  txn_number: string;
  txn_type: 'sale_out' | 'transfer_out' | 'adjustment_out';
  txn_date: string;
  txn_time: string;
  warehouse_id: string;
  reference_document: string;
  remarks: string;
}

interface StockDetail {
  product_id?: number;
  variant_id?: number;
  quantity: number;
  unit_cost: number;
  total_cost: number;
  uom_id?: number;
  bin_id?: number;
  previous_stock: number;
  new_stock: number;
  product?: {
    product_id: number;
    product_code: string;
    product_name: string;
    base_uom_id: number;
  };
  uom?: {
    uom_id: number;
    uom_name: string;
  };
}

// Simplified data types with explicit annotations
type WarehouseData = {
  warehouse_id: number;
  warehouse_code: string;
  warehouse_name: string;
};

type StorageBinData = {
  bin_id: number;
  bin_code: string;
};

// Hook state types
interface HookState {
  loading: boolean;
  warehouses: WarehouseData[];
  storageBins: StorageBinData[];
  formData: FormData;
  details: StockDetail[];
}

// Hook actions types
interface HookActions {
  updateFormData: (updates: Partial<FormData>) => void;
  updateDetails: (newDetails: StockDetail[]) => void;
  addNewItem: () => void;
  removeItem: (index: number) => void;
  handleSave: () => Promise<void>;
  generatePickList: () => Promise<void>;
}

export const useStockEntryForm = (id?: string): HookState & HookActions => {
  const navigate = useNavigate();
  
  // State with explicit types
  const [loading, setLoading] = useState<boolean>(false);
  const [warehouses, setWarehouses] = useState<WarehouseData[]>([]);
  const [storageBins, setStorageBins] = useState<StorageBinData[]>([]);

  const [formData, setFormData] = useState<FormData>({
    txn_number: '',
    txn_type: 'sale_out',
    txn_date: new Date().toISOString().split('T')[0],
    txn_time: new Date().toTimeString().slice(0, 5),
    warehouse_id: '',
    reference_document: '',
    remarks: ''
  });

  const [details, setDetails] = useState<StockDetail[]>([{
    quantity: 0,
    unit_cost: 0,
    total_cost: 0,
    previous_stock: 0,
    new_stock: 0
  }]);

  useEffect(() => {
    fetchWarehouses();
    if (id && id !== 'new') {
      fetchStockEntry();
    } else {
      generateTransactionNumber();
    }
  }, [id]);

  const fetchWarehouses = async (): Promise<void> => {
    try {
      const { data, error } = await supabase
        .from('warehouses')
        .select('warehouse_id, warehouse_code, warehouse_name')
        .eq('is_active', true)
        .order('warehouse_name');

      if (error) throw error;
      
      // Cast to our domain type immediately
      const warehouseData = (data || []) as WarehouseData[];
      setWarehouses(warehouseData);
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
        .eq('warehouse_id', parseInt(warehouseId))
        .eq('is_active', true)
        .order('bin_code');

      if (error) throw error;
      
      // Cast to our domain type immediately
      const binData = (data || []) as StorageBinData[];
      setStorageBins(binData);
    } catch (error) {
      console.error('Error fetching storage bins:', error);
    }
  };

  const generateTransactionNumber = (): void => {
    const prefix = 'OUT';
    const timestamp = Date.now();
    setFormData(prev => ({
      ...prev,
      txn_number: `${prefix}-${timestamp}`
    }));
  };

  const fetchStockEntry = async (): Promise<void> => {
    // Implementation for editing existing entries
  };

  const updateFormData = (updates: Partial<FormData>): void => {
    setFormData(prev => ({ ...prev, ...updates }));
    if (updates.warehouse_id) {
      fetchStorageBins(updates.warehouse_id);
    }
  };

  const updateDetails = (newDetails: StockDetail[]): void => {
    setDetails(newDetails);
  };

  const addNewItem = (): void => {
    setDetails(prev => [...prev, {
      quantity: 0,
      unit_cost: 0,
      total_cost: 0,
      previous_stock: 0,
      new_stock: 0
    }]);
  };

  const removeItem = (index: number): void => {
    if (details.length > 1) {
      setDetails(prev => prev.filter((_, i) => i !== index));
    }
  };

  const generatePickList = async (): Promise<void> => {
    if (!formData.warehouse_id) {
      toast.error('Please select a warehouse first');
      return;
    }
    toast.success('Pick list generation feature coming soon');
  };

  const handleSave = async (): Promise<void> => {
    if (!formData.warehouse_id) {
      toast.error('Please select a warehouse');
      return;
    }

    if (details.length === 0 || !details.some(d => d.product_id && d.quantity > 0)) {
      toast.error('Please add at least one item');
      return;
    }

    setLoading(true);

    try {
      // Create inventory transaction with explicit types
      const transactionData = {
        company_id: 1,
        warehouse_id: parseInt(formData.warehouse_id),
        txn_number: formData.txn_number,
        txn_type: formData.txn_type,
        txn_date: formData.txn_date,
        txn_time: formData.txn_time,
        reference_document: formData.reference_document,
        remarks: formData.remarks,
        total_items: details.filter(d => d.product_id).length,
        total_quantity: details.reduce((sum, d) => sum + d.quantity, 0),
        total_value: details.reduce((sum, d) => sum + d.total_cost, 0),
        created_by: 1
      };

      const { data: transaction, error: txnError } = await supabase
        .from('inventory_transactions')
        .insert(transactionData)
        .select()
        .single();

      if (txnError) throw txnError;

      // Create transaction details with explicit mapping
      const transactionDetails = details
        .filter(d => d.product_id && d.quantity > 0)
        .map(d => ({
          txn_id: transaction.txn_id,
          product_id: d.product_id!,
          variant_id: d.variant_id,
          uom_id: d.uom_id!,
          quantity: d.quantity,
          unit_cost: d.unit_cost,
          total_cost: d.total_cost,
          from_warehouse_id: parseInt(formData.warehouse_id),
          bin_id: d.bin_id,
          previous_stock: d.previous_stock,
          new_stock: d.new_stock
        }));

      const { error: detailsError } = await supabase
        .from('inventory_transaction_details')
        .insert(transactionDetails);

      if (detailsError) throw detailsError;

      toast.success('Stock entry (outward) saved successfully');
      navigate('/inventory/stock-entry');
    } catch (error) {
      console.error('Error saving stock entry:', error);
      toast.error('Failed to save stock entry');
    } finally {
      setLoading(false);
    }
  };

  return {
    // State
    loading,
    warehouses,
    storageBins,
    formData,
    details,
    // Actions
    updateFormData,
    updateDetails,
    addNewItem,
    removeItem,
    handleSave,
    generatePickList
  };
};
