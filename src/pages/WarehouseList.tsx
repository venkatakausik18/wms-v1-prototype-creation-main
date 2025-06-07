
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Plus, Edit, Search } from "lucide-react";

interface Warehouse {
  warehouse_id: number;
  warehouse_code: string;
  warehouse_name: string;
  warehouse_type: string;
  city: string;
  state: string;
  is_active: boolean;
}

const WarehouseList = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [filteredWarehouses, setFilteredWarehouses] = useState<Warehouse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [warehouseTypeFilter, setWarehouseTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedWarehouses, setSelectedWarehouses] = useState<number[]>([]);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    fetchWarehouses();
  }, []);

  useEffect(() => {
    filterWarehouses();
  }, [warehouses, searchTerm, warehouseTypeFilter, statusFilter]);

  const fetchWarehouses = async () => {
    try {
      const { data, error } = await supabase
        .from('warehouses')
        .select('warehouse_id, warehouse_code, warehouse_name, warehouse_type, city, state, is_active')
        .order('warehouse_name');

      if (error) throw error;
      setWarehouses(data || []);
    } catch (error) {
      console.error('Error fetching warehouses:', error);
      toast.error('Failed to fetch warehouses');
    } finally {
      setIsLoading(false);
    }
  };

  const filterWarehouses = () => {
    let filtered = warehouses;

    if (searchTerm) {
      filtered = filtered.filter(warehouse =>
        warehouse.warehouse_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        warehouse.warehouse_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (warehouseTypeFilter) {
      filtered = filtered.filter(warehouse => warehouse.warehouse_type === warehouseTypeFilter);
    }

    if (statusFilter !== "") {
      filtered = filtered.filter(warehouse => warehouse.is_active === (statusFilter === "true"));
    }

    setFilteredWarehouses(filtered);
  };

  const handleBulkStatusChange = async (isActive: boolean) => {
    if (selectedWarehouses.length === 0) {
      toast.error('Please select warehouses to update');
      return;
    }

    try {
      const { error } = await supabase
        .from('warehouses')
        .update({ is_active: isActive })
        .in('warehouse_id', selectedWarehouses);

      if (error) throw error;

      toast.success(`Warehouses ${isActive ? 'activated' : 'deactivated'} successfully`);
      setSelectedWarehouses([]);
      fetchWarehouses();
    } catch (error) {
      console.error('Error updating warehouses:', error);
      toast.error('Failed to update warehouses');
    }
  };

  const handleSelectWarehouse = (warehouseId: number, checked: boolean) => {
    if (checked) {
      setSelectedWarehouses(prev => [...prev, warehouseId]);
    } else {
      setSelectedWarehouses(prev => prev.filter(id => id !== warehouseId));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedWarehouses(filteredWarehouses.map(w => w.warehouse_id));
    } else {
      setSelectedWarehouses([]);
    }
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Warehouse Management</CardTitle>
                <CardDescription>Manage your warehouses and storage facilities</CardDescription>
              </div>
              <Button onClick={() => navigate('/masters/warehouse/add')}>
                <Plus className="mr-2 h-4 w-4" />
                Add Warehouse
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Filters */}
              <div className="flex flex-wrap gap-4">
                <div className="flex-1 min-w-[200px]">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by code or name..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={warehouseTypeFilter} onValueChange={setWarehouseTypeFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Warehouse Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Types</SelectItem>
                    <SelectItem value="main">Main</SelectItem>
                    <SelectItem value="branch">Branch</SelectItem>
                    <SelectItem value="transit">Transit</SelectItem>
                    <SelectItem value="retail">Retail</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Status</SelectItem>
                    <SelectItem value="true">Active</SelectItem>
                    <SelectItem value="false">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Bulk Actions */}
              {selectedWarehouses.length > 0 && (
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleBulkStatusChange(true)}
                  >
                    Activate Selected ({selectedWarehouses.length})
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleBulkStatusChange(false)}
                  >
                    Deactivate Selected ({selectedWarehouses.length})
                  </Button>
                </div>
              )}

              {/* Table */}
              <div className="border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">
                        <Checkbox
                          checked={selectedWarehouses.length === filteredWarehouses.length && filteredWarehouses.length > 0}
                          onCheckedChange={handleSelectAll}
                        />
                      </TableHead>
                      <TableHead>Code</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>City</TableHead>
                      <TableHead>State</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8">
                          Loading warehouses...
                        </TableCell>
                      </TableRow>
                    ) : filteredWarehouses.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8">
                          No warehouses found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredWarehouses.map((warehouse) => (
                        <TableRow key={warehouse.warehouse_id}>
                          <TableCell>
                            <Checkbox
                              checked={selectedWarehouses.includes(warehouse.warehouse_id)}
                              onCheckedChange={(checked) => 
                                handleSelectWarehouse(warehouse.warehouse_id, checked as boolean)
                              }
                            />
                          </TableCell>
                          <TableCell className="font-medium">{warehouse.warehouse_code}</TableCell>
                          <TableCell>{warehouse.warehouse_name}</TableCell>
                          <TableCell className="capitalize">{warehouse.warehouse_type}</TableCell>
                          <TableCell>{warehouse.city}</TableCell>
                          <TableCell>{warehouse.state}</TableCell>
                          <TableCell>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              warehouse.is_active 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {warehouse.is_active ? 'Active' : 'Inactive'}
                            </span>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => navigate(`/masters/warehouse/edit/${warehouse.warehouse_id}`)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => navigate(`/masters/warehouse/${warehouse.warehouse_id}/zones`)}
                              >
                                Zones
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default WarehouseList;
