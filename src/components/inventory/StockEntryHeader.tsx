import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { FormData, WarehouseData } from "./types";

interface StockEntryHeaderProps {
  formData: FormData;
  warehouses: WarehouseData[];
  onFormDataChange: (updates: Partial<FormData>) => void;
}

export const StockEntryHeader: React.FC<StockEntryHeaderProps> = ({
  formData,
  warehouses,
  onFormDataChange
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Transaction Details</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="txn_number">Transaction Number</Label>
          <Input
            id="txn_number"
            value={formData.txn_number}
            onChange={(e) => onFormDataChange({ txn_number: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="txn_type">Entry Type</Label>
          <Select 
            value={formData.txn_type} 
            onValueChange={(value: FormData['txn_type']) => onFormDataChange({ txn_type: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="sale_out">Sales Out</SelectItem>
              <SelectItem value="transfer_out">Transfer Out</SelectItem>
              <SelectItem value="adjustment_out">Adjustment Out</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="warehouse_id">Warehouse</Label>
          <Select 
            value={formData.warehouse_id} 
            onValueChange={(value) => onFormDataChange({ warehouse_id: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select warehouse" />
            </SelectTrigger>
            <SelectContent>
              {warehouses.map((warehouse) => (
                <SelectItem key={warehouse.warehouse_id} value={warehouse.warehouse_id.toString()}>
                  {warehouse.warehouse_code} - {warehouse.warehouse_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="txn_date">Date</Label>
          <Input
            id="txn_date"
            type="date"
            value={formData.txn_date}
            onChange={(e) => onFormDataChange({ txn_date: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="txn_time">Time</Label>
          <Input
            id="txn_time"
            type="time"
            value={formData.txn_time}
            onChange={(e) => onFormDataChange({ txn_time: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="reference_document">Reference Document</Label>
          <Input
            id="reference_document"
            value={formData.reference_document}
            onChange={(e) => onFormDataChange({ reference_document: e.target.value })}
            placeholder="SO-001, Invoice-123, etc."
          />
        </div>
        <div className="md:col-span-3">
          <Label htmlFor="remarks">Remarks</Label>
          <Textarea
            id="remarks"
            value={formData.remarks}
            onChange={(e) => onFormDataChange({ remarks: e.target.value })}
            placeholder="Any additional notes or instructions..."
          />
        </div>
      </CardContent>
    </Card>
  );
};
