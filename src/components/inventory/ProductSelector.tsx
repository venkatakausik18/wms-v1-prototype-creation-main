
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Search, Check, Scan } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface Product {
  product_id: number;
  product_code: string;
  product_name: string;
  base_uom_id: number;
  barcode?: string;
  variants?: ProductVariant[];
  uom?: { uom_id: number; uom_name: string };
}

interface ProductVariant {
  variant_id: number;
  variant_code: string;
  variant_name: string;
  barcode?: string;
}

interface ProductSelectorProps {
  onSelect: (product: Product, variant?: ProductVariant) => void;
  selectedProduct?: Product;
  selectedVariant?: ProductVariant;
}

const ProductSelector = ({ onSelect, selectedProduct, selectedVariant }: ProductSelectorProps) => {
  const [open, setOpen] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [barcodeSearch, setBarcodeSearch] = useState("");
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showBarcodeInput, setShowBarcodeInput] = useState(false);

  useEffect(() => {
    if (open) {
      fetchProducts();
    }
  }, [open]);

  useEffect(() => {
    if (selectedProductId) {
      fetchVariants(selectedProductId);
    } else {
      setVariants([]);
    }
  }, [selectedProductId]);

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          product_id,
          product_code,
          product_name,
          base_uom_id,
          barcode,
          units_of_measure!base_uom_id(uom_id, uom_name)
        `)
        .eq('is_active', true)
        .order('product_name');

      if (error) throw error;
      
      const transformedData = data?.map(product => ({
        ...product,
        uom: (product.units_of_measure as any)
      })) || [];
      
      setProducts(transformedData);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Failed to fetch products');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchVariants = async (productId: number) => {
    try {
      const { data, error } = await supabase
        .from('product_variants')
        .select('variant_id, variant_code, variant_name, barcode')
        .eq('product_id', productId)
        .eq('is_active', true)
        .order('variant_name');

      if (error) throw error;
      setVariants(data || []);
    } catch (error) {
      console.error('Error fetching variants:', error);
      setVariants([]);
    }
  };

  const searchByBarcode = async (barcode: string) => {
    if (!barcode.trim()) return;

    setIsLoading(true);
    try {
      // Search products by barcode
      const { data: productData, error: productError } = await supabase
        .from('products')
        .select(`
          product_id,
          product_code,
          product_name,
          base_uom_id,
          barcode,
          units_of_measure!base_uom_id(uom_id, uom_name)
        `)
        .eq('barcode', barcode)
        .eq('is_active', true)
        .maybeSingle();

      if (productError && productError.code !== 'PGRST116') throw productError;

      if (productData) {
        const product = {
          ...productData,
          uom: (productData.units_of_measure as any)
        };
        onSelect(product);
        setOpen(false);
        setBarcodeSearch("");
        toast.success('Product found by barcode');
        return;
      }

      // Search variants by barcode
      const { data: variantData, error: variantError } = await supabase
        .from('product_variants')
        .select(`
          variant_id,
          variant_code,
          variant_name,
          barcode,
          product_id,
          products!product_id(
            product_id,
            product_code,
            product_name,
            base_uom_id,
            units_of_measure!base_uom_id(uom_id, uom_name)
          )
        `)
        .eq('barcode', barcode)
        .eq('is_active', true)
        .maybeSingle();

      if (variantError && variantError.code !== 'PGRST116') throw variantError;

      if (variantData) {
        const product = {
          ...(variantData.products as any),
          uom: ((variantData.products as any).units_of_measure as any)
        };
        const variant = {
          variant_id: variantData.variant_id,
          variant_code: variantData.variant_code,
          variant_name: variantData.variant_name,
          barcode: variantData.barcode
        };
        onSelect(product, variant);
        setOpen(false);
        setBarcodeSearch("");
        toast.success('Product variant found by barcode');
        return;
      }

      toast.error('No product found with this barcode');
    } catch (error) {
      console.error('Error searching by barcode:', error);
      toast.error('Error searching by barcode');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredProducts = products.filter(product =>
    product.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.product_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (product.barcode && product.barcode.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleProductSelect = (product: Product) => {
    setSelectedProductId(product.product_id);
    fetchVariants(product.product_id).then(() => {
      if (variants.length === 0) {
        onSelect(product);
        setOpen(false);
      }
    });
  };

  const handleVariantSelect = (variant: ProductVariant) => {
    const product = products.find(p => p.product_id === selectedProductId);
    if (product) {
      onSelect(product, variant);
      setOpen(false);
    }
  };

  const handleDirectSelect = (product: Product) => {
    onSelect(product);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full justify-start">
          <Search className="mr-2 h-4 w-4" />
          {selectedProduct 
            ? `${selectedProduct.product_code} - ${selectedProduct.product_name}${selectedVariant ? ` (${selectedVariant.variant_name})` : ''}`
            : "Select Product..."
          }
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Select Product</DialogTitle>
          <DialogDescription>
            Search by name, code, or scan barcode to select a product
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Barcode Search */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowBarcodeInput(!showBarcodeInput)}
            >
              <Scan className="h-4 w-4 mr-2" />
              Barcode
            </Button>
            {showBarcodeInput && (
              <div className="flex gap-2 flex-1">
                <Input
                  placeholder="Scan or enter barcode"
                  value={barcodeSearch}
                  onChange={(e) => setBarcodeSearch(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      searchByBarcode(barcodeSearch);
                    }
                  }}
                />
                <Button 
                  size="sm" 
                  onClick={() => searchByBarcode(barcodeSearch)}
                  disabled={!barcodeSearch.trim() || isLoading}
                >
                  Search
                </Button>
              </div>
            )}
          </div>

          {!selectedProductId ? (
            <Command>
              <CommandInput 
                placeholder="Search products..." 
                value={searchTerm}
                onValueChange={setSearchTerm}
              />
              <CommandList>
                <CommandEmpty>
                  {isLoading ? "Loading products..." : "No products found."}
                </CommandEmpty>
                <CommandGroup>
                  {filteredProducts.map((product) => (
                    <CommandItem
                      key={product.product_id}
                      onSelect={() => handleProductSelect(product)}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          selectedProduct?.product_id === product.product_id ? "opacity-100" : "opacity-0"
                        )}
                      />
                      <div className="flex-1">
                        <div className="font-medium">{product.product_code}</div>
                        <div className="text-sm text-muted-foreground">{product.product_name}</div>
                        {product.barcode && (
                          <div className="text-xs text-muted-foreground">Barcode: {product.barcode}</div>
                        )}
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          ) : (
            <div className="space-y-4">
              <div>
                <Label>Selected Product</Label>
                <div className="text-sm p-2 bg-muted rounded">
                  {products.find(p => p.product_id === selectedProductId)?.product_name}
                </div>
              </div>
              
              {variants.length > 0 && (
                <div>
                  <Label>Select Variant</Label>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {variants.map((variant) => (
                      <Button
                        key={variant.variant_id}
                        variant="outline"
                        className="w-full justify-start"
                        onClick={() => handleVariantSelect(variant)}
                      >
                        <div className="text-left">
                          <div>{variant.variant_code} - {variant.variant_name}</div>
                          {variant.barcode && (
                            <div className="text-xs text-muted-foreground">Barcode: {variant.barcode}</div>
                          )}
                        </div>
                      </Button>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setSelectedProductId(null);
                    setVariants([]);
                  }}
                  className="flex-1"
                >
                  Back
                </Button>
                {variants.length === 0 && (
                  <Button 
                    onClick={() => {
                      const product = products.find(p => p.product_id === selectedProductId);
                      if (product) handleDirectSelect(product);
                    }}
                    className="flex-1"
                  >
                    Select
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProductSelector;
