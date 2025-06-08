
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Plus, Edit, ArrowLeft, Search } from "lucide-react";

interface WarehouseZone {
  zone_id: number;
  zone_code: string;
  zone_name: string;
  zone_type: string;
  temperature_min: number | null;
  temperature_max: number | null;
  is_active: boolean;
}

const WarehouseZones = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { warehouseId } = useParams();
  
  const [zones, setZones] = useState<WarehouseZone[]>([]);
  const [filteredZones, setFilteredZones] = useState<WarehouseZone[]>([]);
  const [warehouse, setWarehouse] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [zoneTypeFilter, setZoneTypeFilter] = useState("all");

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (warehouseId) {
      fetchWarehouse();
      fetchZones();
    }
  }, [warehouseId]);

  useEffect(() => {
    filterZones();
  }, [zones, searchTerm, zoneTypeFilter]);

  const fetchWarehouse = async () => {
    try {
      const { data, error } = await supabase
        .from('warehouses')
        .select('warehouse_id, warehouse_name, warehouse_code')
        .eq('warehouse_id', parseInt(warehouseId!))
        .single();

      if (error) throw error;
      setWarehouse(data);
    } catch (error) {
      console.error('Error fetching warehouse:', error);
      toast.error('Failed to fetch warehouse details');
    }
  };

  const fetchZones = async () => {
    try {
      const { data, error } = await supabase
        .from('warehouse_zones')
        .select('*')
        .eq('warehouse_id', parseInt(warehouseId!))
        .order('zone_name');

      if (error) throw error;
      setZones(data || []);
    } catch (error) {
      console.error('Error fetching zones:', error);
      toast.error('Failed to fetch zones');
    } finally {
      setIsLoading(false);
    }
  };

  const filterZones = () => {
    let filtered = zones;

    if (searchTerm) {
      filtered = filtered.filter(zone =>
        zone.zone_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        zone.zone_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (zoneTypeFilter && zoneTypeFilter !== "all") {
      filtered = filtered.filter(zone => zone.zone_type === zoneTypeFilter);
    }

    setFilteredZones(filtered);
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
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={() => navigate('/masters/warehouse/list')}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div className="flex-1">
                <CardTitle>Warehouse Zones</CardTitle>
                <CardDescription>
                  {warehouse ? `Manage zones for ${warehouse.warehouse_name} (${warehouse.warehouse_code})` : 'Loading...'}
                </CardDescription>
              </div>
              <Button onClick={() => navigate(`/masters/warehouse/${warehouseId}/zones/add`)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Zone
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
                <Select value={zoneTypeFilter} onValueChange={setZoneTypeFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Zone Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="receiving">Receiving</SelectItem>
                    <SelectItem value="storage">Storage</SelectItem>
                    <SelectItem value="picking">Picking</SelectItem>
                    <SelectItem value="dispatch">Dispatch</SelectItem>
                    <SelectItem value="quarantine">Quarantine</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Table */}
              <div className="border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Zone Code</TableHead>
                      <TableHead>Zone Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Temperature Range</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8">
                          Loading zones...
                        </TableCell>
                      </TableRow>
                    ) : filteredZones.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8">
                          No zones found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredZones.map((zone) => (
                        <TableRow key={zone.zone_id}>
                          <TableCell className="font-medium">{zone.zone_code}</TableCell>
                          <TableCell>{zone.zone_name}</TableCell>
                          <TableCell className="capitalize">{zone.zone_type}</TableCell>
                          <TableCell>
                            {zone.temperature_min !== null && zone.temperature_max !== null
                              ? `${zone.temperature_min}°C - ${zone.temperature_max}°C`
                              : 'N/A'
                            }
                          </TableCell>
                          <TableCell>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              zone.is_active 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {zone.is_active ? 'Active' : 'Inactive'}
                            </span>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => navigate(`/masters/warehouse/zones/${zone.zone_id}/edit`)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => navigate(`/masters/warehouse/zones/${zone.zone_id}/bins`)}
                              >
                                Bins
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

export default WarehouseZones;
