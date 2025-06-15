import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import type {
  FormData,
  StockDetail,
  WarehouseData,
  StorageBinData
} from "../types";

// Simple return type without complex intersections
interface UseStockEntryFormReturn {
  loading: boolean;
  warehouses: WarehouseData[];
  storageBins: StorageBinData[];
  formData: FormData;
  details: StockDetail[];
  updateFormData: (updates: Partial<FormData>) => void;
  updateDetails: (newDetails: StockDetail[]) => void;
  addNewItem: () => void;
  removeItem: (index: number) => void;
  handleSave: () => Promise<void>;
  generatePickList: () => Promise<void>;
}

export const useStockEntryForm = (id?: string): UseStockEntryFormReturn => {
  const navigate = useNavigate();
  
  // Explicit state types
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

  // Start with empty array to avoid deep type inference
  const [details, setDetails] = useState<StockDetail[]>([]);

  useEffect(() => {
    fetchWarehouses();
    if (id && id !== 'new') {
      fetchStockEntry();
    } else {
      generateTransactionNumber();
      // Add initial item after component mounts
      addNewItem();
    }
  }, [id]);

  const fetchWarehouses = async (): Promise<void> => {
    try {
      // Explicit generic type to prevent deep inference
      const { data, error } = await supabase
        .from('warehouses')
        .select<'warehouse_id, warehouse_code, warehouse_name', WarehouseData>('warehouse_id, warehouse_code, warehouse_name')
        .eq('is_active', true)
        .order('warehouse_name');

      if (error) throw error;
      
      // Immediate cast to domain type
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
      // Explicit generic type to prevent deep inference
      const { data, error } = await supabase
        .from('storage_bins')
        .select<'bin_id, bin_code', StorageBinData>('bin_id, bin_code')
        .eq('warehouse_id', parseInt(warehouseId))
        .eq('is_active', true)
        .order('bin_code');

      if (error) throw error;
      
      // Immediate cast to domain type
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
    const newItem: StockDetail = {
      quantity: 0,
      unit_cost: 0,
      total_cost: 0,
      previous_stock: 0,
      new_stock: 0
    };
    setDetails(prev => [...prev, newItem]);
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
      // Explicit transaction data type
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

      // Explicit transaction details mapping
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

  // Explicit return object instead of spread operators
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
    generatePickList
  };
};
