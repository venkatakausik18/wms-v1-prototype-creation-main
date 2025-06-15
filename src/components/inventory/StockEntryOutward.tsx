
import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { StockEntryHeader } from "./StockEntryHeader";
import { StockItemsSection } from "./StockItemsSection";
import { StockSummarySection } from "./StockSummarySection";
import { useStockEntryForm } from "./hooks/useStockEntryForm";

const StockEntryOutward = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { state, actions } = useStockEntryForm(id);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => navigate('/inventory/stock-entry')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Stock Entry (Outward)</h1>
            <p className="text-muted-foreground">Process outgoing inventory</p>
          </div>
        </div>
      </div>

      <StockEntryHeader
        formData={state.formData}
        warehouses={state.warehouses}
        onFormDataChange={actions.updateFormData}
      />

      <StockItemsSection
        details={state.details}
        storageBins={state.storageBins}
        onDetailsChange={actions.updateDetails}
        onAddItem={actions.addNewItem}
        onRemoveItem={actions.removeItem}
        onGeneratePickList={actions.generatePickList}
        warehouseId={state.formData.warehouse_id}
      />

      <StockSummarySection
        details={state.details}
        onSave={actions.handleSave}
        loading={state.loading}
      />
    </div>
  );
};

export default StockEntryOutward;
