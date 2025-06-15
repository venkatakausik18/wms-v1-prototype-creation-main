
import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2 } from "lucide-react";
import ProductSelector from "./ProductSelector";
import { formatCurrency, formatNumber } from "@/utils/currency";

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

interface ProductVariant {
  variant_id: number;
  variant_code: string;
  variant_name: string;
}

interface StorageBin {
  bin_id: number;
  bin_code: string;
}

interface StockItemRowProps {
  detail: StockDetail;
  index: number;
  storageBins: StorageBin[];
  warehouseId: string;
  onUpdate: (updates: Partial<StockDetail>) => void;
  onRemove: () => void;
  canRemove: boolean;
}

export const StockItemRow: React.FC<StockItemRowProps> = ({
  detail,
  index,
  storageBins,
  warehouseId,
  onUpdate,
  onRemove,
  canRemove
}) => {
  const handleProductSelect = (product: any, variant?: ProductVariant) => {
    const updates: Partial<StockDetail> = {
      product_id: product.product_id,
      variant_id: variant?.variant_id,
      product: {
        product_id: product.product_id,
        product_code: product.product_code,
        product_name: product.product_name,
        base_uom_id: product.base_uom_id || product.uom?.uom_id || 1
      },
      uom_id: product.base_uom_id || product.uom?.uom_id,
      uom: product.uom
    };
    onUpdate(updates);
  };

  const handleQuantityChange = (quantity: number) => {
    const totalCost = quantity * detail.unit_cost;
    const newStock = detail.previous_stock - quantity;
    onUpdate({
      quantity,
      total_cost: totalCost,
      new_stock: newStock
    });
  };

  const handleUnitCostChange = (unitCost: number) => {
    const totalCost = detail.quantity * unitCost;
    onUpdate({
      unit_cost: unitCost,
      total_cost: totalCost
    });
  };

  const selectedProduct = detail.product ? {
    product_id: detail.product.product_id,
    product_code: detail.product.product_code,
    product_name: detail.product.product_name
  } : undefined;

  const selectedVariant = detail.variant_id ? {
    variant_id: detail.variant_id,
    variant_code: '',
    variant_name: ''
  } : undefined;

  return (
    <div className="grid grid-cols-12 gap-2 items-end p-4 border rounded-lg">
      <div className="col-span-3">
        <Label>Product</Label>
        <ProductSelector
          onSelect={handleProductSelect}
          selectedProduct={selectedProduct}
          selectedVariant={selectedVariant}
        />
      </div>
      <div className="col-span-1">
        <Label>Previous Stock</Label>
        <Input value={formatNumber(detail.previous_stock)} disabled />
      </div>
      <div className="col-span-1">
        <Label>Quantity</Label>
        <Input
          type="number"
          value={detail.quantity}
          onChange={(e) => handleQuantityChange(parseFloat(e.target.value) || 0)}
          min="0"
          step="0.001"
        />
      </div>
      <div className="col-span-1">
        <Label>UOM</Label>
        <Input value={detail.uom?.uom_name || ''} disabled />
      </div>
      <div className="col-span-1">
        <Label>Unit Cost</Label>
        <Input
          type="number"
          value={detail.unit_cost}
          onChange={(e) => handleUnitCostChange(parseFloat(e.target.value) || 0)}
          min="0"
          step="0.01"
        />
      </div>
      <div className="col-span-1">
        <Label>Total Cost</Label>
        <Input value={formatCurrency(detail.total_cost)} disabled />
      </div>
      <div className="col-span-1">
        <Label>New Stock</Label>
        <Input value={formatNumber(detail.new_stock)} disabled />
      </div>
      <div className="col-span-2">
        <Label>Bin Location</Label>
        <Select 
          value={detail.bin_id?.toString() || ''} 
          onValueChange={(value) => onUpdate({ bin_id: parseInt(value) })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select bin" />
          </SelectTrigger>
          <SelectContent>
            {storageBins.map((bin) => (
              <SelectItem key={bin.bin_id} value={bin.bin_id.toString()}>
                {bin.bin_code}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="col-span-1">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onRemove}
          disabled={!canRemove}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
