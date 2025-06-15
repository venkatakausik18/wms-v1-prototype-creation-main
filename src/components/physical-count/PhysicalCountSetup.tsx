
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Calculator } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useWarehouses, useCreatePhysicalCount } from "@/hooks/usePhysicalCountData";

interface SetupData {
  count_date: string;
  count_time: string;
  warehouse_id: string;
  count_type: "full" | "partial" | "cycle";
  method: "full" | "partial" | "abc";
  scheduled_by: number;
  counted_by: number;
}

interface PhysicalCountSetupProps {
  onCountCreated: (countId: number, setupData: SetupData) => void;
  onCancel: () => void;
}

const PhysicalCountSetup: React.FC<PhysicalCountSetupProps> = ({ onCountCreated, onCancel }) => {
  const { toast } = useToast();
  const { warehouses } = useWarehouses();
  const { createCount, loading } = useCreatePhysicalCount();

  const [setupData, setSetupData] = useState<SetupData>({
    count_date: new Date().toISOString().split('T')[0],
    count_time: new Date().toTimeString().split(' ')[0].slice(0, 5),
    warehouse_id: "",
    count_type: "full",
    method: "full",
    scheduled_by: 1,
    counted_by: 1
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!setupData.warehouse_id) {
      toast({
        title: "Error",
        description: "Please select a warehouse.",
        variant: "destructive",
      });
      return;
    }

    try {
      const result = await createCount(setupData);
      toast({
        title: "Success",
        description: "Physical count setup created. You can now start counting.",
      });
      onCountCreated(result.count_id, setupData);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create count setup.",
        variant: "destructive",
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
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
        <Button type="submit" disabled={loading}>
          <Calculator className="h-4 w-4 mr-2" />
          {loading ? "Creating..." : "Start Count"}
        </Button>
      </div>
    </form>
  );
};

export default PhysicalCountSetup;
