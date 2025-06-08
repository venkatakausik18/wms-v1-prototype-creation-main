import { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import Layout from "@/components/Layout";
import { ArrowLeft, Save, User, Building2 } from "lucide-react";
import { Label } from "@/components/ui/label";

interface VendorFormData {
  vendor_code: string;
  vendor_name: string;
  contact_person: string;
  primary_phone: string;
  secondary_phone: string;
  email: string;
  website: string;
  registration_date: string;
  business_license_number: string;
  gst_number: string;
  pan_number: string;
  import_export_license: string;
  quality_certifications: string;
  vendor_category: string;
  payment_terms: string;
  credit_period: number;
  advance_payment_required: boolean;
  currency: string;
  bank_name: string;
  bank_account_number: string;
  bank_ifsc: string;
  bank_address: string;
  tds_category: string;
  tcs_applicable: boolean;
  quality_rating: number;
  delivery_rating: number;
  service_rating: number;
  overall_rating: number;
  is_blacklisted: boolean;
  is_preferred: boolean;
  address_line1: string;
  address_line2: string;
  city: string;
  state: string;
  country: string;
  pin_code: string;
  special_instructions: string;
  is_active: boolean;
  vendor_type: "local" | "import" | "service";
}

const VendorEdit = () => {
  const { vendorId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isViewMode = searchParams.get('mode') === 'view';
  const isEditMode = !!vendorId && !isViewMode;
  const { user } = useAuth();
  const [formData, setFormData] = useState<VendorFormData>({
    vendor_code: '',
    vendor_name: '',
    contact_person: '',
    primary_phone: '',
    secondary_phone: '',
    email: '',
    website: '',
    registration_date: '',
    business_license_number: '',
    gst_number: '',
    pan_number: '',
    import_export_license: '',
    quality_certifications: '',
    vendor_category: '',
    payment_terms: '',
    credit_period: 0,
    advance_payment_required: false,
    currency: 'INR',
    bank_name: '',
    bank_account_number: '',
    bank_ifsc: '',
    bank_address: '',
    tds_category: '',
    tcs_applicable: false,
    quality_rating: 0,
    delivery_rating: 0,
    service_rating: 0,
    overall_rating: 0,
    is_blacklisted: false,
    is_preferred: false,
    address_line1: '',
    address_line2: '',
    city: '',
    state: '',
    country: '',
    pin_code: '',
    special_instructions: '',
    is_active: true,
    vendor_type: 'local',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [company, setCompany] = useState<any>(null);

  useEffect(() => {
    if (isEditMode && vendorId) {
      fetchVendor();
    }
    const fetchCompany = async () => {
      const { data, error } = await supabase
        .from('companies')
        .select('company_id, company_name, company_code')
        .single();
      if (!error) setCompany(data);
    };
    fetchCompany();
    // eslint-disable-next-line
  }, [isEditMode, vendorId]);

  const fetchVendor = async () => {
    const { data, error } = await supabase
      .from('vendors')
      .select('*')
      .eq('vendor_id', Number(vendorId))
      .single();
    if (error) {
      toast.error('Failed to fetch vendor');
      return;
    }
    setFormData({
      ...formData,
      ...data,
    });
  };

  const handleInputChange = (field: keyof VendorFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error('You must be logged in to save vendors');
      return;
    }
    setIsSubmitting(true);
    try {
      let vendorCode = formData.vendor_code;
      if (!vendorCode) {
        // Auto-generate vendor code: <company_code>-VND-<4 digit>
        const { data: company } = await supabase.from('companies').select('company_code').eq('company_id', 1).single();
        const { data: lastVendor } = await supabase.from('vendors').select('vendor_id').order('vendor_id', { ascending: false }).limit(1);
        const nextId = (lastVendor?.[0]?.vendor_id || 0) + 1;
        vendorCode = `${company.company_code}-VND-${String(nextId).padStart(4, '0')}`;
      }
      const payload = {
        ...formData,
        vendor_code: vendorCode,
        company_id: 1,
        created_by: Number(user.id),
      };
      let result;
      if (isEditMode) {
        result = await supabase.from('vendors').update(payload).eq('vendor_id', Number(vendorId));
      } else {
        result = await supabase.from('vendors').insert([payload]);
      }
      if (result.error) throw result.error;
      toast.success(`Vendor ${isEditMode ? 'updated' : 'created'} successfully`);
      navigate('/masters/vendors/list');
    } catch (error) {
      toast.error('Failed to save vendor');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-4 md:px-8 py-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={() => navigate('/masters/vendors/list')}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <CardTitle>{isEditMode ? 'Edit Vendor' : isViewMode ? 'View Vendor' : 'Add Vendor'}</CardTitle>
                <CardDescription>
                  {company ? `${company.company_name} (${company.company_code})` : 'Loading...'}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="vendor_code">Vendor Code</Label>
                  <Input id="vendor_code" value={formData.vendor_code} onChange={e => handleInputChange('vendor_code', e.target.value)} placeholder="Auto-generated or enter manually" disabled={isEditMode || isViewMode} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="vendor_name">Vendor Name</Label>
                  <Input id="vendor_name" value={formData.vendor_name} onChange={e => handleInputChange('vendor_name', e.target.value)} required disabled={isViewMode} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contact_person">Contact Person</Label>
                  <Input id="contact_person" value={formData.contact_person} onChange={e => handleInputChange('contact_person', e.target.value)} disabled={isViewMode} />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-2">
                    <Label htmlFor="primary_phone">Primary Phone</Label>
                    <Input id="primary_phone" value={formData.primary_phone} onChange={e => handleInputChange('primary_phone', e.target.value)} required disabled={isViewMode} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="secondary_phone">Secondary Phone</Label>
                    <Input id="secondary_phone" value={formData.secondary_phone} onChange={e => handleInputChange('secondary_phone', e.target.value)} disabled={isViewMode} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" value={formData.email} onChange={e => handleInputChange('email', e.target.value)} disabled={isViewMode} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <Input id="website" value={formData.website} onChange={e => handleInputChange('website', e.target.value)} disabled={isViewMode} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="registration_date">Registration Date</Label>
                  <Input id="registration_date" type="date" value={formData.registration_date} onChange={e => handleInputChange('registration_date', e.target.value)} disabled={isViewMode} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="business_license_number">Business License Number</Label>
                  <Input id="business_license_number" value={formData.business_license_number} onChange={e => handleInputChange('business_license_number', e.target.value)} disabled={isViewMode} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gst_number">GST Number</Label>
                  <Input id="gst_number" value={formData.gst_number} onChange={e => handleInputChange('gst_number', e.target.value)} disabled={isViewMode} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pan_number">PAN Number</Label>
                  <Input id="pan_number" value={formData.pan_number} onChange={e => handleInputChange('pan_number', e.target.value)} disabled={isViewMode} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="import_export_license">Import/Export License</Label>
                  <Input id="import_export_license" value={formData.import_export_license} onChange={e => handleInputChange('import_export_license', e.target.value)} disabled={isViewMode} />
                </div>
                <div className="space-y-2 col-span-2">
                  <Label htmlFor="quality_certifications">Quality Certifications</Label>
                  <Textarea id="quality_certifications" value={formData.quality_certifications} onChange={e => handleInputChange('quality_certifications', e.target.value)} disabled={isViewMode} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="vendor_category">Vendor Category</Label>
                  <Input id="vendor_category" value={formData.vendor_category} onChange={e => handleInputChange('vendor_category', e.target.value)} disabled={isViewMode} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="payment_terms">Payment Terms</Label>
                  <Input id="payment_terms" value={formData.payment_terms} onChange={e => handleInputChange('payment_terms', e.target.value)} disabled={isViewMode} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="credit_period">Credit Period</Label>
                  <Input id="credit_period" type="number" value={formData.credit_period} onChange={e => handleInputChange('credit_period', Number(e.target.value))} disabled={isViewMode} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currency">Currency</Label>
                  <Input id="currency" value={formData.currency} onChange={e => handleInputChange('currency', e.target.value)} disabled={isViewMode} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bank_name">Bank Name</Label>
                  <Input id="bank_name" value={formData.bank_name} onChange={e => handleInputChange('bank_name', e.target.value)} disabled={isViewMode} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bank_account_number">Bank Account Number</Label>
                  <Input id="bank_account_number" value={formData.bank_account_number} onChange={e => handleInputChange('bank_account_number', e.target.value)} disabled={isViewMode} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bank_ifsc">Bank IFSC</Label>
                  <Input id="bank_ifsc" value={formData.bank_ifsc} onChange={e => handleInputChange('bank_ifsc', e.target.value)} disabled={isViewMode} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bank_address">Bank Address</Label>
                  <Input id="bank_address" value={formData.bank_address} onChange={e => handleInputChange('bank_address', e.target.value)} disabled={isViewMode} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tds_category">TDS Category</Label>
                  <Input id="tds_category" value={formData.tds_category} onChange={e => handleInputChange('tds_category', e.target.value)} disabled={isViewMode} />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex items-center gap-2">
                    <Switch id="advance_payment_required" checked={formData.advance_payment_required} onCheckedChange={val => handleInputChange('advance_payment_required', val)} disabled={isViewMode} />
                    <label htmlFor="advance_payment_required">Advance Payment Required</label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch id="tcs_applicable" checked={formData.tcs_applicable} onCheckedChange={val => handleInputChange('tcs_applicable', val)} disabled={isViewMode} />
                    <label htmlFor="tcs_applicable">TCS Applicable</label>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex items-center gap-2">
                    <Switch id="is_active" checked={formData.is_active} onCheckedChange={val => handleInputChange('is_active', val)} disabled={isViewMode} />
                    <label htmlFor="is_active">Active</label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch id="is_preferred" checked={formData.is_preferred} onCheckedChange={val => handleInputChange('is_preferred', val)} disabled={isViewMode} />
                    <label htmlFor="is_preferred">Preferred</label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch id="is_blacklisted" checked={formData.is_blacklisted} onCheckedChange={val => handleInputChange('is_blacklisted', val)} disabled={isViewMode} />
                    <label htmlFor="is_blacklisted">Blacklisted</label>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-2">
                    <Label htmlFor="quality_rating">Quality Rating (0-5)</Label>
                    <Input id="quality_rating" type="number" min={0} max={5} value={formData.quality_rating} onChange={e => handleInputChange('quality_rating', Number(e.target.value))} disabled={isViewMode} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="delivery_rating">Delivery Rating (0-5)</Label>
                    <Input id="delivery_rating" type="number" min={0} max={5} value={formData.delivery_rating} onChange={e => handleInputChange('delivery_rating', Number(e.target.value))} disabled={isViewMode} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="service_rating">Service Rating (0-5)</Label>
                    <Input id="service_rating" type="number" min={0} max={5} value={formData.service_rating} onChange={e => handleInputChange('service_rating', Number(e.target.value))} disabled={isViewMode} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="overall_rating">Overall Rating (0-5)</Label>
                    <Input id="overall_rating" type="number" min={0} max={5} value={formData.overall_rating} onChange={e => handleInputChange('overall_rating', Number(e.target.value))} disabled={isViewMode} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-2">
                    <Label htmlFor="address_line1">Address Line 1</Label>
                    <Input id="address_line1" value={formData.address_line1} onChange={e => handleInputChange('address_line1', e.target.value)} disabled={isViewMode} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address_line2">Address Line 2</Label>
                    <Input id="address_line2" value={formData.address_line2} onChange={e => handleInputChange('address_line2', e.target.value)} disabled={isViewMode} />
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input id="city" value={formData.city} onChange={e => handleInputChange('city', e.target.value)} disabled={isViewMode} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state">State</Label>
                    <Input id="state" value={formData.state} onChange={e => handleInputChange('state', e.target.value)} disabled={isViewMode} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="country">Country</Label>
                    <Input id="country" value={formData.country} onChange={e => handleInputChange('country', e.target.value)} disabled={isViewMode} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="pin_code">Pin Code</Label>
                    <Input id="pin_code" value={formData.pin_code} onChange={e => handleInputChange('pin_code', e.target.value)} disabled={isViewMode} />
                  </div>
                </div>
                <div className="col-span-2">
                  <Label htmlFor="special_instructions">Special Instructions</Label>
                  <Textarea id="special_instructions" value={formData.special_instructions} onChange={e => handleInputChange('special_instructions', e.target.value)} disabled={isViewMode} />
                </div>
                <div className="col-span-2">
                  <Label htmlFor="vendor_type">Vendor Type</Label>
                  <Select value={formData.vendor_type} onValueChange={val => handleInputChange('vendor_type', val as VendorFormData['vendor_type'])} disabled={isViewMode}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Vendor Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="local">Local</SelectItem>
                      <SelectItem value="import">Import</SelectItem>
                      <SelectItem value="service">Service</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex gap-4 pt-6">
                <Button type="submit" disabled={isSubmitting}>
                  <Save className="h-4 w-4 mr-2" />
                  {isSubmitting ? 'Saving...' : isEditMode ? 'Update Vendor' : 'Create Vendor'}
                </Button>
                <Button type="button" variant="outline" onClick={() => navigate('/masters/vendors/list')}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default VendorEdit; 