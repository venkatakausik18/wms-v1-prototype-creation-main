
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Search, Edit, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Brand {
  brand_id: number;
  brand_code: string;
  brand_name: string;
  brand_category: string | null;
  manufacturer_name: string | null;
  is_active: boolean;
  created_at: string;
}

const BrandList = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const { data: brands = [], isLoading, error } = useQuery({
    queryKey: ['brands', searchTerm, statusFilter],
    queryFn: async () => {
      console.log('Fetching brands with filters:', { searchTerm, statusFilter });
      
      let query = supabase
        .from('brands')
        .select('brand_id, brand_code, brand_name, brand_category, manufacturer_name, is_active, created_at')
        .order('brand_name');

      if (searchTerm) {
        query = query.ilike('brand_name', `%${searchTerm}%`);
      }

      if (statusFilter !== "all") {
        query = query.eq('is_active', statusFilter === "active");
      }

      const { data, error } = await query;
      
      if (error) {
        console.error('Error fetching brands:', error);
        throw error;
      }
      
      console.log('Fetched brands:', data);
      return data as Brand[];
    },
  });

  if (error) {
    console.error('Error in BrandList:', error);
    toast({
      title: "Error",
      description: "Failed to load brands. Please try again.",
      variant: "destructive",
    });
  }

  const handleAddBrand = () => {
    navigate('/masters/brands/add');
  };

  const handleEditBrand = (brandId: number) => {
    navigate(`/masters/brands/edit/${brandId}`);
  };

  const handleViewBrand = (brandId: number) => {
    navigate(`/masters/brands/edit/${brandId}?mode=view`);
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Brand Management</h1>
            <p className="text-gray-600">Manage your product brands</p>
          </div>
          <Button onClick={handleAddBrand} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Brand
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Brands</CardTitle>
            <CardDescription>
              Search and filter brands in your system
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 mb-6">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search by brand name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {isLoading ? (
              <div className="text-center py-4">Loading brands...</div>
            ) : brands.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No brands found.</p>
                <Button onClick={handleAddBrand} className="mt-4">
                  <Plus className="h-4 w-4 mr-2" />
                  Add First Brand
                </Button>
              </div>
            ) : (
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Brand ID</TableHead>
                      <TableHead>Brand Code</TableHead>
                      <TableHead>Brand Name</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Manufacturer</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {brands.map((brand) => (
                      <TableRow key={brand.brand_id}>
                        <TableCell className="font-medium">
                          {brand.brand_id}
                        </TableCell>
                        <TableCell>{brand.brand_code}</TableCell>
                        <TableCell className="font-medium">
                          {brand.brand_name}
                        </TableCell>
                        <TableCell>
                          {brand.brand_category || "-"}
                        </TableCell>
                        <TableCell>
                          {brand.manufacturer_name || "-"}
                        </TableCell>
                        <TableCell>
                          <Badge variant={brand.is_active ? "default" : "secondary"}>
                            {brand.is_active ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewBrand(brand.brand_id)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditBrand(brand.brand_id)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default BrandList;
