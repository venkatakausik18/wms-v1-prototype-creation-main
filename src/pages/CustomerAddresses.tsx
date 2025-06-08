
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Plus, Edit, Trash2, MapPin } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface Address {
  address_id: number;
  address_type: string;
  address_title: string;
  address_line1: string;
  address_line2: string;
  city: string;
  state: string;
  country: string;
  pin_code: string;
  phone: string;
  email: string;
  gps_coordinates: string;
  is_default: boolean;
  is_active: boolean;
}

interface AddressFormData {
  address_type: string;
  address_title: string;
  address_line1: string;
  address_line2: string;
  city: string;
  state: string;
  country: string;
  pin_code: string;
  phone: string;
  email: string;
  gps_coordinates: string;
  is_default: boolean;
  is_active: boolean;
}

const CustomerAddresses = () => {
  const { customerId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState<AddressFormData>({
    address_type: 'billing',
    address_title: '',
    address_line1: '',
    address_line2: '',
    city: '',
    state: '',
    country: 'India',
    pin_code: '',
    phone: '',
    email: '',
    gps_coordinates: '',
    is_default: false,
    is_active: true,
  });

  // Fetch customer info
  const { data: customer } = useQuery({
    queryKey: ['customer', customerId],
    queryFn: async () => {
      if (!customerId) return null;
      
      const { data, error } = await supabase
        .from('customers')
        .select('customer_id, customer_code, customer_name')
        .eq('customer_id', parseInt(customerId))
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!customerId,
  });

  // Fetch addresses
  const { data: addresses, isLoading, refetch } = useQuery({
    queryKey: ['customer-addresses', customerId],
    queryFn: async () => {
      if (!customerId) return [];
      
      const { data, error } = await supabase
        .from('customer_addresses')
        .select('*')
        .eq('customer_id', parseInt(customerId))
        .order('is_default', { ascending: false })
        .order('address_title');

      if (error) throw error;
      return data || [];
    },
    enabled: !!customerId,
  });

  const handleInputChange = (field: keyof AddressFormData, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const resetForm = () => {
    setFormData({
      address_type: 'billing',
      address_title: '',
      address_line1: '',
      address_line2: '',
      city: '',
      state: '',
      country: 'India',
      pin_code: '',
      phone: '',
      email: '',
      gps_coordinates: '',
      is_default: false,
      is_active: true,
    });
    setEditingAddress(null);
  };

  const openAddDialog = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const openEditDialog = (address: Address) => {
    setFormData({
      address_type: address.address_type,
      address_title: address.address_title || '',
      address_line1: address.address_line1,
      address_line2: address.address_line2 || '',
      city: address.city,
      state: address.state,
      country: address.country || 'India',
      pin_code: address.pin_code,
      phone: address.phone || '',
      email: address.email || '',
      gps_coordinates: address.gps_coordinates || '',
      is_default: address.is_default,
      is_active: address.is_active,
    });
    setEditingAddress(address);
    setIsDialogOpen(true);
  };

  const validateForm = () => {
    if (!formData.address_line1.trim()) {
      toast({
        title: "Validation Error",
        description: "Address Line 1 is required",
        variant: "destructive",
      });
      return false;
    }

    if (!formData.city.trim()) {
      toast({
        title: "Validation Error",
        description: "City is required",
        variant: "destructive",
      });
      return false;
    }

    if (!formData.state.trim()) {
      toast({
        title: "Validation Error",
        description: "State is required",
        variant: "destructive",
      });
      return false;
    }

    if (!formData.pin_code.trim()) {
      toast({
        title: "Validation Error",
        description: "Pin Code is required",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm() || !customerId) return;

    setIsSubmitting(true);

    try {
      const saveData = {
        customer_id: parseInt(customerId),
        address_type: formData.address_type,
        address_title: formData.address_title.trim() || null,
        address_line1: formData.address_line1.trim(),
        address_line2: formData.address_line2.trim() || null,
        city: formData.city.trim(),
        state: formData.state.trim(),
        country: formData.country,
        pin_code: formData.pin_code.trim(),
        phone: formData.phone.trim() || null,
        email: formData.email.trim() || null,
        gps_coordinates: formData.gps_coordinates.trim() || null,
        is_default: formData.is_default,
        is_active: formData.is_active,
      };

      // If setting as default, first unset all other default addresses
      if (formData.is_default) {
        await supabase
          .from('customer_addresses')
          .update({ is_default: false })
          .eq('customer_id', parseInt(customerId))
          .neq('address_id', editingAddress?.address_id || 0);
      }

      let result;
      if (editingAddress) {
        result = await supabase
          .from('customer_addresses')
          .update(saveData)
          .eq('address_id', editingAddress.address_id);
      } else {
        result = await supabase
          .from('customer_addresses')
          .insert(saveData);
      }

      if (result.error) throw result.error;

      toast({
        title: "Success",
        description: `Address ${editingAddress ? 'updated' : 'created'} successfully`,
      });

      setIsDialogOpen(false);
      refetch();
      resetForm();
    } catch (error) {
      console.error('Error saving address:', error);
      toast({
        title: "Error",
        description: `Failed to ${editingAddress ? 'update' : 'create'} address. Please try again.`,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (addressId: number) => {
    if (!confirm('Are you sure you want to delete this address?')) return;

    try {
      const { error } = await supabase
        .from('customer_addresses')
        .delete()
        .eq('address_id', addressId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Address deleted successfully",
      });

      refetch();
    } catch (error) {
      console.error('Error deleting address:', error);
      toast({
        title: "Error",
        description: "Failed to delete address. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (!customerId) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">Invalid customer ID</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate('/masters/customers/list')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Customers
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Customer Addresses</h1>
            <p className="text-gray-600">
              {customer ? `${customer.customer_name} (${customer.customer_code})` : 'Loading...'}
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Addresses
                </CardTitle>
                <CardDescription>Manage customer shipping and billing addresses</CardDescription>
              </div>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={openAddDialog}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Address
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>
                      {editingAddress ? 'Edit Address' : 'Add Address'}
                    </DialogTitle>
                    <DialogDescription>
                      {editingAddress ? 'Update the address details' : 'Enter the new address details'}
                    </DialogDescription>
                  </DialogHeader>
                  
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="address_type">Address Type *</Label>
                        <Select
                          value={formData.address_type}
                          onValueChange={(value) => handleInputChange('address_type', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select address type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="billing">Billing</SelectItem>
                            <SelectItem value="shipping">Shipping</SelectItem>
                            <SelectItem value="both">Both</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="address_title">Address Title</Label>
                        <Input
                          id="address_title"
                          value={formData.address_title}
                          onChange={(e) => handleInputChange('address_title', e.target.value)}
                          placeholder="e.g., Head Office, Warehouse"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="address_line1">Address Line 1 *</Label>
                      <Input
                        id="address_line1"
                        value={formData.address_line1}
                        onChange={(e) => handleInputChange('address_line1', e.target.value)}
                        placeholder="Enter address line 1"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="address_line2">Address Line 2</Label>
                      <Input
                        id="address_line2"
                        value={formData.address_line2}
                        onChange={(e) => handleInputChange('address_line2', e.target.value)}
                        placeholder="Enter address line 2"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="city">City *</Label>
                        <Input
                          id="city"
                          value={formData.city}
                          onChange={(e) => handleInputChange('city', e.target.value)}
                          placeholder="Enter city"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="state">State *</Label>
                        <Input
                          id="state"
                          value={formData.state}
                          onChange={(e) => handleInputChange('state', e.target.value)}
                          placeholder="Enter state"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="country">Country</Label>
                        <Input
                          id="country"
                          value={formData.country}
                          onChange={(e) => handleInputChange('country', e.target.value)}
                          placeholder="Enter country"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="pin_code">Pin Code *</Label>
                        <Input
                          id="pin_code"
                          value={formData.pin_code}
                          onChange={(e) => handleInputChange('pin_code', e.target.value)}
                          placeholder="Enter pin code"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone</Label>
                        <Input
                          id="phone"
                          value={formData.phone}
                          onChange={(e) => handleInputChange('phone', e.target.value)}
                          placeholder="Enter phone number"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                          placeholder="Enter email"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="gps_coordinates">GPS Coordinates</Label>
                      <Input
                        id="gps_coordinates"
                        value={formData.gps_coordinates}
                        onChange={(e) => handleInputChange('gps_coordinates', e.target.value)}
                        placeholder="e.g., 12.9716,77.5946"
                      />
                    </div>

                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="is_default"
                          checked={formData.is_default}
                          onCheckedChange={(checked) => handleInputChange('is_default', checked)}
                        />
                        <Label htmlFor="is_default">Default Address</Label>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Switch
                          id="is_active"
                          checked={formData.is_active}
                          onCheckedChange={(checked) => handleInputChange('is_active', checked)}
                        />
                        <Label htmlFor="is_active">Active</Label>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-4">
                      <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? 'Saving...' : editingAddress ? 'Update Address' : 'Add Address'}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsDialogOpen(false)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center h-32">
                <div className="text-center">Loading addresses...</div>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Address</TableHead>
                    <TableHead>City</TableHead>
                    <TableHead>State</TableHead>
                    <TableHead>Pin Code</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {addresses?.map((address) => (
                    <TableRow key={address.address_id}>
                      <TableCell>
                        <Badge variant="outline">
                          {address.address_type}
                        </Badge>
                      </TableCell>
                      <TableCell>{address.address_title || '-'}</TableCell>
                      <TableCell>
                        <div className="max-w-xs">
                          {address.address_line1}
                          {address.address_line2 && <br />}
                          {address.address_line2}
                        </div>
                      </TableCell>
                      <TableCell>{address.city}</TableCell>
                      <TableCell>{address.state}</TableCell>
                      <TableCell>{address.pin_code}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Badge variant={address.is_active ? "default" : "secondary"}>
                            {address.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                          {address.is_default && (
                            <Badge variant="outline">Default</Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditDialog(address)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(address.address_id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {addresses?.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center text-gray-500 py-8">
                        No addresses found. Click "Add Address" to create one.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default CustomerAddresses;
