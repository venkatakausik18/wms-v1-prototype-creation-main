
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, Save } from "lucide-react";
import { getVarianceBadge, getDecisionBadge } from "@/utils/physicalCountUtils";
import type { CountDetail, SetupData, Warehouse, Product, StorageBin } from "@/types/physicalCount";

interface PhysicalCountEntryProps {
  countId: number | null;
  setupData: SetupData;
  details: CountDetail[];
  warehouses?: Warehouse[];
  products?: Product[];
  bins?: StorageBin[];
  onAddDetail: () => void;
  onRemoveDetail: (id: string) => void;
  onUpdateDetail: (id: string, field: keyof CountDetail, value: any) => void;
  onSubmit: (e: React.FormEvent) => void;
  onBackToSetup: () => void;
  isSubmitting: boolean;
}

const PhysicalCountEntry: React.FC<PhysicalCountEntryProps> = ({
  countId,
  setupData,
  details,
  warehouses,
  products,
  bins,
  onAddDetail,
  onRemoveDetail,
  onUpdateDetail,
  onSubmit,
  onBackToSetup,
  isSubmitting,
}) => {
  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Physical Stock Count - Entry</h1>
        <Button variant="outline" onClick={onBackToSetup}>
          Back to Setup
        </Button>
      </div>

      <form onSubmit={onSubmit} className="space-y-6">
        {/* Count Info */}
        <Card>
          <CardHeader>
            <CardTitle>Count Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-4 text-sm">
              <div>
                <Label>Count ID</Label>
                <div className="font-medium">{countId}</div>
              </div>
              <div>
                <Label>Warehouse</Label>
                <div className="font-medium">
                  {warehouses?.find(w => w.warehouse_id.toString() === setupData.warehouse_id)?.warehouse_name}
                </div>
              </div>
              <div>
                <Label>Count Type</Label>
                <div className="font-medium capitalize">{setupData.count_type}</div>
              </div>
              <div>
                <Label>Method</Label>
                <div className="font-medium capitalize">{setupData.method}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Items Count Grid */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Items to Count</CardTitle>
              <Button type="button" onClick={onAddDetail} className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Add Item
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {details.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Bin</TableHead>
                    <TableHead>System Qty</TableHead>
                    <TableHead>Counted Qty</TableHead>
                    <TableHead>Variance</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Decision</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {details.map((detail) => (
                    <TableRow key={detail.id}>
                      <TableCell>
                        <Select
                          value={detail.product_id.toString()}
                          onValueChange={(value) => {
                            const product = products?.find(p => p.product_id.toString() === value);
                            onUpdateDetail(detail.id, 'product_id', parseInt(value));
                            onUpdateDetail(detail.id, 'product_name', product?.product_name || '');
                          }}
                        >
                          <SelectTrigger className="w-[200px]">
                            <SelectValue placeholder="Select product" />
                          </SelectTrigger>
                          <SelectContent>
                            {products?.map((product) => (
                              <SelectItem key={product.product_id} value={product.product_id.toString()}>
                                {product.product_code} - {product.product_name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Select
                          value={detail.bin_id?.toString() || ""}
                          onValueChange={(value) => onUpdateDetail(detail.id, 'bin_id', value ? parseInt(value) : undefined)}
                        >
                          <SelectTrigger className="w-24">
                            <SelectValue placeholder="Bin" />
                          </SelectTrigger>
                          <SelectContent>
                            {bins?.map((bin) => (
                              <SelectItem key={bin.bin_id} value={bin.bin_id.toString()}>
                                {bin.bin_code}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          value={detail.system_quantity}
                          onChange={(e) => onUpdateDetail(detail.id, 'system_quantity', parseFloat(e.target.value) || 0)}
                          className="w-20"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          value={detail.counted_quantity}
                          onChange={(e) => onUpdateDetail(detail.id, 'counted_quantity', parseFloat(e.target.value) || 0)}
                          className="w-20"
                        />
                      </TableCell>
                      <TableCell>
                        {getVarianceBadge(detail.variance_quantity)}
                      </TableCell>
                      <TableCell>
                        <Input
                          value={detail.reason_for_variance}
                          onChange={(e) => onUpdateDetail(detail.id, 'reason_for_variance', e.target.value)}
                          className="w-32"
                          placeholder="Reason"
                        />
                      </TableCell>
                      <TableCell>
                        <Select
                          value={detail.adjustment_decision}
                          onValueChange={(value: 'no_change' | 'adjust_to_count' | 'investigate') => 
                            onUpdateDetail(detail.id, 'adjustment_decision', value)
                          }
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="no_change">No Change</SelectItem>
                            <SelectItem value="adjust_to_count">Adjust</SelectItem>
                            <SelectItem value="investigate">Investigate</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={() => onRemoveDetail(detail.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No items added. Click "Add Item" to get started.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Summary */}
        {details.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Count Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 gap-4">
                <div>
                  <Label>Total Items</Label>
                  <div className="font-medium text-lg">{details.length}</div>
                </div>
                <div>
                  <Label>Items with Variance</Label>
                  <div className="font-medium text-lg">
                    {details.filter(d => d.variance_quantity !== 0).length}
                  </div>
                </div>
                <div>
                  <Label>Items to Adjust</Label>
                  <div className="font-medium text-lg">
                    {details.filter(d => d.adjustment_decision === 'adjust_to_count').length}
                  </div>
                </div>
                <div>
                  <Label>Items to Investigate</Label>
                  <div className="font-medium text-lg">
                    {details.filter(d => d.adjustment_decision === 'investigate').length}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Submit Button */}
        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={onBackToSetup}>
            Back to Setup
          </Button>
          <Button type="submit" disabled={isSubmitting || details.length === 0}>
            <Save className="h-4 w-4 mr-2" />
            {isSubmitting ? "Completing Count..." : "Complete Count"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default PhysicalCountEntry;
