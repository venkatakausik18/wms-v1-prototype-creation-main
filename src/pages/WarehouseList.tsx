
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
import { Plus, Edit, Search, Trash2 } from "lucide-react";

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
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
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
  }, [warehouses, searchTerm, typeFilter, statusFilter]);

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

    if (typeFilter && typeFilter !== "all") {
      filtered = filtered.filter(warehouse => warehouse.warehouse_type === typeFilter);
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter(warehouse => 
        statusFilter === "active" ? warehouse.is_active : !warehouse.is_active
      );
    }

    setFilteredWarehouses(filtered);
  };

  const handleToggleActive = async (warehouseId: number, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('warehouses')
        .update({ is_active: !currentStatus })
        .eq('warehouse_id', warehouseId);

      if (error) throw error;
      
      toast.success(`Warehouse ${!currentStatus ? 'activated' : 'deactivated'} successfully`);
      fetchWarehouses();
    } catch (error) {
      console.error('Error updating warehouse status:', error);
      toast.error('Failed to update warehouse status');
    }
  };

  const handleBulkAction = async (action: string) => {
    if (selectedWarehouses.length === 0) {
      toast.error('Please select warehouses first');
      return;
    }

    try {
      if (action === 'activate') {
        const { error } = await supabase
          .from('warehouses')
          .update({ is_active: true })
          .in('warehouse_id', selectedWarehouses);
        
        if (error) throw error;
        toast.success('Selected warehouses activated');
      } else if (action === 'deactivate') {
        const { error } = await supabase
          .from('warehouses')
          .update({ is_active: false })
          .in('warehouse_id', selectedWarehouses);
        
        if (error) throw error;
        toast.success('Selected warehouses deactivated');
      }
      
      setSelectedWarehouses([]);
      fetchWarehouses();
    } catch (error) {
      console.error('Error performing bulk action:', error);
      toast.error('Failed to perform bulk action');
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedWarehouses(filteredWarehouses.map(w => w.warehouse_id));
    } else {
      setSelectedWarehouses([]);
    }
  };

  const handleSelectWarehouse = (warehouseId: number, checked: boolean) => {
    if (checked) {
      setSelectedWarehouses(prev => [...prev, warehouseId]);
    } else {
      setSelectedWarehouses(prev => prev.filter(id => id !== warehouseId));
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
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Warehouse Master</CardTitle>
                <CardDescription>Manage warehouse locations and configurations</CardDescription>
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
              <div className="flex gap-4">
                <div className="flex-1">
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
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Warehouse Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="main">Main</SelectItem>
                    <SelectItem value="transit">Transit</SelectItem>
                    <SelectItem value="virtual">Virtual</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Bulk Actions */}
              {selectedWarehouses.length > 0 && (
                <div className="flex gap-2 p-3 bg-muted rounded-lg">
                  <span className="text-sm text-muted-foreground">
                    {selectedWarehouses.length} selected
                  </span>
                  <Button size="sm" variant="outline" onClick={() => handleBulkAction('activate')}>
                    Activate
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleBulkAction('deactivate')}>
                    Deactivate
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
                      <TableHead>Location</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8">
                          Loading warehouses...
                        </TableCell>
                      </TableRow>
                    ) : filteredWarehouses.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8">
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
                          <TableCell>{warehouse.city}, {warehouse.state}</TableCell>
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
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleToggleActive(warehouse.warehouse_id, warehouse.is_active)}
                              >
                                {warehouse.is_active ? 'Deactivate' : 'Activate'}
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
