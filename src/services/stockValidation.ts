
import { supabase } from "@/integrations/supabase/client";

export interface StockPosition {
  product_id: number;
  variant_id?: number;
  warehouse_id: number;
  bin_id?: number;
  current_stock: number;
  reserved_stock: number;
  available_stock: number;
}

export interface StockValidationResult {
  isValid: boolean;
  currentStock: number;
  availableStock: number;
  message?: string;
}

export const getStockPosition = async (
  productId: number,
  warehouseId: number,
  variantId?: number,
  binId?: number
): Promise<StockPosition | null> => {
  try {
    let query = supabase
      .from('inventory_transaction_details')
      .select(`
        product_id,
        variant_id,
        to_warehouse_id,
        bin_id,
        quantity,
        inventory_transactions!txn_id(txn_type)
      `)
      .eq('product_id', productId)
      .eq('to_warehouse_id', warehouseId);

    if (variantId) {
      query = query.eq('variant_id', variantId);
    }

    if (binId) {
      query = query.eq('bin_id', binId);
    }

    const { data, error } = await query;
    
    if (error) throw error;

    // Calculate current stock based on transaction types
    let currentStock = 0;
    
    data?.forEach(detail => {
      const txnType = (detail.inventory_transactions as any)?.txn_type;
      const quantity = detail.quantity || 0;
      
      // Inward transactions increase stock
      if (['purchase_in', 'purchase_return_in', 'transfer_in', 'adjustment_in'].includes(txnType)) {
        currentStock += quantity;
      }
      // Outward transactions decrease stock
      else if (['sale_out', 'sale_return_out', 'transfer_out', 'adjustment_out'].includes(txnType)) {
        currentStock -= quantity;
      }
    });

    return {
      product_id: productId,
      variant_id: variantId,
      warehouse_id: warehouseId,
      bin_id: binId,
      current_stock: currentStock,
      reserved_stock: 0, // TODO: Implement reservation logic
      available_stock: currentStock
    };
  } catch (error) {
    console.error('Error fetching stock position:', error);
    return null;
  }
};

export const validateStockTransaction = async (
  productId: number,
  warehouseId: number,
  quantity: number,
  transactionType: string,
  variantId?: number,
  binId?: number
): Promise<StockValidationResult> => {
  try {
    const stockPosition = await getStockPosition(productId, warehouseId, variantId, binId);
    
    if (!stockPosition) {
      return {
        isValid: false,
        currentStock: 0,
        availableStock: 0,
        message: 'Unable to fetch current stock position'
      };
    }

    // For inward transactions, validation is usually always valid
    if (['purchase_in', 'purchase_return_in', 'transfer_in', 'adjustment_in'].includes(transactionType)) {
      return {
        isValid: true,
        currentStock: stockPosition.current_stock,
        availableStock: stockPosition.available_stock,
        message: 'Inward transaction - stock will increase'
      };
    }

    // For outward transactions, check if sufficient stock is available
    if (quantity > stockPosition.available_stock) {
      return {
        isValid: false,
        currentStock: stockPosition.current_stock,
        availableStock: stockPosition.available_stock,
        message: `Insufficient stock. Available: ${stockPosition.available_stock}, Required: ${quantity}`
      };
    }

    return {
      isValid: true,
      currentStock: stockPosition.current_stock,
      availableStock: stockPosition.available_stock,
      message: 'Transaction valid'
    };
  } catch (error) {
    console.error('Error validating stock transaction:', error);
    return {
      isValid: false,
      currentStock: 0,
      availableStock: 0,
      message: 'Error validating stock transaction'
    };
  }
};
