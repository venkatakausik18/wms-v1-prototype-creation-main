
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { formatCurrency, formatNumber } from "@/utils/currency";
import type { StockDetail } from "./types";

interface StockSummarySectionProps {
  details: StockDetail[];
  onSave: () => void;
  loading: boolean;
}

export const StockSummarySection: React.FC<StockSummarySectionProps> = ({
  details,
  onSave,
  loading
}) => {
  const totalItems = details.filter(d => d.product_id).length;
  const totalQuantity = details.reduce((sum, d) => sum + d.quantity, 0);
  const totalValue = details.reduce((sum, d) => sum + d.total_cost, 0);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Summary</CardTitle>
        <Button onClick={onSave} disabled={loading}>
          {loading ? <LoadingSpinner size="sm" className="mr-2" /> : null}
          Save Entry
        </Button>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-4 text-sm">
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
      </CardContent>
    </Card>
  );
};
