
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Calculator } from "lucide-react";
import type { SetupData, Warehouse } from "@/types/physicalCount";

interface PhysicalCountSetupProps {
  setupData: SetupData;
  setSetupData: (data: SetupData) => void;
  warehouses?: Warehouse[];
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
}

const PhysicalCountSetup: React.FC<PhysicalCountSetupProps> = ({
  setupData,
  setSetupData,
  warehouses,
  onSubmit,
  onCancel,
}) => {
  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Physical Stock Count - Setup</h1>
        <Button variant="outline" onClick={onCancel}>
          Back to Inventory
        </Button>
      </div>

      <form onSubmit={onSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Count Setup</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="count_date">Count Date</Label>
                <Input
                  id="count_date"
                  type="date"
                  value={setupData.count_date}
                  onChange={(e) => setSetupData({ ...setupData, count_date: e.target.value })}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="count_time">Count Time</Label>
                <Input
                  id="count_time"
                  type="time"
                  value={setupData.count_time}
                  onChange={(e) => setSetupData({ ...setupData, count_time: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="warehouse_id">Warehouse</Label>
                <Select 
                  value={setupData.warehouse_id} 
                  onValueChange={(value) => setSetupData({ ...setupData, warehouse_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select warehouse" />
                  </SelectTrigger>
                  <SelectContent>
                    {warehouses?.map((warehouse) => (
                      <SelectItem key={warehouse.warehouse_id} value={warehouse.warehouse_id.toString()}>
                        {warehouse.warehouse_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="count_type">Count Type</Label>
                <Select 
                  value={setupData.count_type} 
                  onValueChange={(value: "full" | "partial" | "cycle") => setSetupData({ ...setupData, count_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="full">Full Count</SelectItem>
                    <SelectItem value="partial">Partial Count</SelectItem>
                    <SelectItem value="cycle">Cycle Count</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="method">Method</Label>
                <Select 
                  value={setupData.method} 
                  onValueChange={(value: "full" | "partial" | "abc") => setSetupData({ ...setupData, method: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="full">Full</SelectItem>
                    <SelectItem value="partial">Partial</SelectItem>
                    <SelectItem value="abc">ABC Analysis</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">
            <Calculator className="h-4 w-4 mr-2" />
            Start Count
          </Button>
        </div>
      </form>
    </div>
  );
};

export default PhysicalCountSetup;
