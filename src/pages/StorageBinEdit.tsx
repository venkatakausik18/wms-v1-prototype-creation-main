
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { ArrowLeft, Save } from "lucide-react";

const StorageBinEdit = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { zoneId, binId } = useParams();
  const isNew = !binId;

  const [formData, setFormData] = useState({
    bin_code: '',
    bin_type: 'small' as 'small' | 'medium' | 'large' | 'bulk',
    capacity_weight: '',
    capacity_volume: '',
    current_weight: '',
    current_volume: '',
    bin_status: 'available' as 'available' | 'occupied' | 'damaged' | 'maintenance',
    location_coordinates: '',
    is_active: true
  });

  const [zone, setZone] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (zoneId) {
      fetchZone();
      if (!isNew && binId) {
        fetchBin();
      } else if (isNew) {
        generateBinCode();
      }
    }
  }, [zoneId, binId, isNew]);

  const fetchZone = async () => {
    try {
      const { data, error } = await supabase
        .from('warehouse_zones')
        .select('zone_id, zone_name, zone_code')
        .eq('zone_id', parseInt(zoneId!))
        .single();

      if (error) throw error;
      setZone(data);
    } catch (error) {
      console.error('Error fetching zone:', error);
      toast.error('Failed to fetch zone details');
    }
  };

  const fetchBin = async () => {
    if (!binId) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('storage_bins')
        .select('*')
        .eq('bin_id', parseInt(binId))
        .single();

      if (error) throw error;

      if (data) {
        setFormData({
          bin_code: data.bin_code || '',
          bin_type: data.bin_type || 'small',
          capacity_weight: data.capacity_weight?.toString() || '',
          capacity_volume: data.capacity_volume?.toString() || '',
          current_weight: data.current_weight?.toString() || '',
          current_volume: data.current_volume?.toString() || '',
          bin_status: data.bin_status || 'available',
          location_coordinates: data.location_coordinates || '',
          is_active: data.is_active ?? true
        });
      }
    } catch (error) {
      console.error('Error fetching bin:', error);
      toast.error('Failed to fetch bin details');
    } finally {
      setIsLoading(false);
    }
  };

  const generateBinCode = async () => {
    if (!zone) return;

    try {
      const prefix = `${zone.zone_code}-B`;
      
      const { data, error } = await supabase
        .from('storage_bins')
        .select('bin_code')
        .eq('zone_id', parseInt(zoneId!))
        .like('bin_code', `${prefix}%`)
        .order('bin_code', { ascending: false })
        .limit(1);

      if (error) throw error;

      let nextNumber = 1;
      if (data && data.length > 0) {
        const lastCode = data[0].bin_code;
        const match = lastCode.match(/-B(\d+)$/);
        if (match) {
          nextNumber = parseInt(match[1]) + 1;
        }
      }

      const newCode = `${prefix}${nextNumber.toString().padStart(4, '0')}`;
      setFormData(prev => ({ ...prev, bin_code: newCode }));
    } catch (error) {
      console.error('Error generating bin code:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.bin_code) {
      toast.error('Please fill in required fields');
      return;
    }

    setIsSaving(true);
    try {
      const saveData = {
        bin_code: formData.bin_code,
        bin_type: formData.bin_type,
        capacity_weight: formData.capacity_weight ? parseFloat(formData.capacity_weight) : null,
        capacity_volume: formData.capacity_volume ? parseFloat(formData.capacity_volume) : null,
        current_weight: formData.current_weight ? parseFloat(formData.current_weight) : 0,
        current_volume: formData.current_volume ? parseFloat(formData.current_volume) : 0,
        bin_status: formData.bin_status,
        location_coordinates: formData.location_coordinates || null,
        is_active: formData.is_active,
        zone_id: parseInt(zoneId!)
      };

      if (isNew) {
        const { error } = await supabase
          .from('storage_bins')
          .insert(saveData);

        if (error) throw error;
        toast.success('Bin created successfully');
      } else {
        const { error } = await supabase
          .from('storage_bins')
          .update(saveData)
          .eq('bin_id', parseInt(binId!));

        if (error) throw error;
        toast.success('Bin updated successfully');
      }

      navigate(`/masters/warehouse/zones/${zoneId}/bins`);
    } catch (error) {
      console.error('Error saving bin:', error);
      toast.error('Failed to save bin');
    } finally {
      setIsSaving(false);
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
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={() => navigate(`/masters/warehouse/zones/${zoneId}/bins`)}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <CardTitle>{isNew ? 'Add New Bin' : 'Edit Bin'}</CardTitle>
                <CardDescription>
                  {zone ? `${zone.zone_name} (${zone.zone_code})` : 'Loading...'}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="bin_code">Bin Code *</Label>
                      <Input
                        id="bin_code"
                        value={formData.bin_code}
                        onChange={(e) => setFormData(prev => ({ ...prev, bin_code: e.target.value }))}
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="bin_type">Bin Type</Label>
                      <Select 
                        value={formData.bin_type} 
                        onValueChange={(value: 'small' | 'medium' | 'large' | 'bulk') => 
                          setFormData(prev => ({ ...prev, bin_type: value }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="small">Small</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="large">Large</SelectItem>
                          <SelectItem value="bulk">Bulk</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="capacity_weight">Capacity Weight (kg)</Label>
                      <Input
                        id="capacity_weight"
                        type="number"
                        step="0.01"
                        value={formData.capacity_weight}
                        onChange={(e) => setFormData(prev => ({ ...prev, capacity_weight: e.target.value }))}
                      />
                    </div>

                    <div>
                      <Label htmlFor="capacity_volume">Capacity Volume (m³)</Label>
                      <Input
                        id="capacity_volume"
                        type="number"
                        step="0.01"
                        value={formData.capacity_volume}
                        onChange={(e) => setFormData(prev => ({ ...prev, capacity_volume: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="current_weight">Current Weight (kg)</Label>
                      <Input
                        id="current_weight"
                        type="number"
                        step="0.01"
                        value={formData.current_weight}
                        onChange={(e) => setFormData(prev => ({ ...prev, current_weight: e.target.value }))}
                      />
                    </div>

                    <div>
                      <Label htmlFor="current_volume">Current Volume (m³)</Label>
                      <Input
                        id="current_volume"
                        type="number"
                        step="0.01"
                        value={formData.current_volume}
                        onChange={(e) => setFormData(prev => ({ ...prev, current_volume: e.target.value }))}
                      />
                    </div>

                    <div>
                      <Label htmlFor="bin_status">Bin Status</Label>
                      <Select 
                        value={formData.bin_status} 
                        onValueChange={(value: 'available' | 'occupied' | 'damaged' | 'maintenance') => 
                          setFormData(prev => ({ ...prev, bin_status: value }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="available">Available</SelectItem>
                          <SelectItem value="occupied">Occupied</SelectItem>
                          <SelectItem value="damaged">Damaged</SelectItem>
                          <SelectItem value="maintenance">Maintenance</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="location_coordinates">Location Coordinates</Label>
                      <Input
                        id="location_coordinates"
                        value={formData.location_coordinates}
                        onChange={(e) => setFormData(prev => ({ ...prev, location_coordinates: e.target.value }))}
                        placeholder="e.g., A-1-2 or lat,lng"
                      />
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="is_active"
                        checked={formData.is_active}
                        onCheckedChange={(checked) => 
                          setFormData(prev => ({ ...prev, is_active: checked as boolean }))
                        }
                      />
                      <Label htmlFor="is_active">Active</Label>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => navigate(`/masters/warehouse/zones/${zoneId}/bins`)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSaving}>
                    <Save className="mr-2 h-4 w-4" />
                    {isSaving ? 'Saving...' : 'Save Bin'}
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default StorageBinEdit;
