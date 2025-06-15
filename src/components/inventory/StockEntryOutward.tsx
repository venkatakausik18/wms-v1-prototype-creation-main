
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
  const [activeTab, setActiveTab] = useState("entry");

  const {
    formData,
    details,
    loading,
    warehouses,
    storageBins,
    updateFormData,
    updateDetails,
    addNewItem,
    removeItem,
    handleSave,
    generatePickList
  } = useStockEntryForm(id);

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
        formData={formData}
        warehouses={warehouses}
        onFormDataChange={updateFormData}
      />

      <StockItemsSection
        details={details}
        storageBins={storageBins}
        onDetailsChange={updateDetails}
        onAddItem={addNewItem}
        onRemoveItem={removeItem}
        onGeneratePickList={generatePickList}
        warehouseId={formData.warehouse_id}
      />

      <StockSummarySection
        details={details}
        onSave={handleSave}
        loading={loading}
      />
    </div>
  );
};

export default StockEntryOutward;
