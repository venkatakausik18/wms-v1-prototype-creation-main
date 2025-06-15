
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
import { Search, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface Product {
  product_id: number;
  product_code: string;
  product_name: string;
  base_uom_id: number;
  variants?: ProductVariant[];
  uom?: { uom_id: number; uom_name: string };
}

interface ProductVariant {
  variant_id: number;
  variant_code: string;
  variant_name: string;
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
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);

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
    } finally {
      setIsLoading(false);
    }
  };

  const fetchVariants = async (productId: number) => {
    try {
      const { data, error } = await supabase
        .from('product_variants')
        .select('variant_id, variant_code, variant_name')
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

  const filteredProducts = products.filter(product =>
    product.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.product_code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleProductSelect = (product: Product) => {
    setSelectedProductId(product.product_id);
    if (variants.length === 0) {
      onSelect(product);
      setOpen(false);
    }
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
            Search and select a product for the stock entry
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
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
                      onSelect={() => {
                        fetchVariants(product.product_id).then(() => {
                          if (variants.length === 0) {
                            handleDirectSelect(product);
                          } else {
                            handleProductSelect(product);
                          }
                        });
                      }}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          selectedProduct?.product_id === product.product_id ? "opacity-100" : "opacity-0"
                        )}
                      />
                      <div>
                        <div className="font-medium">{product.product_code}</div>
                        <div className="text-sm text-muted-foreground">{product.product_name}</div>
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
                        {variant.variant_code} - {variant.variant_name}
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
