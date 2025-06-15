
import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Trash2 } from "lucide-react";
import ProductSelector from "../ProductSelector";
import { formatCurrency, formatNumber } from "@/utils/currency";
import type { TransferDetail } from "./types";
import type { StorageBinData, ProductVariant, ProductData, UomData } from "../types";

interface TransferItemRowProps {
  detail: TransferDetail;
  index: number;
  storageBins: StorageBinData[];
  fromWarehouseId: string;
  toWarehouseId: string;
  onUpdate: (updates: Partial<TransferDetail>) => void;
  onRemove: () => void;
  canRemove: boolean;
}

export const TransferItemRow: React.FC<TransferItemRowProps> = ({
  detail,
  index,
  storageBins,
  fromWarehouseId,
  toWarehouseId,
  onUpdate,
  onRemove,
  canRemove
}) => {
  const [productData, setProductData] = React.useState<ProductData | undefined>();
  const [uomData, setUomData] = React.useState<UomData | undefined>();

  const handleProductSelect = (product: any, variant?: ProductVariant) => {
    const updates: Partial<TransferDetail> = {
      product_id: product.product_id,
      variant_id: variant?.variant_id,
      uom_id: product.base_uom_id || product.uom?.uom_id
    };
    
    setProductData({
      product_id: product.product_id,
      product_code: product.product_code,
      product_name: product.product_name,
      base_uom_id: product.base_uom_id || product.uom?.uom_id || 1
    });
    
    setUomData(product.uom);
    
    onUpdate(updates);
  };

  const handleQuantityChange = (quantity: number) => {
    const totalCost = quantity * detail.unit_cost;
    onUpdate({
      requested_quantity: quantity,
      total_cost: totalCost
    });
  };

  const handleUnitCostChange = (unitCost: number) => {
    const totalCost = detail.requested_quantity * unitCost;
    onUpdate({
      unit_cost: unitCost,
      total_cost: totalCost
    });
  };

  const selectedProduct = productData ? {
    product_id: productData.product_id,
    product_code: productData.product_code,
    product_name: productData.product_name,
    base_uom_id: productData.base_uom_id
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
        <Label>Quantity</Label>
        <Input
          type="number"
          value={detail.requested_quantity}
          onChange={(e) => handleQuantityChange(parseFloat(e.target.value) || 0)}
          min="0"
          step="0.001"
        />
      </div>
      <div className="col-span-1">
        <Label>UOM</Label>
        <Input value={uomData?.uom_name || ''} disabled />
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
        <Label>From Bin</Label>
        <Select 
          value={detail.from_bin_id?.toString() || ''} 
          onValueChange={(value) => onUpdate({ from_bin_id: parseInt(value) })}
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
        <Label>To Bin</Label>
        <Select 
          value={detail.to_bin_id?.toString() || ''} 
          onValueChange={(value) => onUpdate({ to_bin_id: parseInt(value) })}
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
      <div className="col-span-2">
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Checkbox
              id={`temp-${index}`}
              checked={detail.temperature_sensitive}
              onCheckedChange={(checked) => onUpdate({ temperature_sensitive: !!checked })}
            />
            <Label htmlFor={`temp-${index}`} className="text-xs">Temp Sensitive</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id={`fragile-${index}`}
              checked={detail.fragile}
              onCheckedChange={(checked) => onUpdate({ fragile: !!checked })}
            />
            <Label htmlFor={`fragile-${index}`} className="text-xs">Fragile</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id={`hazardous-${index}`}
              checked={detail.hazardous}
              onCheckedChange={(checked) => onUpdate({ hazardous: !!checked })}
            />
            <Label htmlFor={`hazardous-${index}`} className="text-xs">Hazardous</Label>
          </div>
        </div>
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
