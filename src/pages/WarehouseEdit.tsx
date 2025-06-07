
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

const WarehouseEdit = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { warehouseId } = useParams();
  const isNew = !warehouseId;

  const [formData, setFormData] = useState({
    warehouse_code: '',
    warehouse_name: '',
    address_line1: '',
    address_line2: '',
    city: '',
    state: '',
    pin_code: '',
    country: 'India',
    phone: '',
    email: '',
    manager_name: '',
    manager_contact: '',
    warehouse_type: '',
    is_active: true,
    total_area: '',
    temperature_controlled: false,
    security_features: '',
    operating_hours_start: '',
    operating_hours_end: ''
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (!isNew) {
      fetchWarehouse();
    } else {
      generateWarehouseCode();
    }
  }, [warehouseId, isNew]);

  const fetchWarehouse = async () => {
    if (!warehouseId) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('warehouses')
        .select('*')
        .eq('warehouse_id', parseInt(warehouseId))
        .single();

      if (error) throw error;

      if (data) {
        setFormData({
          warehouse_code: data.warehouse_code || '',
          warehouse_name: data.warehouse_name || '',
          address_line1: data.address_line1 || '',
          address_line2: data.address_line2 || '',
          city: data.city || '',
          state: data.state || '',
          pin_code: data.pin_code || '',
          country: data.country || 'India',
          phone: data.phone || '',
          email: data.email || '',
          manager_name: data.manager_name || '',
          manager_contact: data.manager_contact || '',
          warehouse_type: data.warehouse_type || '',
          is_active: data.is_active ?? true,
          total_area: data.total_area?.toString() || '',
          temperature_controlled: data.temperature_controlled || false,
          security_features: data.security_features || '',
          operating_hours_start: data.operating_hours_start || '',
          operating_hours_end: data.operating_hours_end || ''
        });
      }
    } catch (error) {
      console.error('Error fetching warehouse:', error);
      toast.error('Failed to fetch warehouse details');
    } finally {
      setIsLoading(false);
    }
  };

  const generateWarehouseCode = async () => {
    try {
      // Get company code - for now using a placeholder
      const companyCode = "COMP"; // This should come from company settings
      
      // Get the next sequence number
      const { data, error } = await supabase
        .from('warehouses')
        .select('warehouse_code')
        .like('warehouse_code', `${companyCode}-WH-%`)
        .order('warehouse_code', { ascending: false })
        .limit(1);

      if (error) throw error;

      let nextNumber = 1;
      if (data && data.length > 0) {
        const lastCode = data[0].warehouse_code;
        const match = lastCode.match(/-WH-(\d+)$/);
        if (match) {
          nextNumber = parseInt(match[1]) + 1;
        }
      }

      const newCode = `${companyCode}-WH-${nextNumber.toString().padStart(4, '0')}`;
      setFormData(prev => ({ ...prev, warehouse_code: newCode }));
    } catch (error) {
      console.error('Error generating warehouse code:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.warehouse_code || !formData.warehouse_name) {
      toast.error('Please fill in required fields');
      return;
    }

    setIsSaving(true);
    try {
      const saveData = {
        warehouse_code: formData.warehouse_code,
        warehouse_name: formData.warehouse_name,
        address_line1: formData.address_line1 || null,
        address_line2: formData.address_line2 || null,
        city: formData.city || null,
        state: formData.state || null,
        pin_code: formData.pin_code || null,
        country: formData.country || 'India',
        phone: formData.phone || null,
        email: formData.email || null,
        manager_name: formData.manager_name || null,
        manager_contact: formData.manager_contact || null,
        warehouse_type: formData.warehouse_type || 'main',
        is_active: formData.is_active,
        total_area: formData.total_area ? parseFloat(formData.total_area) : null,
        temperature_controlled: formData.temperature_controlled,
        security_features: formData.security_features || null,
        operating_hours_start: formData.operating_hours_start || null,
        operating_hours_end: formData.operating_hours_end || null,
        company_id: 1 // This should come from user context
      };

      if (isNew) {
        const { error } = await supabase
          .from('warehouses')
          .insert(saveData);

        if (error) throw error;
        toast.success('Warehouse created successfully');
      } else {
        const { error } = await supabase
          .from('warehouses')
          .update(saveData)
          .eq('warehouse_id', parseInt(warehouseId!));

        if (error) throw error;
        toast.success('Warehouse updated successfully');
      }

      navigate('/masters/warehouse/list');
    } catch (error) {
      console.error('Error saving warehouse:', error);
      toast.error('Failed to save warehouse');
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
              <Button variant="ghost" size="sm" onClick={() => navigate('/masters/warehouse/list')}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <CardTitle>{isNew ? 'Add New Warehouse' : 'Edit Warehouse'}</CardTitle>
                <CardDescription>
                  {isNew ? 'Create a new warehouse facility' : 'Update warehouse information'}
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
                  {/* Basic Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Basic Information</h3>
                    
                    <div>
                      <Label htmlFor="warehouse_code">Warehouse Code *</Label>
                      <Input
                        id="warehouse_code"
                        value={formData.warehouse_code}
                        onChange={(e) => setFormData(prev => ({ ...prev, warehouse_code: e.target.value }))}
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="warehouse_name">Warehouse Name *</Label>
                      <Input
                        id="warehouse_name"
                        value={formData.warehouse_name}
                        onChange={(e) => setFormData(prev => ({ ...prev, warehouse_name: e.target.value }))}
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="warehouse_type">Warehouse Type</Label>
                      <Select 
                        value={formData.warehouse_type} 
                        onValueChange={(value) => setFormData(prev => ({ ...prev, warehouse_type: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="main">Main</SelectItem>
                          <SelectItem value="branch">Branch</SelectItem>
                          <SelectItem value="transit">Transit</SelectItem>
                          <SelectItem value="retail">Retail</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="total_area">Total Area (sq ft)</Label>
                      <Input
                        id="total_area"
                        type="number"
                        value={formData.total_area}
                        onChange={(e) => setFormData(prev => ({ ...prev, total_area: e.target.value }))}
                      />
                    </div>
                  </div>

                  {/* Contact Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Contact Information</h3>
                    
                    <div>
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                      />
                    </div>

                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      />
                    </div>

                    <div>
                      <Label htmlFor="manager_name">Manager Name</Label>
                      <Input
                        id="manager_name"
                        value={formData.manager_name}
                        onChange={(e) => setFormData(prev => ({ ...prev, manager_name: e.target.value }))}
                      />
                    </div>

                    <div>
                      <Label htmlFor="manager_contact">Manager Contact</Label>
                      <Input
                        id="manager_contact"
                        value={formData.manager_contact}
                        onChange={(e) => setFormData(prev => ({ ...prev, manager_contact: e.target.value }))}
                      />
                    </div>
                  </div>
                </div>

                {/* Address Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Address Information</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="address_line1">Address Line 1</Label>
                      <Input
                        id="address_line1"
                        value={formData.address_line1}
                        onChange={(e) => setFormData(prev => ({ ...prev, address_line1: e.target.value }))}
                      />
                    </div>

                    <div>
                      <Label htmlFor="address_line2">Address Line 2</Label>
                      <Input
                        id="address_line2"
                        value={formData.address_line2}
                        onChange={(e) => setFormData(prev => ({ ...prev, address_line2: e.target.value }))}
                      />
                    </div>

                    <div>
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        value={formData.city}
                        onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                      />
                    </div>

                    <div>
                      <Label htmlFor="state">State</Label>
                      <Input
                        id="state"
                        value={formData.state}
                        onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value }))}
                      />
                    </div>

                    <div>
                      <Label htmlFor="pin_code">PIN Code</Label>
                      <Input
                        id="pin_code"
                        value={formData.pin_code}
                        onChange={(e) => setFormData(prev => ({ ...prev, pin_code: e.target.value }))}
                      />
                    </div>

                    <div>
                      <Label htmlFor="country">Country</Label>
                      <Input
                        id="country"
                        value={formData.country}
                        onChange={(e) => setFormData(prev => ({ ...prev, country: e.target.value }))}
                      />
                    </div>
                  </div>
                </div>

                {/* Operational Details */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Operational Details</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="operating_hours_start">Opening Time</Label>
                      <Input
                        id="operating_hours_start"
                        type="time"
                        value={formData.operating_hours_start}
                        onChange={(e) => setFormData(prev => ({ ...prev, operating_hours_start: e.target.value }))}
                      />
                    </div>

                    <div>
                      <Label htmlFor="operating_hours_end">Closing Time</Label>
                      <Input
                        id="operating_hours_end"
                        type="time"
                        value={formData.operating_hours_end}
                        onChange={(e) => setFormData(prev => ({ ...prev, operating_hours_end: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="temperature_controlled"
                      checked={formData.temperature_controlled}
                      onCheckedChange={(checked) => 
                        setFormData(prev => ({ ...prev, temperature_controlled: checked as boolean }))
                      }
                    />
                    <Label htmlFor="temperature_controlled">Temperature Controlled</Label>
                  </div>

                  <div>
                    <Label htmlFor="security_features">Security Features</Label>
                    <Textarea
                      id="security_features"
                      value={formData.security_features}
                      onChange={(e) => setFormData(prev => ({ ...prev, security_features: e.target.value }))}
                      placeholder="Describe security features..."
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

                <div className="flex justify-end gap-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => navigate('/masters/warehouse/list')}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSaving}>
                    <Save className="mr-2 h-4 w-4" />
                    {isSaving ? 'Saving...' : 'Save Warehouse'}
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>

        {!isNew && (
          <Card>
            <CardHeader>
              <CardTitle>Zone Management</CardTitle>
              <CardDescription>Manage warehouse zones and storage areas</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => navigate(`/masters/warehouse/${warehouseId}/zones`)}>
                Manage Zones
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
};

export default WarehouseEdit;
