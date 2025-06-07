
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Upload, Save, ArrowLeft } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface CompanyFormData {
  company_code: string;
  company_name: string;
  business_type: string;
  registration_number: string;
  pan_number: string;
  gst_number: string;
  address_line1: string;
  address_line2: string;
  city: string;
  state: string;
  country: string;
  pin_code: string;
  phone: string;
  email: string;
  website: string;
  logo_path: string;
  digital_signature_path: string;
  financial_year_start: Date | null;
  default_currency: string;
  decimal_places_amount: number;
  decimal_places_quantity: number;
  decimal_places_rate: number;
}

const CompanyEdit = () => {
  const { companyId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isNew = companyId === 'new';

  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<CompanyFormData>({
    company_code: '',
    company_name: '',
    business_type: 'private_limited',
    registration_number: '',
    pan_number: '',
    gst_number: '',
    address_line1: '',
    address_line2: '',
    city: '',
    state: '',
    country: 'India',
    pin_code: '',
    phone: '',
    email: '',
    website: '',
    logo_path: '',
    digital_signature_path: '',
    financial_year_start: null,
    default_currency: 'INR',
    decimal_places_amount: 2,
    decimal_places_quantity: 3,
    decimal_places_rate: 4,
  });

  useEffect(() => {
    if (!isNew && companyId) {
      fetchCompany();
    }
  }, [companyId, isNew]);

  const fetchCompany = async () => {
    if (!companyId || companyId === 'new') return;
    
    try {
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .eq('company_id', parseInt(companyId))
        .single();

      if (error) throw error;

      setFormData({
        ...data,
        financial_year_start: data.financial_year_start ? new Date(data.financial_year_start) : null,
      });
    } catch (error) {
      console.error('Error fetching company:', error);
      toast({
        title: "Error",
        description: "Failed to fetch company details",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof CompanyFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFileUpload = async (file: File, field: 'logo_path' | 'digital_signature_path') => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${field}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('company-files')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('company-files')
        .getPublicUrl(filePath);

      handleInputChange(field, data.publicUrl);

      toast({
        title: "Success",
        description: "File uploaded successfully",
      });
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Error",
        description: "Failed to upload file",
        variant: "destructive",
      });
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const saveData = {
        ...formData,
        financial_year_start: formData.financial_year_start?.toISOString().split('T')[0] || null,
      };

      if (isNew) {
        const { error } = await supabase
          .from('companies')
          .insert(saveData);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('companies')
          .update(saveData)
          .eq('company_id', parseInt(companyId!));

        if (error) throw error;
      }

      toast({
        title: "Success",
        description: `Company ${isNew ? 'created' : 'updated'} successfully`,
      });

      navigate('/settings/company');
    } catch (error) {
      console.error('Save error:', error);
      toast({
        title: "Error",
        description: `Failed to ${isNew ? 'create' : 'update'} company`,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="outline" size="sm" onClick={() => navigate('/settings/company')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                {isNew ? 'Create Company' : 'Edit Company'}
              </h1>
              <p className="text-slate-600">
                {isNew ? 'Set up a new company profile' : 'Update company information and settings'}
              </p>
            </div>
          </div>
          <Button onClick={handleSave} disabled={saving}>
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>

        <Tabs defaultValue="basic" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="basic">Basic Details</TabsTrigger>
            <TabsTrigger value="financial">Financial Settings</TabsTrigger>
            <TabsTrigger value="tax">Tax Configuration</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Company Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="company_code">Company Code *</Label>
                    <Input
                      id="company_code"
                      value={formData.company_code}
                      onChange={(e) => handleInputChange('company_code', e.target.value)}
                      placeholder="Enter unique company code"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="company_name">Company Name *</Label>
                    <Input
                      id="company_name"
                      value={formData.company_name}
                      onChange={(e) => handleInputChange('company_name', e.target.value)}
                      placeholder="Enter company name"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="business_type">Business Type</Label>
                    <Select
                      value={formData.business_type}
                      onValueChange={(value) => handleInputChange('business_type', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sole_proprietorship">Sole Proprietorship</SelectItem>
                        <SelectItem value="partnership">Partnership</SelectItem>
                        <SelectItem value="private_limited">Private Limited</SelectItem>
                        <SelectItem value="public_limited">Public Limited</SelectItem>
                        <SelectItem value="llp">LLP</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="registration_number">Registration Number</Label>
                    <Input
                      id="registration_number"
                      value={formData.registration_number}
                      onChange={(e) => handleInputChange('registration_number', e.target.value)}
                      placeholder="Enter registration number"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="pan_number">PAN Number</Label>
                    <Input
                      id="pan_number"
                      value={formData.pan_number}
                      onChange={(e) => handleInputChange('pan_number', e.target.value)}
                      placeholder="Enter PAN number"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gst_number">GST Number</Label>
                  <Input
                    id="gst_number"
                    value={formData.gst_number}
                    onChange={(e) => handleInputChange('gst_number', e.target.value)}
                    placeholder="Enter GST number"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Address Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="address_line1">Address Line 1</Label>
                  <Input
                    id="address_line1"
                    value={formData.address_line1}
                    onChange={(e) => handleInputChange('address_line1', e.target.value)}
                    placeholder="Enter address line 1"
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
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      value={formData.city}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                      placeholder="Enter city"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state">State</Label>
                    <Input
                      id="state"
                      value={formData.state}
                      onChange={(e) => handleInputChange('state', e.target.value)}
                      placeholder="Enter state"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="pin_code">Pin Code</Label>
                    <Input
                      id="pin_code"
                      value={formData.pin_code}
                      onChange={(e) => handleInputChange('pin_code', e.target.value)}
                      placeholder="Enter pin code"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="country">Country</Label>
                  <Input
                    id="country"
                    value={formData.country}
                    onChange={(e) => handleInputChange('country', e.target.value)}
                    placeholder="Enter country"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                      placeholder="Enter email address"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="website">Website</Label>
                    <Input
                      id="website"
                      value={formData.website}
                      onChange={(e) => handleInputChange('website', e.target.value)}
                      placeholder="Enter website URL"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>File Uploads</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Company Logo</Label>
                    <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center">
                      <Upload className="h-8 w-8 mx-auto text-slate-400 mb-2" />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleFileUpload(file, 'logo_path');
                        }}
                        className="hidden"
                        id="logo-upload"
                      />
                      <label htmlFor="logo-upload" className="cursor-pointer">
                        <Button variant="outline" size="sm" asChild>
                          <span>Upload Logo</span>
                        </Button>
                      </label>
                      {formData.logo_path && (
                        <p className="text-xs text-green-600 mt-2">Logo uploaded</p>
                      )}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Digital Signature</Label>
                    <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center">
                      <Upload className="h-8 w-8 mx-auto text-slate-400 mb-2" />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleFileUpload(file, 'digital_signature_path');
                        }}
                        className="hidden"
                        id="signature-upload"
                      />
                      <label htmlFor="signature-upload" className="cursor-pointer">
                        <Button variant="outline" size="sm" asChild>
                          <span>Upload Signature</span>
                        </Button>
                      </label>
                      {formData.digital_signature_path && (
                        <p className="text-xs text-green-600 mt-2">Signature uploaded</p>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="financial" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Financial Year & Currency</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Financial Year Start</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !formData.financial_year_start && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {formData.financial_year_start ? (
                            format(formData.financial_year_start, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={formData.financial_year_start || undefined}
                          onSelect={(date) => handleInputChange('financial_year_start', date)}
                          initialFocus
                          className="pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="default_currency">Default Currency</Label>
                    <Select
                      value={formData.default_currency}
                      onValueChange={(value) => handleInputChange('default_currency', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="INR">INR (Indian Rupee)</SelectItem>
                        <SelectItem value="USD">USD (US Dollar)</SelectItem>
                        <SelectItem value="EUR">EUR (Euro)</SelectItem>
                        <SelectItem value="GBP">GBP (British Pound)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Decimal Places Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="decimal_places_amount">Amount Decimal Places</Label>
                    <Input
                      id="decimal_places_amount"
                      type="number"
                      min="0"
                      max="6"
                      value={formData.decimal_places_amount}
                      onChange={(e) => handleInputChange('decimal_places_amount', parseInt(e.target.value))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="decimal_places_quantity">Quantity Decimal Places</Label>
                    <Input
                      id="decimal_places_quantity"
                      type="number"
                      min="0"
                      max="6"
                      value={formData.decimal_places_quantity}
                      onChange={(e) => handleInputChange('decimal_places_quantity', parseInt(e.target.value))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="decimal_places_rate">Rate Decimal Places</Label>
                    <Input
                      id="decimal_places_rate"
                      type="number"
                      min="0"
                      max="6"
                      value={formData.decimal_places_rate}
                      onChange={(e) => handleInputChange('decimal_places_rate', parseInt(e.target.value))}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tax" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>GST Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-sm text-slate-600 mb-4">
                  GST Number: {formData.gst_number || 'Not set'}
                </div>
                <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                  <div>
                    <h4 className="font-medium text-slate-900">Tax Configuration Setup</h4>
                    <p className="text-sm text-slate-600">
                      Set up detailed tax rates, HSN codes, and exemption categories
                    </p>
                  </div>
                  <Button variant="outline" onClick={() => navigate('/settings/tax-configurations')}>
                    Configure Tax Settings
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default CompanyEdit;
