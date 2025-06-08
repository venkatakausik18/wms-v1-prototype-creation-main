
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
import { ArrowLeft, Upload, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

interface BrandFormData {
  brand_code: string;
  brand_name: string;
  brand_logo_path: string;
  manufacturer_name: string;
  manufacturer_contact: string;
  brand_category: string;
  is_active: boolean;
}

const BrandEdit = () => {
  const { brandId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isViewMode = searchParams.get('mode') === 'view';
  const isEditMode = !!brandId && !isViewMode;
  const { toast } = useToast();
  const { user } = useAuth();

  const [formData, setFormData] = useState<BrandFormData>({
    brand_code: '',
    brand_name: '',
    brand_logo_path: '',
    manufacturer_name: '',
    manufacturer_contact: '',
    brand_category: '',
    is_active: true,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>('');

  // Fetch brand data for editing
  const { data: brand, isLoading } = useQuery({
    queryKey: ['brand', brandId],
    queryFn: async () => {
      if (!brandId) return null;
      
      console.log('Fetching brand:', brandId);
      const { data, error } = await supabase
        .from('brands')
        .select('*')
        .eq('brand_id', parseInt(brandId)) // Convert string to number
        .single();

      if (error) {
        console.error('Error fetching brand:', error);
        throw error;
      }

      console.log('Fetched brand data:', data);
      return data;
    },
    enabled: !!brandId,
  });

  useEffect(() => {
    if (brand) {
      setFormData({
        brand_code: brand.brand_code || '',
        brand_name: brand.brand_name || '',
        brand_logo_path: brand.brand_logo_path || '',
        manufacturer_name: brand.manufacturer_name || '',
        manufacturer_contact: brand.manufacturer_contact || '',
        brand_category: brand.brand_category || '',
        is_active: brand.is_active ?? true,
      });
      
      if (brand.brand_logo_path) {
        setLogoPreview(brand.brand_logo_path);
      }
    }
  }, [brand]);

  const handleInputChange = (field: keyof BrandFormData, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleLogoUpload = async (file: File) => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `brand-logo-${Date.now()}.${fileExt}`;
      const filePath = `brands/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('brand-logos')
        .upload(filePath, file);

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw uploadError;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('brand-logos')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      console.error('Error uploading logo:', error);
      throw error;
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setLogoFile(null);
    setLogoPreview('');
    setFormData(prev => ({ ...prev, brand_logo_path: '' }));
  };

  const validateForm = () => {
    if (!formData.brand_code.trim()) {
      toast({
        title: "Validation Error",
        description: "Brand Code is required",
        variant: "destructive",
      });
      return false;
    }

    if (!formData.brand_name.trim()) {
      toast({
        title: "Validation Error",
        description: "Brand Name is required",
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
        description: "You must be logged in to save brands",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      let logoUrl = formData.brand_logo_path;

      // Upload logo if a new file was selected
      if (logoFile) {
        logoUrl = await handleLogoUpload(logoFile);
      }

      const saveData = {
        company_id: 1, // You might want to get this from context/auth
        brand_code: formData.brand_code.trim(),
        brand_name: formData.brand_name.trim(),
        brand_logo_path: logoUrl || null,
        manufacturer_name: formData.manufacturer_name.trim() || null,
        manufacturer_contact: formData.manufacturer_contact.trim() || null,
        brand_category: formData.brand_category.trim() || null,
        is_active: formData.is_active,
        created_by: parseInt(user.id), // Convert string to number
      };

      console.log('Saving brand data:', saveData);

      let result;
      if (isEditMode && brandId) {
        result = await supabase
          .from('brands')
          .update(saveData)
          .eq('brand_id', parseInt(brandId)); // Convert string to number
      } else {
        result = await supabase
          .from('brands')
          .insert(saveData);
      }

      if (result.error) throw result.error;

      toast({
        title: "Success",
        description: `Brand ${isEditMode ? 'updated' : 'created'} successfully`,
      });

      navigate('/masters/brands/list');
    } catch (error) {
      console.error('Error saving brand:', error);
      toast({
        title: "Error",
        description: `Failed to ${isEditMode ? 'update' : 'create'} brand. Please try again.`,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getPageTitle = () => {
    if (isViewMode) return 'View Brand';
    if (isEditMode) return 'Edit Brand';
    return 'Add Brand';
  };

  if (brandId && isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">Loading brand...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate('/masters/brands/list')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Brands
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{getPageTitle()}</h1>
            <p className="text-gray-600">
              {isViewMode ? 'View brand details' : isEditMode ? 'Update brand information' : 'Create a new brand'}
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Brand Information</CardTitle>
            <CardDescription>
              {isViewMode ? 'Brand details are shown below' : 'Fill in the brand details below'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="brand_code">Brand Code *</Label>
                  <Input
                    id="brand_code"
                    value={formData.brand_code}
                    onChange={(e) => handleInputChange('brand_code', e.target.value)}
                    placeholder="Enter brand code"
                    disabled={isViewMode}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="brand_name">Brand Name *</Label>
                  <Input
                    id="brand_name"
                    value={formData.brand_name}
                    onChange={(e) => handleInputChange('brand_name', e.target.value)}
                    placeholder="Enter brand name"
                    disabled={isViewMode}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="brand_category">Brand Category</Label>
                <Input
                  id="brand_category"
                  value={formData.brand_category}
                  onChange={(e) => handleInputChange('brand_category', e.target.value)}
                  placeholder="Enter brand category"
                  disabled={isViewMode}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="manufacturer_name">Manufacturer Name</Label>
                <Input
                  id="manufacturer_name"
                  value={formData.manufacturer_name}
                  onChange={(e) => handleInputChange('manufacturer_name', e.target.value)}
                  placeholder="Enter manufacturer name"
                  disabled={isViewMode}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="manufacturer_contact">Manufacturer Contact</Label>
                <Textarea
                  id="manufacturer_contact"
                  value={formData.manufacturer_contact}
                  onChange={(e) => handleInputChange('manufacturer_contact', e.target.value)}
                  placeholder="Enter manufacturer contact details"
                  disabled={isViewMode}
                  rows={3}
                />
              </div>

              {!isViewMode && (
                <div className="space-y-2">
                  <Label htmlFor="brand_logo">Brand Logo</Label>
                  <div className="space-y-4">
                    {logoPreview && (
                      <div className="relative inline-block">
                        <img
                          src={logoPreview}
                          alt="Brand logo preview"
                          className="w-32 h-32 object-cover border rounded-lg"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                          onClick={removeImage}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                    <div className="flex items-center gap-4">
                      <Input
                        id="brand_logo"
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => document.getElementById('brand_logo')?.click()}
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Upload Logo
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {logoPreview && isViewMode && (
                <div className="space-y-2">
                  <Label>Brand Logo</Label>
                  <img
                    src={logoPreview}
                    alt="Brand logo"
                    className="w-32 h-32 object-cover border rounded-lg"
                  />
                </div>
              )}

              <div className="flex items-center space-x-2">
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
                    {isSubmitting ? 'Saving...' : isEditMode ? 'Update Brand' : 'Create Brand'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate('/masters/brands/list')}
                  >
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

export default BrandEdit;
