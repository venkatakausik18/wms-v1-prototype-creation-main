
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

interface StorageBin {
  bin_id: number;
  bin_code: string;
  bin_type: string;
  capacity_weight: number | null;
  capacity_volume: number | null;
  current_weight: number;
  current_volume: number;
  bin_status: string;
  is_active: boolean;
}

const StorageBins = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { zoneId } = useParams();
  
  const [bins, setBins] = useState<StorageBin[]>([]);
  const [filteredBins, setFilteredBins] = useState<StorageBin[]>([]);
  const [zone, setZone] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (zoneId) {
      fetchZone();
      fetchBins();
    }
  }, [zoneId]);

  useEffect(() => {
    filterBins();
  }, [bins, searchTerm, typeFilter, statusFilter]);

  const fetchZone = async () => {
    try {
      const { data, error } = await supabase
        .from('warehouse_zones')
        .select('zone_id, zone_name, zone_code, warehouse_id')
        .eq('zone_id', parseInt(zoneId!))
        .single();

      if (error) throw error;
      setZone(data);
    } catch (error) {
      console.error('Error fetching zone:', error);
      toast.error('Failed to fetch zone details');
    }
  };

  const fetchBins = async () => {
    try {
      const { data, error } = await supabase
        .from('storage_bins')
        .select('*')
        .eq('zone_id', parseInt(zoneId!))
        .order('bin_code');

      if (error) throw error;
      setBins(data || []);
    } catch (error) {
      console.error('Error fetching bins:', error);
      toast.error('Failed to fetch bins');
    } finally {
      setIsLoading(false);
    }
  };

  const filterBins = () => {
    let filtered = bins;

    if (searchTerm) {
      filtered = filtered.filter(bin =>
        bin.bin_code.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (typeFilter && typeFilter !== "all") {
      filtered = filtered.filter(bin => bin.bin_type === typeFilter);
    }

    if (statusFilter && statusFilter !== "all") {
      filtered = filtered.filter(bin => bin.bin_status === statusFilter);
    }

    setFilteredBins(filtered);
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
              <Button variant="ghost" size="sm" onClick={() => navigate(`/masters/warehouse/${zone?.warehouse_id}/zones`)}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div className="flex-1">
                <CardTitle>Storage Bins</CardTitle>
                <CardDescription>
                  {zone ? `Manage bins for ${zone.zone_name} (${zone.zone_code})` : 'Loading...'}
                </CardDescription>
              </div>
              <Button onClick={() => navigate(`/masters/warehouse/zones/${zoneId}/bins/add`)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Bin
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
                      placeholder="Search by bin code..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Bin Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="small">Small</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="large">Large</SelectItem>
                    <SelectItem value="bulk">Bulk</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="available">Available</SelectItem>
                    <SelectItem value="occupied">Occupied</SelectItem>
                    <SelectItem value="damaged">Damaged</SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Table */}
              <div className="border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Bin Code</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Capacity</TableHead>
                      <TableHead>Current Load</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8">
                          Loading bins...
                        </TableCell>
                      </TableRow>
                    ) : filteredBins.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8">
                          No bins found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredBins.map((bin) => (
                        <TableRow key={bin.bin_id}>
                          <TableCell className="font-medium">{bin.bin_code}</TableCell>
                          <TableCell className="capitalize">{bin.bin_type}</TableCell>
                          <TableCell>
                            {bin.capacity_weight && bin.capacity_volume 
                              ? `${bin.capacity_weight}kg / ${bin.capacity_volume}m³`
                              : bin.capacity_weight 
                                ? `${bin.capacity_weight}kg`
                                : bin.capacity_volume 
                                  ? `${bin.capacity_volume}m³`
                                  : 'N/A'
                            }
                          </TableCell>
                          <TableCell>
                            {bin.current_weight || bin.current_volume
                              ? `${bin.current_weight || 0}kg / ${bin.current_volume || 0}m³`
                              : 'Empty'
                            }
                          </TableCell>
                          <TableCell>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              bin.bin_status === 'available' ? 'bg-green-100 text-green-800' :
                              bin.bin_status === 'occupied' ? 'bg-yellow-100 text-yellow-800' :
                              bin.bin_status === 'damaged' ? 'bg-red-100 text-red-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {bin.bin_status}
                            </span>
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => navigate(`/masters/warehouse/bins/${bin.bin_id}/edit`)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
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

export default StorageBins;
