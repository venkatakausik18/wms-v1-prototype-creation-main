
import React from "react";
import { useParams } from "react-router-dom";
import { useStockTransferForm } from "@/components/inventory/transfer/hooks/useStockTransferForm";
import { TransferHeader } from "@/components/inventory/transfer/TransferHeader";
import { TransferItemsSection } from "@/components/inventory/transfer/TransferItemsSection";
import { TransferSummarySection } from "@/components/inventory/transfer/TransferSummarySection";

const StockTransferEdit: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  
  const {
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
  } = useStockTransferForm(id);

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">
          {id === 'new' ? 'New Stock Transfer' : 'Edit Stock Transfer'}
        </h1>
      </div>

      <TransferHeader
        formData={formData}
        warehouses={warehouses}
        onUpdate={updateFormData}
      />

      <TransferItemsSection
        details={details}
        storageBins={storageBins}
        fromWarehouseId={formData.from_warehouse_id}
        toWarehouseId={formData.to_warehouse_id}
        onUpdateDetails={updateDetails}
        onAddItem={addNewItem}
      />

      <TransferSummarySection
        details={details}
        onSave={handleSave}
        onSubmitForApproval={handleSubmitForApproval}
        onShip={handleShip}
        loading={loading}
      />
    </div>
  );
};

export default StockTransferEdit;
