
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, List } from "lucide-react";
import { StockItemRow } from "./StockItemRow";
import type { StockDetail, StorageBinData } from "./types";

interface StockItemsSectionProps {
  details: StockDetail[];
  storageBins: StorageBinData[];
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
