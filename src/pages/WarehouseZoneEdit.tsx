
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { ArrowLeft, Save } from "lucide-react";

const WarehouseZoneEdit = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { warehouseId, zoneId } = useParams();
  const isNew = !zoneId;

  const [formData, setFormData] = useState({
    zone_code: '',
    zone_name: '',
    zone_type: '',
    temperature_min: '',
    temperature_max: '',
    special_handling_requirements: '',
    is_active: true
  });

  const [warehouse, setWarehouse] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (warehouseId) {
      fetchWarehouse();
      if (!isNew && zoneId) {
        fetchZone();
      } else if (isNew) {
        generateZoneCode();
      }
    }
  }, [warehouseId, zoneId, isNew]);

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

  const fetchZone = async () => {
    if (!zoneId) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('warehouse_zones')
        .select('*')
        .eq('zone_id', parseInt(zoneId))
        .single();

      if (error) throw error;

      if (data) {
        setFormData({
          zone_code: data.zone_code || '',
          zone_name: data.zone_name || '',
          zone_type: data.zone_type || '',
          temperature_min: data.temperature_min?.toString() || '',
          temperature_max: data.temperature_max?.toString() || '',
          special_handling_requirements: data.special_handling_requirements || '',
          is_active: data.is_active ?? true
        });
      }
    } catch (error) {
      console.error('Error fetching zone:', error);
      toast.error('Failed to fetch zone details');
    } finally {
      setIsLoading(false);
    }
  };

  const generateZoneCode = async () => {
    if (!warehouse) return;

    try {
      const prefix = `${warehouse.warehouse_code}-Z`;
      
      const { data, error } = await supabase
        .from('warehouse_zones')
        .select('zone_code')
        .eq('warehouse_id', parseInt(warehouseId!))
        .like('zone_code', `${prefix}%`)
        .order('zone_code', { ascending: false })
        .limit(1);

      if (error) throw error;

      let nextNumber = 1;
      if (data && data.length > 0) {
        const lastCode = data[0].zone_code;
        const match = lastCode.match(/-Z(\d+)$/);
        if (match) {
          nextNumber = parseInt(match[1]) + 1;
        }
      }

      const newCode = `${prefix}${nextNumber.toString().padStart(3, '0')}`;
      setFormData(prev => ({ ...prev, zone_code: newCode }));
    } catch (error) {
      console.error('Error generating zone code:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.zone_code || !formData.zone_name) {
      toast.error('Please fill in required fields');
      return;
    }

    setIsSaving(true);
    try {
      const saveData = {
        zone_code: formData.zone_code,
        zone_name: formData.zone_name,
        zone_type: formData.zone_type || 'ambient',
        temperature_min: formData.temperature_min ? parseFloat(formData.temperature_min) : null,
        temperature_max: formData.temperature_max ? parseFloat(formData.temperature_max) : null,
        special_handling_requirements: formData.special_handling_requirements || null,
        is_active: formData.is_active,
        warehouse_id: parseInt(warehouseId!)
      };

      if (isNew) {
        const { error } = await supabase
          .from('warehouse_zones')
          .insert(saveData);

        if (error) throw error;
        toast.success('Zone created successfully');
      } else {
        const { error } = await supabase
          .from('warehouse_zones')
          .update(saveData)
          .eq('zone_id', parseInt(zoneId!));

        if (error) throw error;
        toast.success('Zone updated successfully');
      }

      navigate(`/masters/warehouse/${warehouseId}/zones`);
    } catch (error) {
      console.error('Error saving zone:', error);
      toast.error('Failed to save zone');
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
              <Button variant="ghost" size="sm" onClick={() => navigate(`/masters/warehouse/${warehouseId}/zones`)}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <CardTitle>{isNew ? 'Add New Zone' : 'Edit Zone'}</CardTitle>
                <CardDescription>
                  {warehouse ? `${warehouse.warehouse_name} (${warehouse.warehouse_code})` : 'Loading...'}
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
                      <Label htmlFor="zone_code">Zone Code *</Label>
                      <Input
                        id="zone_code"
                        value={formData.zone_code}
                        onChange={(e) => setFormData(prev => ({ ...prev, zone_code: e.target.value }))}
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="zone_name">Zone Name *</Label>
                      <Input
                        id="zone_name"
                        value={formData.zone_name}
                        onChange={(e) => setFormData(prev => ({ ...prev, zone_name: e.target.value }))}
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="zone_type">Zone Type</Label>
                      <Select 
                        value={formData.zone_type} 
                        onValueChange={(value) => setFormData(prev => ({ ...prev, zone_type: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ambient">Ambient</SelectItem>
                          <SelectItem value="cold">Cold</SelectItem>
                          <SelectItem value="frozen">Frozen</SelectItem>
                          <SelectItem value="hazmat">Hazmat</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="temperature_min">Minimum Temperature (°C)</Label>
                      <Input
                        id="temperature_min"
                        type="number"
                        step="0.1"
                        value={formData.temperature_min}
                        onChange={(e) => setFormData(prev => ({ ...prev, temperature_min: e.target.value }))}
                      />
                    </div>

                    <div>
                      <Label htmlFor="temperature_max">Maximum Temperature (°C)</Label>
                      <Input
                        id="temperature_max"
                        type="number"
                        step="0.1"
                        value={formData.temperature_max}
                        onChange={(e) => setFormData(prev => ({ ...prev, temperature_max: e.target.value }))}
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

                <div>
                  <Label htmlFor="special_handling_requirements">Special Handling Requirements</Label>
                  <Textarea
                    id="special_handling_requirements"
                    value={formData.special_handling_requirements}
                    onChange={(e) => setFormData(prev => ({ ...prev, special_handling_requirements: e.target.value }))}
                    placeholder="Describe any special handling requirements..."
                  />
                </div>

                <div className="flex justify-end gap-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => navigate(`/masters/warehouse/${warehouseId}/zones`)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSaving}>
                    <Save className="mr-2 h-4 w-4" />
                    {isSaving ? 'Saving...' : 'Save Zone'}
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

export default WarehouseZoneEdit;
