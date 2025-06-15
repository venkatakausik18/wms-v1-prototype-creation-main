
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { formatCurrency, formatNumber } from "@/utils/currency";
import type { TransferDetail } from "./types";

interface TransferSummarySectionProps {
  details: TransferDetail[];
  onSave: () => void;
  onSubmitForApproval: () => void;
  onShip: () => void;
  loading: boolean;
}

export const TransferSummarySection: React.FC<TransferSummarySectionProps> = ({
  details,
  onSave,
  onSubmitForApproval,
  onShip,
  loading
}) => {
  const totalItems = details.filter(d => d.product_id).length;
  const totalQuantity = details.reduce((sum, d) => sum + d.requested_quantity, 0);
  const totalValue = details.reduce((sum, d) => sum + d.total_cost, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Transfer Summary</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-4 text-sm mb-6">
          <div>
            <strong>Total Items:</strong> {totalItems}
          </div>
          <div>
            <strong>Total Quantity:</strong> {formatNumber(totalQuantity)}
          </div>
          <div>
            <strong>Total Value:</strong> {formatCurrency(totalValue)}
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Button onClick={onSave} disabled={loading} variant="outline">
            {loading ? <LoadingSpinner size="sm" className="mr-2" /> : null}
            Save Draft
          </Button>
          <Button onClick={onSubmitForApproval} disabled={loading}>
            {loading ? <LoadingSpinner size="sm" className="mr-2" /> : null}
            Submit for Approval
          </Button>
          <Button onClick={onShip} disabled={loading} variant="secondary">
            {loading ? <LoadingSpinner size="sm" className="mr-2" /> : null}
            Ship Transfer
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
