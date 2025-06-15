
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { TransferItemRow } from "./TransferItemRow";
import type { LocalTransferDetail, LocalStorageBinData } from "./types-local";

interface TransferItemsSectionProps {
  details: LocalTransferDetail[];
  storageBins: LocalStorageBinData[];
  fromWarehouseId: string;
  toWarehouseId: string;
  onUpdateDetails: (newDetails: LocalTransferDetail[]) => void;
  onAddItem: () => void;
}

export const TransferItemsSection: React.FC<TransferItemsSectionProps> = ({
  details,
  storageBins,
  fromWarehouseId,
  toWarehouseId,
  onUpdateDetails,
  onAddItem
}) => {
  const updateDetail = (index: number, updates: Partial<LocalTransferDetail>) => {
    const newDetails = details.map((detail, i) => 
      i === index ? { ...detail, ...updates } : detail
    );
    onUpdateDetails(newDetails);
  };

  const removeDetail = (index: number) => {
    const newDetails = details.filter((_, i) => i !== index);
    onUpdateDetails(newDetails);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Transfer Items</CardTitle>
        <Button onClick={onAddItem} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Add Item
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {details.map((detail, index) => (
          <TransferItemRow
            key={index}
            detail={detail}
            index={index}
            storageBins={storageBins}
            fromWarehouseId={fromWarehouseId}
            toWarehouseId={toWarehouseId}
            onUpdate={(updates) => updateDetail(index, updates)}
            onRemove={() => removeDetail(index)}
            canRemove={details.length > 1}
          />
        ))}
        
        {details.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No items added yet. Click "Add Item" to start building your transfer.
          </div>
        )}
      </CardContent>
    </Card>
  );
};
