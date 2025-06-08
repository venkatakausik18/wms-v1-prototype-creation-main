
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Plus, Edit, Trash2, Download, Upload, QrCode, MoreHorizontal } from "lucide-react";
import { toast } from "sonner";
import Layout from "@/components/Layout";

interface Product {
  product_id: number;
  product_code: string;
  product_name: string;
  mrp: number;
  opening_stock: number;
  is_active: boolean;
  brand?: { brand_name: string };
  category?: { category_name: string };
}

interface Brand {
  brand_id: number;
  brand_name: string;
}

interface Category {
  category_id: number;
  category_name: string;
}

const ProductList = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBrand, setSelectedBrand] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedProducts, setSelectedProducts] = useState<number[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isBulkUpdating, setBulkUpdating] = useState(false);
  const itemsPerPage = 20;

  useEffect(() => {
    if (user) {
      fetchProducts();
      fetchBrands();
      fetchCategories();
    }
  }, [user, currentPage, searchTerm, selectedBrand, selectedCategory, statusFilter]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('products')
        .select(`
          product_id,
          product_code,
          product_name,
          mrp,
          opening_stock,
          is_active,
          brands(brand_name),
          categories(category_name)
        `)
        .eq('company_id', 1)
        .order('product_code');

      // Apply filters
      if (searchTerm) {
        query = query.or(`product_code.ilike.%${searchTerm}%,product_name.ilike.%${searchTerm}%`);
      }

      if (selectedBrand !== "all") {
        query = query.eq('brand_id', parseInt(selectedBrand));
      }

      if (selectedCategory !== "all") {
        query = query.eq('category_id', parseInt(selectedCategory));
      }

      if (statusFilter !== "all") {
        query = query.eq('is_active', statusFilter === "active");
      }

      // Get total count for pagination
      const { count } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .eq('company_id', 1);

      // Apply pagination
      const from = (currentPage - 1) * itemsPerPage;
      const to = from + itemsPerPage - 1;
      query = query.range(from, to);

      const { data, error } = await query;

      if (error) throw error;

      setProducts(data || []);
      setTotalPages(Math.ceil((count || 0) / itemsPerPage));
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  const fetchBrands = async () => {
    try {
      const { data, error } = await supabase
        .from('brands')
        .select('brand_id, brand_name')
        .eq('company_id', 1)
        .eq('is_active', true)
        .order('brand_name');

      if (error) throw error;
      setBrands(data || []);
    } catch (error) {
      console.error('Error fetching brands:', error);
    }
  };

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('category_id, category_name')
        .eq('company_id', 1)
        .eq('is_active', true)
        .order('category_name');

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleSelectProduct = (productId: number, checked: boolean) => {
    if (checked) {
      setSelectedProducts(prev => [...prev, productId]);
    } else {
      setSelectedProducts(prev => prev.filter(id => id !== productId));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedProducts(products.map(p => p.product_id));
    } else {
      setSelectedProducts([]);
    }
  };

  const handleBulkStatusUpdate = async (isActive: boolean) => {
    if (selectedProducts.length === 0) {
      toast.error('Please select products to update');
      return;
    }

    setBulkUpdating(true);
    try {
      const { error } = await supabase
        .from('products')
        .update({ is_active: isActive })
        .in('product_id', selectedProducts);

      if (error) throw error;

      toast.success(`${selectedProducts.length} products ${isActive ? 'activated' : 'deactivated'}`);
      setSelectedProducts([]);
      fetchProducts();
    } catch (error) {
      console.error('Error updating products:', error);
      toast.error('Failed to update products');
    } finally {
      setBulkUpdating(false);
    }
  };

  const handleExportCSV = () => {
    const csvData = products.map(product => ({
      'Product Code': product.product_code,
      'Product Name': product.product_name,
      'Brand': product.brand?.brand_name || '',
      'Category': product.category?.category_name || '',
      'MRP': product.mrp,
      'Opening Stock': product.opening_stock,
      'Status': product.is_active ? 'Active' : 'Inactive'
    }));

    const csvContent = [
      Object.keys(csvData[0]).join(','),
      ...csvData.map(row => Object.values(row).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'products.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const toggleProductStatus = async (productId: number, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('products')
        .update({ is_active: !currentStatus })
        .eq('product_id', productId);

      if (error) throw error;

      toast.success(`Product ${!currentStatus ? 'activated' : 'deactivated'}`);
      fetchProducts();
    } catch (error) {
      console.error('Error updating product status:', error);
      toast.error('Failed to update product status');
    }
  };

  return (
    <Layout>
      <div className="container mx-auto p-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Product List</CardTitle>
            <div className="flex gap-2">
              <Button onClick={() => navigate('/masters/products/add')}>
                <Plus className="h-4 w-4 mr-2" />
                Add Product
              </Button>
              <Button variant="outline" onClick={handleExportCSV}>
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
              <Button variant="outline">
                <Upload className="h-4 w-4 mr-2" />
                Import Excel
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
              <Input
                placeholder="Search by code or name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Select value={selectedBrand} onValueChange={setSelectedBrand}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by brand" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Brands</SelectItem>
                  {brands.map(brand => (
                    <SelectItem key={brand.brand_id} value={brand.brand_id.toString()}>
                      {brand.brand_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map(category => (
                    <SelectItem key={category.category_id} value={category.category_id.toString()}>
                      {category.category_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Bulk Actions */}
            {selectedProducts.length > 0 && (
              <div className="flex gap-2 mb-4">
                <Button 
                  variant="outline" 
                  onClick={() => handleBulkStatusUpdate(true)}
                  disabled={isBulkUpdating}
                >
                  Activate Selected ({selectedProducts.length})
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => handleBulkStatusUpdate(false)}
                  disabled={isBulkUpdating}
                >
                  Deactivate Selected ({selectedProducts.length})
                </Button>
                <Button variant="outline">
                  <QrCode className="h-4 w-4 mr-2" />
                  Print Barcodes
                </Button>
              </div>
            )}

            {/* Products Table */}
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={selectedProducts.length === products.length && products.length > 0}
                        onCheckedChange={handleSelectAll}
                      />
                    </TableHead>
                    <TableHead>Product Code</TableHead>
                    <TableHead>Product Name</TableHead>
                    <TableHead>Brand</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>MRP</TableHead>
                    <TableHead>Opening Stock</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-8">
                        Loading products...
                      </TableCell>
                    </TableRow>
                  ) : products.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-8">
                        No products found
                      </TableCell>
                    </TableRow>
                  ) : (
                    products.map((product) => (
                      <TableRow key={product.product_id}>
                        <TableCell>
                          <Checkbox
                            checked={selectedProducts.includes(product.product_id)}
                            onCheckedChange={(checked) => 
                              handleSelectProduct(product.product_id, checked as boolean)
                            }
                          />
                        </TableCell>
                        <TableCell className="font-medium">{product.product_code}</TableCell>
                        <TableCell>{product.product_name}</TableCell>
                        <TableCell>{product.brand?.brand_name || '-'}</TableCell>
                        <TableCell>{product.category?.category_name || '-'}</TableCell>
                        <TableCell>₹{product.mrp?.toFixed(2) || '0.00'}</TableCell>
                        <TableCell>{product.opening_stock || 0}</TableCell>
                        <TableCell>
                          <Badge variant={product.is_active ? "default" : "secondary"}>
                            {product.is_active ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem 
                                onClick={() => navigate(`/masters/products/edit/${product.product_id}`)}
                              >
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => toggleProductStatus(product.product_id, product.is_active)}
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                {product.is_active ? 'Deactivate' : 'Activate'}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-6 flex justify-center">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious 
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                      />
                    </PaginationItem>
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const page = i + 1;
                      return (
                        <PaginationItem key={page}>
                          <PaginationLink
                            onClick={() => setCurrentPage(page)}
                            isActive={currentPage === page}
                            className="cursor-pointer"
                          >
                            {page}
                          </PaginationLink>
                        </PaginationItem>
                      );
                    })}
                    <PaginationItem>
                      <PaginationNext 
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default ProductList;
