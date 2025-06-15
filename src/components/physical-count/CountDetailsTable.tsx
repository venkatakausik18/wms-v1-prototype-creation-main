
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2 } from "lucide-react";
import { SimpleProduct, SimpleStorageBin } from "@/hooks/usePhysicalCountData";

export interface CountDetail {
  id: string;
  product_id: number;
  product_name: string;
  variant_id?: number;
  uom_id: number;
  system_quantity: number;
  counted_quantity: number;
  variance_quantity: number;
  bin_id?: number;
  reason_for_variance: string;
  adjustment_decision: 'no_change' | 'adjust_to_count' | 'investigate';
  adjustment_quantity: number;
}

interface CountDetailsTableProps {
  details: CountDetail[];
  products: SimpleProduct[];
  bins: SimpleStorageBin[];
  onAddDetail: () => void;
  onRemoveDetail: (id: string) => void;
  onUpdateDetail: (id: string, field: keyof CountDetail, value: any) => void;
}

const CountDetailsTable: React.FC<CountDetailsTableProps> = ({
  details,
  products,
  bins,
  onAddDetail,
  onRemoveDetail,
  onUpdateDetail
}) => {
  const getVarianceBadge = (variance: number) => {
    if (variance === 0) return <Badge variant="secondary">No Variance</Badge>;
    if (variance > 0) return <Badge className="bg-green-500">+{variance}</Badge>;
    return <Badge variant="destructive">{variance}</Badge>;
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Items to Count</h3>
        <Button type="button" onClick={onAddDetail} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Item
        </Button>
      </div>

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
    </div>
  );
};

export default CountDetailsTable;
