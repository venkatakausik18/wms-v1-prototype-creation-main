
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { ArrowLeft } from 'lucide-react';

const businessTypes = ['retail', 'wholesale', 'manufacturing', 'distribution'] as const;

const companySchema = z.object({
  company_code: z.string().min(1, 'Company code is required'),
  company_name: z.string().min(1, 'Company name is required'),
  business_type: z.enum(businessTypes),
  registration_number: z.string().optional(),
  pan_number: z.string().optional(),
  gst_number: z.string().optional(),
  address_line1: z.string().optional(),
  address_line2: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().default('India'),
  pin_code: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  website: z.string().optional(),
  financial_year_start: z.string().optional(),
  default_currency: z.string().default('INR'),
  decimal_places_amount: z.number().min(0).max(6).default(2),
  decimal_places_quantity: z.number().min(0).max(6).default(3),
  decimal_places_rate: z.number().min(0).max(6).default(4),
});

type CompanyFormData = z.infer<typeof companySchema>;

const CompanyEdit = () => {
  const { companyId } = useParams<{ companyId: string }>();
  const navigate = useNavigate();
  const isNew = !companyId || companyId === 'new';
  const [loading, setLoading] = useState(false);

  const form = useForm<CompanyFormData>({
    resolver: zodResolver(companySchema),
    defaultValues: {
      company_code: '',
      company_name: '',
      business_type: 'retail',
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
      financial_year_start: '',
      default_currency: 'INR',
      decimal_places_amount: 2,
      decimal_places_quantity: 3,
      decimal_places_rate: 4,
    },
  });

  useEffect(() => {
    if (!isNew && companyId) {
      fetchCompany();
    }
  }, [companyId, isNew]);

  const fetchCompany = async () => {
    if (!companyId || companyId === 'new') return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .eq('company_id', parseInt(companyId))
        .single();

      if (error) throw error;

      if (data) {
        // Format the data to match form expectations
        const formData: CompanyFormData = {
          company_code: data.company_code || '',
          company_name: data.company_name || '',
          business_type: (data.business_type as typeof businessTypes[number]) || 'retail',
          registration_number: data.registration_number || '',
          pan_number: data.pan_number || '',
          gst_number: data.gst_number || '',
          address_line1: data.address_line1 || '',
          address_line2: data.address_line2 || '',
          city: data.city || '',
          state: data.state || '',
          country: data.country || 'India',
          pin_code: data.pin_code || '',
          phone: data.phone || '',
          email: data.email || '',
          website: data.website || '',
          financial_year_start: data.financial_year_start || '',
          default_currency: data.default_currency || 'INR',
          decimal_places_amount: data.decimal_places_amount || 2,
          decimal_places_quantity: data.decimal_places_quantity || 3,
          decimal_places_rate: data.decimal_places_rate || 4,
        };
        form.reset(formData);
      }
    } catch (error) {
      console.error('Error fetching company:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch company details',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: CompanyFormData) => {
    try {
      setLoading(true);

      // Prepare data for database
      const saveData = {
        ...data,
        email: data.email || null,
        website: data.website || null,
        registration_number: data.registration_number || null,
        pan_number: data.pan_number || null,
        gst_number: data.gst_number || null,
        address_line1: data.address_line1 || null,
        address_line2: data.address_line2 || null,
        city: data.city || null,
        state: data.state || null,
        pin_code: data.pin_code || null,
        phone: data.phone || null,
        financial_year_start: data.financial_year_start || null,
      };

      if (isNew) {
        const { error } = await supabase
          .from('companies')
          .insert(saveData);

        if (error) throw error;
        
        toast({
          title: 'Success',
          description: 'Company created successfully',
        });
      } else {
        const { error } = await supabase
          .from('companies')
          .update(saveData)
          .eq('company_id', parseInt(companyId!));

        if (error) throw error;
        
        toast({
          title: 'Success',
          description: 'Company updated successfully',
        });
      }

      navigate('/settings/company');
    } catch (error) {
      console.error('Error saving company:', error);
      toast({
        title: 'Error',
        description: 'Failed to save company',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="flex items-center mb-6">
        <Button variant="ghost" onClick={() => navigate('/settings/company')} className="mr-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Companies
        </Button>
        <h1 className="text-3xl font-bold">
          {isNew ? 'Add New Company' : 'Edit Company'}
        </h1>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Details */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Details</CardTitle>
              <CardDescription>
                Enter the basic information about the company
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="company_code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Company Code *</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Enter company code" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="company_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Company Name *</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Enter company name" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="business_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Business Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select business type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="retail">Retail</SelectItem>
                          <SelectItem value="wholesale">Wholesale</SelectItem>
                          <SelectItem value="manufacturing">Manufacturing</SelectItem>
                          <SelectItem value="distribution">Distribution</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="registration_number"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Registration Number</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Enter registration number" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="pan_number"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>PAN Number</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Enter PAN number" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="gst_number"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>GST Number</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Enter GST number" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Address Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="address_line1"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address Line 1</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Enter address line 1" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="address_line2"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address Line 2</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Enter address line 2" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>City</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Enter city" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="state"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>State</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Enter state" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="country"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Country</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Enter country" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="pin_code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>PIN Code</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Enter PIN code" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Contact Fields */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Enter phone number" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input {...field} type="email" placeholder="Enter email address" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="website"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Website</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Enter website URL" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Financial Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Financial Settings</CardTitle>
              <CardDescription>
                Configure financial and accounting settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="financial_year_start"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Financial Year Start</FormLabel>
                      <FormControl>
                        <Input {...field} type="date" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="default_currency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Default Currency</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="e.g., INR, USD" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="decimal_places_amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Decimal Places - Amount</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          min="0"
                          max="6"
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="decimal_places_quantity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Decimal Places - Quantity</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          min="0"
                          max="6"
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="decimal_places_rate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Decimal Places - Rate</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          min="0"
                          max="6"
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Tax Configuration */}
          <Card>
            <CardHeader>
              <CardTitle>Tax Configuration</CardTitle>
              <CardDescription>
                Basic tax settings (detailed configuration available separately)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                GST Number: {form.watch('gst_number') || 'Not set'}
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                For detailed tax configuration, visit{' '}
                <Button variant="link" className="p-0 h-auto text-sm">
                  Tax Settings
                </Button>
              </p>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex gap-4">
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : isNew ? 'Create Company' : 'Update Company'}
            </Button>
            <Button type="button" variant="outline" onClick={() => navigate('/settings/company')}>
              Cancel
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default CompanyEdit;
