
import { supabase } from "@/integrations/supabase/client";

export interface UOMConversion {
  from_uom_id: number;
  to_uom_id: number;
  conversion_factor: number;
  product_id?: number;
}

export const getUOMConversions = async (productId: number): Promise<UOMConversion[]> => {
  try {
    const { data: product, error } = await supabase
      .from('products')
      .select(`
        base_uom_id,
        primary_uom_id,
        secondary_uom_id,
        primary_to_secondary_factor,
        secondary_to_base_factor
      `)
      .eq('product_id', productId)
      .single();

    if (error) throw error;

    const conversions: UOMConversion[] = [];

    // Base to Primary conversion
    if (product.primary_uom_id && product.primary_uom_id !== product.base_uom_id) {
      conversions.push({
        from_uom_id: product.base_uom_id,
        to_uom_id: product.primary_uom_id,
        conversion_factor: 1 / (product.primary_to_secondary_factor || 1),
        product_id: productId
      });
    }

    // Base to Secondary conversion
    if (product.secondary_uom_id && product.secondary_uom_id !== product.base_uom_id) {
      conversions.push({
        from_uom_id: product.base_uom_id,
        to_uom_id: product.secondary_uom_id,
        conversion_factor: 1 / (product.secondary_to_base_factor || 1),
        product_id: productId
      });
    }

    return conversions;
  } catch (error) {
    console.error('Error fetching UOM conversions:', error);
    return [];
  }
};

export const convertQuantity = (
  quantity: number,
  fromUomId: number,
  toUomId: number,
  conversions: UOMConversion[]
): number => {
  if (fromUomId === toUomId) return quantity;

  const conversion = conversions.find(
    c => c.from_uom_id === fromUomId && c.to_uom_id === toUomId
  );

  if (conversion) {
    return quantity * conversion.conversion_factor;
  }

  // Try reverse conversion
  const reverseConversion = conversions.find(
    c => c.from_uom_id === toUomId && c.to_uom_id === fromUomId
  );

  if (reverseConversion) {
    return quantity / reverseConversion.conversion_factor;
  }

  console.warn(`No conversion found from UOM ${fromUomId} to ${toUomId}`);
  return quantity;
};
