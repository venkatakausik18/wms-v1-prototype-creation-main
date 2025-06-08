
import { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, User, Building, MapPin } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

interface CustomerFormData {
  customer_code: string;
  customer_type: string;
  customer_name: string;
  company_name: string;
  contact_person: string;
  primary_phone: string;
  secondary_phone: string;
  email: string;
  website: string;
  date_of_birth: string;
  date_of_incorporation: string;
  business_type: string;
  gst_number: string;
  pan_number: string;
  state_code: string;
  credit_rating: string;
  payment_terms: string;
  credit_limit: number;
  credit_days: number;
  interest_rate: number;
  discount_percent: number;
  opening_balance: number;
  opening_balance_type: string;
  salesperson_id: number | null;
  territory: string;
  customer_group: string;
  price_list: string;
  preferred_communication: string;
  language_preference: string;
  bank_name: string;
  bank_account_number: string;
  bank_ifsc: string;
  tds_applicable: boolean;
  tds_category: string;
  special_instructions: string;
  is_active: boolean;
}

const CustomerEdit = () => {
  const { customerId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isViewMode = searchParams.get('mode') === 'view';
  const isEditMode = !!customerId && !isViewMode;
  const { toast } = useToast();
  const { user } = useAuth();

  const [formData, setFormData] = useState<CustomerFormData>({
    customer_code: '',
    customer_type: 'individual',
    customer_name: '',
    company_name: '',
    contact_person: '',
    primary_phone: '',
    secondary_phone: '',
    email: '',
    website: '',
    date_of_birth: '',
    date_of_incorporation: '',
    business_type: '',
    gst_number: '',
    pan_number: '',
    state_code: '',
    credit_rating: 'good',
    payment_terms: '',
    credit_limit: 0,
    credit_days: 0,
    interest_rate: 0,
    discount_percent: 0,
    opening_balance: 0,
    opening_balance_type: 'debit',
    salesperson_id: null,
    territory: '',
    customer_group: '',
    price_list: '',
    preferred_communication: 'email',
    language_preference: 'en',
    bank_name: '',
    bank_account_number: '',
    bank_ifsc: '',
    tds_applicable: false,
    tds_category: '',
    special_instructions: '',
    is_active: true,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch customer data for editing
  const { data: customer, isLoading } = useQuery({
    queryKey: ['customer', customerId],
    queryFn: async () => {
      if (!customerId) return null;
      
      console.log('Fetching customer:', customerId);
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .eq('customer_id', parseInt(customerId))
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

  // Fetch salespeople for dropdown
  const { data: salespeople } = useQuery({
    queryKey: ['salespeople'],
    queryFn: async () => {
      console.log('Fetching salespeople');
      const { data, error } = await supabase
        .from('users')
        .select('user_id, first_name, last_name, email')
        .eq('company_id', 1) // You might want to get this from context/auth
        .eq('is_active', true)
        .order('first_name');

      if (error) {
        console.error('Error fetching salespeople:', error);
        throw error;
      }

      return data || [];
    },
  });

  useEffect(() => {
    if (customer) {
      setFormData({
        customer_code: customer.customer_code || '',
        customer_type: customer.customer_type || 'individual',
        customer_name: customer.customer_name || '',
        company_name: customer.company_name || '',
        contact_person: customer.contact_person || '',
        primary_phone: customer.primary_phone || '',
        secondary_phone: customer.secondary_phone || '',
        email: customer.email || '',
        website: customer.website || '',
        date_of_birth: customer.date_of_birth || '',
        date_of_incorporation: customer.date_of_incorporation || '',
        business_type: customer.business_type || '',
        gst_number: customer.gst_number || '',
        pan_number: customer.pan_number || '',
        state_code: customer.state_code || '',
        credit_rating: customer.credit_rating || 'good',
        payment_terms: customer.payment_terms || '',
        credit_limit: customer.credit_limit || 0,
        credit_days: customer.credit_days || 0,
        interest_rate: customer.interest_rate || 0,
        discount_percent: customer.discount_percent || 0,
        opening_balance: customer.opening_balance || 0,
        opening_balance_type: customer.opening_balance_type || 'debit',
        salesperson_id: customer.salesperson_id,
        territory: customer.territory || '',
        customer_group: customer.customer_group || '',
        price_list: customer.price_list || '',
        preferred_communication: customer.preferred_communication || 'email',
        language_preference: customer.language_preference || 'en',
        bank_name: customer.bank_name || '',
        bank_account_number: customer.bank_account_number || '',
        bank_ifsc: customer.bank_ifsc || '',
        tds_applicable: customer.tds_applicable ?? false,
        tds_category: customer.tds_category || '',
        special_instructions: customer.special_instructions || '',
        is_active: customer.is_active ?? true,
      });
    }
  }, [customer]);

  const handleInputChange = (field: keyof CustomerFormData, value: string | boolean | number | null) => {
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

    if (formData.customer_type === 'company' && !formData.company_name.trim()) {
      toast({
        title: "Validation Error",
        description: "Company Name is required for company customers",
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
        company_id: 1, // You might want to get this from context/auth
        customer_code: formData.customer_code.trim(),
        customer_type: formData.customer_type,
        customer_name: formData.customer_name.trim(),
        company_name: formData.company_name.trim() || null,
        contact_person: formData.contact_person.trim() || null,
        primary_phone: formData.primary_phone.trim() || null,
        secondary_phone: formData.secondary_phone.trim() || null,
        email: formData.email.trim() || null,
        website: formData.website.trim() || null,
        date_of_birth: formData.date_of_birth || null,
        date_of_incorporation: formData.date_of_incorporation || null,
        business_type: formData.business_type.trim() || null,
        gst_number: formData.gst_number.trim() || null,
        pan_number: formData.pan_number.trim() || null,
        state_code: formData.state_code.trim() || null,
        credit_rating: formData.credit_rating,
        payment_terms: formData.payment_terms.trim() || null,
        credit_limit: formData.credit_limit,
        credit_days: formData.credit_days,
        interest_rate: formData.interest_rate,
        discount_percent: formData.discount_percent,
        opening_balance: formData.opening_balance,
        opening_balance_type: formData.opening_balance_type,
        salesperson_id: formData.salesperson_id,
        territory: formData.territory.trim() || null,
        customer_group: formData.customer_group.trim() || null,
        price_list: formData.price_list.trim() || null,
        preferred_communication: formData.preferred_communication,
        language_preference: formData.language_preference,
        bank_name: formData.bank_name.trim() || null,
        bank_account_number: formData.bank_account_number.trim() || null,
        bank_ifsc: formData.bank_ifsc.trim() || null,
        tds_applicable: formData.tds_applicable,
        tds_category: formData.tds_category.trim() || null,
        special_instructions: formData.special_instructions.trim() || null,
        is_active: formData.is_active,
        created_by: parseInt(user.id),
      };

      console.log('Saving customer data:', saveData);

      let result;
      if (isEditMode && customerId) {
        result = await supabase
          .from('customers')
          .update(saveData)
          .eq('customer_id', parseInt(customerId));
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

  const getPageTitle = () => {
    if (isViewMode) return 'View Customer';
    if (isEditMode) return 'Edit Customer';
    return 'Add Customer';
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
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate('/masters/customers/list')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Customers
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{getPageTitle()}</h1>
            <p className="text-gray-600">
              {isViewMode ? 'View customer details' : isEditMode ? 'Update customer information' : 'Create a new customer'}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Basic Information
              </CardTitle>
              <CardDescription>
                Enter the customer's basic details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="customer_code">Customer Code *</Label>
                  <Input
                    id="customer_code"
                    value={formData.customer_code}
                    onChange={(e) => handleInputChange('customer_code', e.target.value)}
                    placeholder="Enter customer code"
                    disabled={isViewMode}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="customer_type">Customer Type *</Label>
                  <Select
                    value={formData.customer_type}
                    onValueChange={(value) => handleInputChange('customer_type', value)}
                    disabled={isViewMode}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select customer type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="individual">Individual</SelectItem>
                      <SelectItem value="company">Company</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="customer_name">Customer Name *</Label>
                  <Input
                    id="customer_name"
                    value={formData.customer_name}
                    onChange={(e) => handleInputChange('customer_name', e.target.value)}
                    placeholder="Enter customer name"
                    disabled={isViewMode}
                    required
                  />
                </div>
              </div>

              {formData.customer_type === 'company' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="company_name">Company Name *</Label>
                    <Input
                      id="company_name"
                      value={formData.company_name}
                      onChange={(e) => handleInputChange('company_name', e.target.value)}
                      placeholder="Enter company name"
                      disabled={isViewMode}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contact_person">Contact Person</Label>
                    <Input
                      id="contact_person"
                      value={formData.contact_person}
                      onChange={(e) => handleInputChange('contact_person', e.target.value)}
                      placeholder="Enter contact person"
                      disabled={isViewMode}
                    />
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="primary_phone">Primary Phone</Label>
                  <Input
                    id="primary_phone"
                    value={formData.primary_phone}
                    onChange={(e) => handleInputChange('primary_phone', e.target.value)}
                    placeholder="Enter primary phone"
                    disabled={isViewMode}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="secondary_phone">Secondary Phone</Label>
                  <Input
                    id="secondary_phone"
                    value={formData.secondary_phone}
                    onChange={(e) => handleInputChange('secondary_phone', e.target.value)}
                    placeholder="Enter secondary phone"
                    disabled={isViewMode}
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
                    disabled={isViewMode}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    value={formData.website}
                    onChange={(e) => handleInputChange('website', e.target.value)}
                    placeholder="Enter website"
                    disabled={isViewMode}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="business_type">Business Type</Label>
                  <Input
                    id="business_type"
                    value={formData.business_type}
                    onChange={(e) => handleInputChange('business_type', e.target.value)}
                    placeholder="Enter business type"
                    disabled={isViewMode}
                  />
                </div>
              </div>

              {formData.customer_type === 'individual' ? (
                <div className="space-y-2">
                  <Label htmlFor="date_of_birth">Date of Birth</Label>
                  <Input
                    id="date_of_birth"
                    type="date"
                    value={formData.date_of_birth}
                    onChange={(e) => handleInputChange('date_of_birth', e.target.value)}
                    disabled={isViewMode}
                  />
                </div>
              ) : (
                <div className="space-y-2">
                  <Label htmlFor="date_of_incorporation">Date of Incorporation</Label>
                  <Input
                    id="date_of_incorporation"
                    type="date"
                    value={formData.date_of_incorporation}
                    onChange={(e) => handleInputChange('date_of_incorporation', e.target.value)}
                    disabled={isViewMode}
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Tax & Legal Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                Tax & Legal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="gst_number">GST Number</Label>
                  <Input
                    id="gst_number"
                    value={formData.gst_number}
                    onChange={(e) => handleInputChange('gst_number', e.target.value)}
                    placeholder="Enter GST number"
                    disabled={isViewMode}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pan_number">PAN Number</Label>
                  <Input
                    id="pan_number"
                    value={formData.pan_number}
                    onChange={(e) => handleInputChange('pan_number', e.target.value)}
                    placeholder="Enter PAN number"
                    disabled={isViewMode}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="state_code">State Code</Label>
                  <Input
                    id="state_code"
                    value={formData.state_code}
                    onChange={(e) => handleInputChange('state_code', e.target.value)}
                    placeholder="Enter state code"
                    disabled={isViewMode}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="tds_applicable"
                    checked={formData.tds_applicable}
                    onCheckedChange={(checked) => handleInputChange('tds_applicable', checked)}
                    disabled={isViewMode}
                  />
                  <Label htmlFor="tds_applicable">TDS Applicable</Label>
                </div>

                {formData.tds_applicable && (
                  <div className="space-y-2">
                    <Label htmlFor="tds_category">TDS Category</Label>
                    <Input
                      id="tds_category"
                      value={formData.tds_category}
                      onChange={(e) => handleInputChange('tds_category', e.target.value)}
                      placeholder="Enter TDS category"
                      disabled={isViewMode}
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Credit & Financial Information */}
          <Card>
            <CardHeader>
              <CardTitle>Credit & Financial Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="credit_limit">Credit Limit</Label>
                  <Input
                    id="credit_limit"
                    type="number"
                    value={formData.credit_limit}
                    onChange={(e) => handleInputChange('credit_limit', parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
                    disabled={isViewMode}
                    min="0"
                    step="0.01"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="credit_days">Credit Days</Label>
                  <Input
                    id="credit_days"
                    type="number"
                    value={formData.credit_days}
                    onChange={(e) => handleInputChange('credit_days', parseInt(e.target.value) || 0)}
                    placeholder="0"
                    disabled={isViewMode}
                    min="0"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="interest_rate">Interest Rate (%)</Label>
                  <Input
                    id="interest_rate"
                    type="number"
                    value={formData.interest_rate}
                    onChange={(e) => handleInputChange('interest_rate', parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
                    disabled={isViewMode}
                    min="0"
                    step="0.01"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="discount_percent">Discount (%)</Label>
                  <Input
                    id="discount_percent"
                    type="number"
                    value={formData.discount_percent}
                    onChange={(e) => handleInputChange('discount_percent', parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
                    disabled={isViewMode}
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="opening_balance">Opening Balance</Label>
                  <Input
                    id="opening_balance"
                    type="number"
                    value={formData.opening_balance}
                    onChange={(e) => handleInputChange('opening_balance', parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
                    disabled={isViewMode}
                    step="0.01"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="opening_balance_type">Balance Type</Label>
                  <Select
                    value={formData.opening_balance_type}
                    onValueChange={(value) => handleInputChange('opening_balance_type', value)}
                    disabled={isViewMode}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select balance type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="debit">Debit</SelectItem>
                      <SelectItem value="credit">Credit</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="credit_rating">Credit Rating</Label>
                  <Select
                    value={formData.credit_rating}
                    onValueChange={(value) => handleInputChange('credit_rating', value)}
                    disabled={isViewMode}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select credit rating" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="excellent">Excellent</SelectItem>
                      <SelectItem value="good">Good</SelectItem>
                      <SelectItem value="fair">Fair</SelectItem>
                      <SelectItem value="poor">Poor</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="payment_terms">Payment Terms</Label>
                <Input
                  id="payment_terms"
                  value={formData.payment_terms}
                  onChange={(e) => handleInputChange('payment_terms', e.target.value)}
                  placeholder="Enter payment terms"
                  disabled={isViewMode}
                />
              </div>
            </CardContent>
          </Card>

          {/* Business Information */}
          <Card>
            <CardHeader>
              <CardTitle>Business Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="salesperson_id">Salesperson</Label>
                  <Select
                    value={formData.salesperson_id?.toString() || "none"}
                    onValueChange={(value) => handleInputChange('salesperson_id', value === "none" ? null : parseInt(value))}
                    disabled={isViewMode}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select salesperson" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No Salesperson</SelectItem>
                      {salespeople?.map((person) => (
                        <SelectItem key={person.user_id} value={person.user_id.toString()}>
                          {person.first_name} {person.last_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="territory">Territory</Label>
                  <Input
                    id="territory"
                    value={formData.territory}
                    onChange={(e) => handleInputChange('territory', e.target.value)}
                    placeholder="Enter territory"
                    disabled={isViewMode}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="customer_group">Customer Group</Label>
                  <Input
                    id="customer_group"
                    value={formData.customer_group}
                    onChange={(e) => handleInputChange('customer_group', e.target.value)}
                    placeholder="Enter customer group"
                    disabled={isViewMode}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="price_list">Price List</Label>
                  <Input
                    id="price_list"
                    value={formData.price_list}
                    onChange={(e) => handleInputChange('price_list', e.target.value)}
                    placeholder="Enter price list"
                    disabled={isViewMode}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="preferred_communication">Preferred Communication</Label>
                  <Select
                    value={formData.preferred_communication}
                    onValueChange={(value) => handleInputChange('preferred_communication', value)}
                    disabled={isViewMode}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select communication method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="phone">Phone</SelectItem>
                      <SelectItem value="sms">SMS</SelectItem>
                      <SelectItem value="post">Post</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="language_preference">Language Preference</Label>
                  <Select
                    value={formData.language_preference}
                    onValueChange={(value) => handleInputChange('language_preference', value)}
                    disabled={isViewMode}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="hi">Hindi</SelectItem>
                      <SelectItem value="ta">Tamil</SelectItem>
                      <SelectItem value="te">Telugu</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Banking Information */}
          <Card>
            <CardHeader>
              <CardTitle>Banking Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="bank_name">Bank Name</Label>
                  <Input
                    id="bank_name"
                    value={formData.bank_name}
                    onChange={(e) => handleInputChange('bank_name', e.target.value)}
                    placeholder="Enter bank name"
                    disabled={isViewMode}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bank_account_number">Account Number</Label>
                  <Input
                    id="bank_account_number"
                    value={formData.bank_account_number}
                    onChange={(e) => handleInputChange('bank_account_number', e.target.value)}
                    placeholder="Enter account number"
                    disabled={isViewMode}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bank_ifsc">IFSC Code</Label>
                  <Input
                    id="bank_ifsc"
                    value={formData.bank_ifsc}
                    onChange={(e) => handleInputChange('bank_ifsc', e.target.value)}
                    placeholder="Enter IFSC code"
                    disabled={isViewMode}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Additional Information */}
          <Card>
            <CardHeader>
              <CardTitle>Additional Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="special_instructions">Special Instructions</Label>
                <Textarea
                  id="special_instructions"
                  value={formData.special_instructions}
                  onChange={(e) => handleInputChange('special_instructions', e.target.value)}
                  placeholder="Enter any special instructions"
                  disabled={isViewMode}
                  rows={4}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => handleInputChange('is_active', checked)}
                  disabled={isViewMode}
                />
                <Label htmlFor="is_active">Active</Label>
              </div>
            </CardContent>
          </Card>

          {!isViewMode && (
            <div className="flex gap-4 pt-6">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : isEditMode ? 'Update Customer' : 'Create Customer'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/masters/customers/list')}
              >
                Cancel
              </Button>
              {customerId && !isViewMode && (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => navigate(`/masters/customers/${customerId}/addresses`)}
                >
                  <MapPin className="h-4 w-4 mr-2" />
                  Manage Addresses
                </Button>
              )}
            </div>
          )}
        </form>
      </div>
    </Layout>
  );
};

export default CustomerEdit;
