
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import type { TransferFormData, TransportMethod } from "./types";
import type { WarehouseData } from "../types";

interface TransferHeaderProps {
  formData: TransferFormData;
  warehouses: WarehouseData[];
  onUpdate: (updates: Partial<TransferFormData>) => void;
}

export const TransferHeader: React.FC<TransferHeaderProps> = ({
  formData,
  warehouses,
  onUpdate
}) => {
  const transportMethods: TransportMethod[] = ['internal', 'courier', 'truck', 'rail', 'air', 'sea'];
  const priorityLevels = ['low', 'normal', 'high', 'urgent'];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Transfer Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="transfer-number">Transfer Number</Label>
            <Input
              id="transfer-number"
              value={formData.transfer_number}
              onChange={(e) => onUpdate({ transfer_number: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="transfer-date">Transfer Date</Label>
            <Input
              id="transfer-date"
              type="date"
              value={formData.transfer_date}
              onChange={(e) => onUpdate({ transfer_date: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="transfer-time">Transfer Time</Label>
            <Input
              id="transfer-time"
              type="time"
              value={formData.transfer_time}
              onChange={(e) => onUpdate({ transfer_time: e.target.value })}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="from-warehouse">From Warehouse</Label>
            <Select 
              value={formData.from_warehouse_id} 
              onValueChange={(value) => onUpdate({ from_warehouse_id: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select source warehouse" />
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
            <Label htmlFor="to-warehouse">To Warehouse</Label>
            <Select 
              value={formData.to_warehouse_id} 
              onValueChange={(value) => onUpdate({ to_warehouse_id: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select destination warehouse" />
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
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="priority">Priority Level</Label>
            <Select 
              value={formData.priority_level} 
              onValueChange={(value) => onUpdate({ priority_level: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select priority" />
              </SelectTrigger>
              <SelectContent>
                {priorityLevels.map((priority) => (
                  <SelectItem key={priority} value={priority}>
                    {priority.charAt(0).toUpperCase() + priority.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="transport-method">Transport Method</Label>
            <Select 
              value={formData.transport_method} 
              onValueChange={(value) => onUpdate({ transport_method: value as TransportMethod })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select transport method" />
              </SelectTrigger>
              <SelectContent>
                {transportMethods.map((method) => (
                  <SelectItem key={method} value={method}>
                    {method.charAt(0).toUpperCase() + method.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="expected-delivery">Expected Delivery Date</Label>
            <Input
              id="expected-delivery"
              type="date"
              value={formData.expected_delivery_date}
              onChange={(e) => onUpdate({ expected_delivery_date: e.target.value })}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="carrier">Carrier Name</Label>
            <Input
              id="carrier"
              value={formData.carrier_name}
              onChange={(e) => onUpdate({ carrier_name: e.target.value })}
              placeholder="Enter carrier name"
            />
          </div>
          <div>
            <Label htmlFor="tracking">Tracking Number</Label>
            <Input
              id="tracking"
              value={formData.tracking_number}
              onChange={(e) => onUpdate({ tracking_number: e.target.value })}
              placeholder="Enter tracking number"
            />
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="temperature-monitored"
              checked={formData.temperature_monitored}
              onCheckedChange={(checked) => onUpdate({ temperature_monitored: !!checked })}
            />
            <Label htmlFor="temperature-monitored">Temperature Monitored</Label>
          </div>

          {formData.temperature_monitored && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="temp-min">Min Temperature (°C)</Label>
                <Input
                  id="temp-min"
                  type="number"
                  value={formData.temperature_range_min}
                  onChange={(e) => onUpdate({ temperature_range_min: e.target.value })}
                  placeholder="0"
                />
              </div>
              <div>
                <Label htmlFor="temp-max">Max Temperature (°C)</Label>
                <Input
                  id="temp-max"
                  type="number"
                  value={formData.temperature_range_max}
                  onChange={(e) => onUpdate({ temperature_range_max: e.target.value })}
                  placeholder="25"
                />
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="special-instructions">Special Instructions</Label>
            <Textarea
              id="special-instructions"
              value={formData.special_instructions}
              onChange={(e) => onUpdate({ special_instructions: e.target.value })}
              placeholder="Enter special handling instructions"
              rows={3}
            />
          </div>
          <div>
            <Label htmlFor="internal-notes">Internal Notes</Label>
            <Textarea
              id="internal-notes"
              value={formData.internal_notes}
              onChange={(e) => onUpdate({ internal_notes: e.target.value })}
              placeholder="Enter internal notes"
              rows={3}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
