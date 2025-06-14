
import { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { Customer, CustomerFormData } from "@/types/customer";
import CustomerBasicInfo from "@/components/customer/CustomerBasicInfo";
import CustomerAddress from "@/components/customer/CustomerAddress";

const CustomerEdit = () => {
  const { customerId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isViewMode = searchParams.get('mode') === 'view';
  const isEditMode = !!customerId && !isViewMode;
  const { toast } = useToast();
  const { user } = useAuth();

  const [formData, setFormData] = useState<CustomerFormData>({
    // Basic Identifiers
    customer_code: '',
    customer_name: '',
    contact_person: '',
    mobile_phone: '',
    telephone_no: '',
    whatsapp_number: '',

    // Address Section
    address_line1: '',
    address_line2: '',
    town_city: '',
    district: '',
    state: '',
    pincode: '',
    country: 'India',

    // Identification/Registration
    gstin: '',
    pan_number: '',
    aadhar_number: '',
    uin_number: '',
    udyog_adhar: '',
    fssai_number: '',

    // Licensing & Transport
    drug_license_no: '',
    dl_upto: '',
    transport_details: '',
    transport_gstin: '',
    other_country: false,
    currency: 'INR',

    // Banking & Payment Terms
    payment_terms: 'NET 30',
    bank_account: '',
    ifsc_code: '',
    max_credit_limit: 0,
    credit_site_days: 0,
    locking_days: 0,
    int_percentage: 0,
    freight_charge: 0,
    no_of_bills: 0,
    discount_amount: 0,
    discount_within_days: 0,
    default_return_days: 0,
    
    // Opening Balances & Sundry Debitor Flag
    opening_balance_dr: 0,
    opening_balance_cr: 0,
    sundry_debitor: false,

    // Additional Flags & Options
    tds_applicable: false,
    allow_credit: true,
    show_due_bills: false,
    institute_sub_dealer: false,
    allow_discount_on_bill: false,
    discontinue_sleep: false,
    out_of_state: false,
    govt_no_tcs: false,
    auto_interest: false,
    hard_lock: false,
    order_challan: false,

    // Area/Line/Camp Grid (Locate Tab)
    line_area_camp: '',
    dl_no1: '',
    dl_no2: '',
    dl_no3: '',
    tin_number: '',
    srin_number: '',
    locate_cr_site_days: 0,
    locate_locking_days: 0,
    locate_credit_limit: 0,
    locate_discount: 0,
    
    // Metadata
    is_active: true,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch customer data for editing
  const { data: customer, isLoading } = useQuery({
    queryKey: ['customer', customerId],
    queryFn: async (): Promise<Customer | null> => {
      if (!customerId) return null;
      
      console.log('Fetching customer:', customerId);
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .eq('customer_id', customerId)
        .single();

      if (error) {
        console.error('Error fetching customer:', error);
        throw error;
      }

      console.log('Fetched customer data:', data);
      return data;
    },
    enabled: !!customerId,
  });

  useEffect(() => {
    if (customer) {
      setFormData({
        customer_code: customer.customer_code || '',
        customer_name: customer.customer_name || '',
        contact_person: customer.contact_person || '',
        mobile_phone: customer.mobile_phone || '',
        telephone_no: customer.telephone_no || '',
        whatsapp_number: customer.whatsapp_number || '',
        address_line1: customer.address_line1 || '',
        address_line2: customer.address_line2 || '',
        town_city: customer.town_city || '',
        district: customer.district || '',
        state: customer.state || '',
        pincode: customer.pincode || '',
        country: customer.country || 'India',
        gstin: customer.gstin || '',
        pan_number: customer.pan_number || '',
        aadhar_number: customer.aadhar_number || '',
        uin_number: customer.uin_number || '',
        udyog_adhar: customer.udyog_adhar || '',
        fssai_number: customer.fssai_number || '',
        drug_license_no: customer.drug_license_no || '',
        dl_upto: customer.dl_upto || '',
        transport_details: customer.transport_details || '',
        transport_gstin: customer.transport_gstin || '',
        other_country: customer.other_country || false,
        currency: customer.currency || 'INR',
        payment_terms: customer.payment_terms || 'NET 30',
        bank_account: customer.bank_account || '',
        ifsc_code: customer.ifsc_code || '',
        max_credit_limit: customer.max_credit_limit || 0,
        credit_site_days: customer.credit_site_days || 0,
        locking_days: customer.locking_days || 0,
        int_percentage: customer.int_percentage || 0,
        freight_charge: customer.freight_charge || 0,
        no_of_bills: customer.no_of_bills || 0,
        discount_amount: customer.discount_amount || 0,
        discount_within_days: customer.discount_within_days || 0,
        default_return_days: customer.default_return_days || 0,
        opening_balance_dr: customer.opening_balance_dr || 0,
        opening_balance_cr: customer.opening_balance_cr || 0,
        sundry_debitor: customer.sundry_debitor || false,
        tds_applicable: customer.tds_applicable || false,
        allow_credit: customer.allow_credit !== false,
        show_due_bills: customer.show_due_bills || false,
        institute_sub_dealer: customer.institute_sub_dealer || false,
        allow_discount_on_bill: customer.allow_discount_on_bill || false,
        discontinue_sleep: customer.discontinue_sleep || false,
        out_of_state: customer.out_of_state || false,
        govt_no_tcs: customer.govt_no_tcs || false,
        auto_interest: customer.auto_interest || false,
        hard_lock: customer.hard_lock || false,
        order_challan: customer.order_challan || false,
        line_area_camp: customer.line_area_camp || '',
        dl_no1: customer.dl_no1 || '',
        dl_no2: customer.dl_no2 || '',
        dl_no3: customer.dl_no3 || '',
        tin_number: customer.tin_number || '',
        srin_number: customer.srin_number || '',
        locate_cr_site_days: customer.locate_cr_site_days || 0,
        locate_locking_days: customer.locate_locking_days || 0,
        locate_credit_limit: customer.locate_credit_limit || 0,
        locate_discount: customer.locate_discount || 0,
        is_active: customer.is_active !== false,
      });
    }
  }, [customer]);

  const handleInputChange = (field: keyof CustomerFormData, value: string | boolean | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateForm = () => {
    if (!formData.customer_code.trim()) {
      toast({
        title: "Validation Error",
        description: "Customer Code is required",
        variant: "destructive",
      });
      return false;
    }

    if (!formData.customer_name.trim()) {
      toast({
        title: "Validation Error",
        description: "Customer Name is required",
        variant: "destructive",
      });
      return false;
    }

    if (!formData.contact_person.trim()) {
      toast({
        title: "Validation Error",
        description: "Contact Person is required",
        variant: "destructive",
      });
      return false;
    }

    if (!formData.mobile_phone.trim()) {
      toast({
        title: "Validation Error",
        description: "Mobile Phone is required",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to save customers",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const saveData = {
        company_id: 1,
        customer_code: formData.customer_code.trim(),
        customer_name: formData.customer_name.trim(),
        contact_person: formData.contact_person.trim(),
        mobile_phone: formData.mobile_phone.trim(),
        telephone_no: formData.telephone_no.trim() || null,
        whatsapp_number: formData.whatsapp_number.trim() || null,
        address_line1: formData.address_line1.trim(),
        address_line2: formData.address_line2.trim() || null,
        town_city: formData.town_city.trim(),
        district: formData.district.trim(),
        state: formData.state.trim(),
        pincode: formData.pincode.trim(),
        country: formData.country.trim(),
        gstin: formData.gstin.trim() || null,
        pan_number: formData.pan_number.trim() || null,
        aadhar_number: formData.aadhar_number.trim() || null,
        uin_number: formData.uin_number.trim() || null,
        udyog_adhar: formData.udyog_adhar.trim() || null,
        fssai_number: formData.fssai_number.trim() || null,
        drug_license_no: formData.drug_license_no.trim() || null,
        dl_upto: formData.dl_upto || null,
        transport_details: formData.transport_details.trim() || null,
        transport_gstin: formData.transport_gstin.trim() || null,
        other_country: formData.other_country,
        currency: formData.currency,
        payment_terms: formData.payment_terms,
        bank_account: formData.bank_account.trim() || null,
        ifsc_code: formData.ifsc_code.trim() || null,
        max_credit_limit: formData.max_credit_limit,
        credit_site_days: formData.credit_site_days,
        locking_days: formData.locking_days,
        int_percentage: formData.int_percentage,
        freight_charge: formData.freight_charge,
        no_of_bills: formData.no_of_bills,
        discount_amount: formData.discount_amount,
        discount_within_days: formData.discount_within_days,
        default_return_days: formData.default_return_days,
        opening_balance_dr: formData.opening_balance_dr,
        opening_balance_cr: formData.opening_balance_cr,
        sundry_debitor: formData.sundry_debitor,
        tds_applicable: formData.tds_applicable,
        allow_credit: formData.allow_credit,
        show_due_bills: formData.show_due_bills,
        institute_sub_dealer: formData.institute_sub_dealer,
        allow_discount_on_bill: formData.allow_discount_on_bill,
        discontinue_sleep: formData.discontinue_sleep,
        out_of_state: formData.out_of_state,
        govt_no_tcs: formData.govt_no_tcs,
        auto_interest: formData.auto_interest,
        hard_lock: formData.hard_lock,
        order_challan: formData.order_challan,
        line_area_camp: formData.line_area_camp.trim() || null,
        dl_no1: formData.dl_no1.trim() || null,
        dl_no2: formData.dl_no2.trim() || null,
        dl_no3: formData.dl_no3.trim() || null,
        tin_number: formData.tin_number.trim() || null,
        srin_number: formData.srin_number.trim() || null,
        locate_cr_site_days: formData.locate_cr_site_days || null,
        locate_locking_days: formData.locate_locking_days || null,
        locate_credit_limit: formData.locate_credit_limit || null,
        locate_discount: formData.locate_discount || null,
        is_active: formData.is_active,
        created_by: parseInt(user.id),
      };

      console.log('Saving customer data:', saveData);

      let result;
      if (isEditMode && customerId) {
        result = await supabase
          .from('customers')
          .update(saveData)
          .eq('customer_id', customerId);
      } else {
        result = await supabase
          .from('customers')
          .insert(saveData);
      }

      if (result.error) throw result.error;

      toast({
        title: "Success",
        description: `Customer ${isEditMode ? 'updated' : 'created'} successfully`,
      });

      navigate('/masters/customers/list');
    } catch (error) {
      console.error('Error saving customer:', error);
      toast({
        title: "Error",
        description: `Failed to ${isEditMode ? 'update' : 'create'} customer. Please try again.`,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (customerId && isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">Loading customer...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-4 md:px-8 py-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={() => navigate('/masters/customers/list')}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <CardTitle>{isEditMode ? 'Edit Customer' : isViewMode ? 'View Customer' : 'Add Customer'}</CardTitle>
                <CardDescription>
                  {isEditMode ? 'Update customer information' : isViewMode ? 'View customer details' : 'Create a new customer'}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <Tabs defaultValue="basic" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="basic">Basic Information</TabsTrigger>
                  <TabsTrigger value="address">Address</TabsTrigger>
                </TabsList>
                
                <TabsContent value="basic" className="space-y-6">
                  <CustomerBasicInfo
                    formData={formData}
                    handleInputChange={handleInputChange}
                    isViewMode={isViewMode}
                  />
                </TabsContent>
                
                <TabsContent value="address" className="space-y-6">
                  <CustomerAddress
                    formData={formData}
                    handleInputChange={handleInputChange}
                    isViewMode={isViewMode}
                  />
                </TabsContent>
              </Tabs>

              <div className="flex items-center space-x-2 pt-6">
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => handleInputChange('is_active', checked)}
                  disabled={isViewMode}
                />
                <Label htmlFor="is_active">Active</Label>
              </div>

              {!isViewMode && (
                <div className="flex gap-4 pt-6">
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Saving...' : isEditMode ? 'Update Customer' : 'Create Customer'}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => navigate('/masters/customers/list')}>
                    Cancel
                  </Button>
                </div>
              )}
            </form>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default CustomerEdit;
