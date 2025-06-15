
import { Badge } from "@/components/ui/badge";
import type { CountDetail } from "@/types/physicalCount";

export const getVarianceBadge = (variance: number) => {
  if (variance === 0) return <Badge variant="secondary">No Variance</Badge>;
  if (variance > 0) return <Badge className="bg-green-500">+{variance}</Badge>;
  return <Badge variant="destructive">{variance}</Badge>;
};

export const getDecisionBadge = (decision: string) => {
  switch (decision) {
    case 'no_change': return <Badge variant="secondary">No Change</Badge>;
    case 'adjust_to_count': return <Badge className="bg-blue-500">Adjust</Badge>;
    case 'investigate': return <Badge variant="destructive">Investigate</Badge>;
    default: return <Badge variant="outline">{decision}</Badge>;
  }
};

export const updateCountDetail = (
  details: CountDetail[],
  id: string,
  field: keyof CountDetail,
  value: any
): CountDetail[] => {
  return details.map(detail => {
    if (detail.id === id) {
      const updated = { ...detail, [field]: value };
      
      // Calculate variance when system or counted quantity changes
      if (field === 'system_quantity' || field === 'counted_quantity') {
        updated.variance_quantity = updated.counted_quantity - updated.system_quantity;
        
        // Auto-set adjustment decision based on variance
        if (updated.variance_quantity === 0) {
          updated.adjustment_decision = 'no_change';
        } else if (Math.abs(updated.variance_quantity) > 10) {
          updated.adjustment_decision = 'investigate';
        } else {
          updated.adjustment_decision = 'adjust_to_count';
        }
      }
      
      // Calculate adjustment quantity based on decision
      if (field === 'adjustment_decision') {
        if (updated.adjustment_decision === 'adjust_to_count') {
          updated.adjustment_quantity = updated.variance_quantity;
        } else {
          updated.adjustment_quantity = 0;
        }
      }
      
      return updated;
    }
    return detail;
  });
};

export const createNewCountDetail = (): CountDetail => ({
  id: Date.now().toString(),
  product_id: 0,
  product_name: "",
  variant_id: undefined,
  uom_id: 1,
  system_quantity: 0,
  counted_quantity: 0,
  variance_quantity: 0,
  bin_id: undefined,
  reason_for_variance: "",
  adjustment_decision: 'no_change',
  adjustment_quantity: 0
});
