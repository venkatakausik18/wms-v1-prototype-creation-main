
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, List } from "lucide-react";
import { StockItemRow } from "./StockItemRow";

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

interface StorageBin {
  bin_id: number;
  bin_code: string;
}

interface StockItemsSectionProps {
  details: StockDetail[];
  storageBins: StorageBin[];
  onDetailsChange: (newDetails: StockDetail[]) => void;
  onAddItem: () => void;
  onRemoveItem: (index: number) => void;
  onGeneratePickList: () => void;
  warehouseId: string;
}

export const StockItemsSection: React.FC<StockItemsSectionProps> = ({
  details,
  storageBins,
  onDetailsChange,
  onAddItem,
  onRemoveItem,
  onGeneratePickList,
  warehouseId
}) => {
  const updateItem = (index: number, updates: Partial<StockDetail>) => {
    const newDetails = [...details];
    newDetails[index] = { ...newDetails[index], ...updates };
    onDetailsChange(newDetails);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Items</CardTitle>
        <div className="flex gap-2">
          <Button onClick={onGeneratePickList} variant="outline" size="sm">
            <List className="h-4 w-4 mr-2" />
            Generate Pick List
          </Button>
          <Button onClick={onAddItem} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Item
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {details.map((detail, index) => (
            <StockItemRow
              key={index}
              detail={detail}
              index={index}
              storageBins={storageBins}
              warehouseId={warehouseId}
              onUpdate={(updates) => updateItem(index, updates)}
              onRemove={() => onRemoveItem(index)}
              canRemove={details.length > 1}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
