
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Save } from "lucide-react";
import { toast } from "sonner";
import Layout from "@/components/Layout";

interface ProductFormData {
  product_code: string;
  product_name: string;
  product_name_local: string;
  brand_id: string;
  category_id: string;
  product_type: string;
  primary_uom_id: string;
  secondary_uom_id: string;
  barcode: string;
  qr_code: string;
  hsn_sac_code: string;
  gender: string;
  age_group: string;
  season: string;
  collection_name: string;
  style_number: string;
  fabric_composition: string;
  care_instructions: string;
  country_of_origin: string;
  purchase_rate: string;
  mrp: string;
  wholesale_rate: string;
  retail_rate: string;
  dealer_rate: string;
  minimum_selling_price: string;
  discount_limit_percent: string;
  opening_stock: string;
  minimum_stock_level: string;
  maximum_stock_level: string;
  reorder_level: string;
  reorder_quantity: string;
  lead_time_days: string;
  shelf_life_days: string;
  storage_conditions: string;
  purchase_account: string;
  sales_account: string;
  tax_category: string;
  tax_exemption: boolean;
  product_description: string;
  specifications: string;
  weight: string;
  dimensions: string;
  is_serialized: boolean;
  is_batch_tracked: boolean;
  is_active: boolean;
}

interface Brand {
  brand_id: number;
  brand_name: string;
}

interface Category {
  category_id: number;
  category_name: string;
}

interface UOM {
  uom_id: number;
  uom_name: string;
}

const ProductEdit = () => {
  const navigate = useNavigate();
  const { productId } = useParams();
  const { user } = useAuth();
  const isEdit = Boolean(productId);

  const [formData, setFormData] = useState<ProductFormData>({
    product_code: '',
    product_name: '',
    product_name_local: '',
    brand_id: '',
    category_id: '',
    product_type: 'finished',
    primary_uom_id: '',
    secondary_uom_id: '',
    barcode: '',
    qr_code: '',
    hsn_sac_code: '',
    gender: '',
    age_group: '',
    season: '',
    collection_name: '',
    style_number: '',
    fabric_composition: '',
    care_instructions: '',
    country_of_origin: 'India',
    purchase_rate: '',
    mrp: '',
    wholesale_rate: '',
    retail_rate: '',
    dealer_rate: '',
    minimum_selling_price: '',
    discount_limit_percent: '',
    opening_stock: '0',
    minimum_stock_level: '0',
    maximum_stock_level: '',
    reorder_level: '',
    reorder_quantity: '',
    lead_time_days: '0',
    shelf_life_days: '',
    storage_conditions: '',
    purchase_account: '',
    sales_account: '',
    tax_category: '',
    tax_exemption: false,
    product_description: '',
    specifications: '',
    weight: '',
    dimensions: '',
    is_serialized: false,
    is_batch_tracked: false,
    is_active: true,
  });

  const [brands, setBrands] = useState<Brand[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [uoms, setUOMs] = useState<UOM[]>([]);
  const [loading, setLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [company, setCompany] = useState<any>(null);

  useEffect(() => {
    if (user) {
      fetchDropdownData();
      if (isEdit && productId) {
        fetchProductData();
      }
    }
    const fetchCompany = async () => {
      const { data, error } = await supabase
        .from('companies')
        .select('company_id, company_name, company_code')
        .single();
      if (!error) setCompany(data);
    };
    fetchCompany();
  }, [user, productId, isEdit]);

  const fetchDropdownData = async () => {
    try {
      // Fetch brands
      const { data: brandsData } = await supabase
        .from('brands')
        .select('brand_id, brand_name')
        .eq('company_id', 1)
        .eq('is_active', true)
        .order('brand_name');

      // Fetch categories
      const { data: categoriesData } = await supabase
        .from('categories')
        .select('category_id, category_name')
        .eq('company_id', 1)
        .eq('is_active', true)
        .order('category_name');

      // For now, create mock UOM data since the table doesn't exist
      const mockUOMs = [
        { uom_id: 1, uom_name: 'Pieces' },
        { uom_id: 2, uom_name: 'Kilograms' },
        { uom_id: 3, uom_name: 'Meters' },
        { uom_id: 4, uom_name: 'Liters' },
        { uom_id: 5, uom_name: 'Dozens' },
      ];

      setBrands(brandsData || []);
      setCategories(categoriesData || []);
      setUOMs(mockUOMs);
    } catch (error) {
      console.error('Error fetching dropdown data:', error);
    }
  };

  const fetchProductData = async () => {
    if (!productId) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('product_id', parseInt(productId))
        .single();

      if (error) throw error;

      if (data) {
        setFormData({
          product_code: data.product_code || '',
          product_name: data.product_name || '',
          product_name_local: data.product_name_local || '',
          brand_id: data.brand_id?.toString() || '',
          category_id: data.category_id?.toString() || '',
          product_type: data.product_type || 'finished',
          primary_uom_id: data.primary_uom_id?.toString() || '',
          secondary_uom_id: data.secondary_uom_id?.toString() || '',
          barcode: data.barcode || '',
          qr_code: data.qr_code || '',
          hsn_sac_code: data.hsn_sac_code || '',
          gender: data.gender || '',
          age_group: data.age_group || '',
          season: data.season || '',
          collection_name: data.collection_name || '',
          style_number: data.style_number || '',
          fabric_composition: data.fabric_composition || '',
          care_instructions: data.care_instructions || '',
          country_of_origin: data.country_of_origin || 'India',
          purchase_rate: data.purchase_rate?.toString() || '',
          mrp: data.mrp?.toString() || '',
          wholesale_rate: data.wholesale_rate?.toString() || '',
          retail_rate: data.retail_rate?.toString() || '',
          dealer_rate: data.dealer_rate?.toString() || '',
          minimum_selling_price: data.minimum_selling_price?.toString() || '',
          discount_limit_percent: data.discount_limit_percent?.toString() || '',
          opening_stock: data.opening_stock?.toString() || '0',
          minimum_stock_level: data.minimum_stock_level?.toString() || '0',
          maximum_stock_level: data.maximum_stock_level?.toString() || '',
          reorder_level: data.reorder_level?.toString() || '',
          reorder_quantity: data.reorder_quantity?.toString() || '',
          lead_time_days: data.lead_time_days?.toString() || '0',
          shelf_life_days: data.shelf_life_days?.toString() || '',
          storage_conditions: data.storage_conditions || '',
          purchase_account: data.purchase_account || '',
          sales_account: data.sales_account || '',
          tax_category: data.tax_category || '',
          tax_exemption: data.tax_exemption || false,
          product_description: data.product_description || '',
          specifications: typeof data.specifications === 'string' ? data.specifications : JSON.stringify(data.specifications) || '',
          weight: data.weight?.toString() || '',
          dimensions: data.dimensions || '',
          is_serialized: data.is_serialized || false,
          is_batch_tracked: data.is_batch_tracked || false,
          is_active: data.is_active ?? true,
        });
      }
    } catch (error) {
      console.error('Error fetching product data:', error);
      toast.error('Failed to fetch product data');
    } finally {
      setLoading(false);
    }
  };

  const validateEnumValue = (value: string, validValues: string[]): string | null => {
    return validValues.includes(value) ? value : null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.product_code || !formData.product_name || !formData.category_id || !formData.primary_uom_id) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSaving(true);
    try {
      const saveData = {
        company_id: 1,
        product_code: formData.product_code,
        product_name: formData.product_name,
        product_name_local: formData.product_name_local || null,
        brand_id: formData.brand_id ? parseInt(formData.brand_id) : null,
        category_id: parseInt(formData.category_id),
        product_type: validateEnumValue(formData.product_type, ['finished', 'raw_material', 'service', 'consumable']) as 'finished' | 'raw_material' | 'service' | 'consumable' || 'finished',
        primary_uom_id: parseInt(formData.primary_uom_id),
        base_uom_id: parseInt(formData.primary_uom_id), // Set base_uom_id to the same as primary_uom_id
        secondary_uom_id: formData.secondary_uom_id ? parseInt(formData.secondary_uom_id) : null,
        barcode: formData.barcode || null,
        qr_code: formData.qr_code || null,
        hsn_sac_code: formData.hsn_sac_code || null,
        gender: validateEnumValue(formData.gender, ['men', 'women', 'kids', 'unisex']) as 'men' | 'women' | 'kids' | 'unisex' | null,
        age_group: validateEnumValue(formData.age_group, ['infant', 'kids', 'adult']) as 'infant' | 'kids' | 'adult' | null,
        season: validateEnumValue(formData.season, ['summer', 'winter', 'monsoon', 'all_season']) as 'summer' | 'winter' | 'monsoon' | 'all_season' | null,
        collection_name: formData.collection_name || null,
        style_number: formData.style_number || null,
        fabric_composition: formData.fabric_composition || null,
        care_instructions: formData.care_instructions || null,
        country_of_origin: formData.country_of_origin || null,
        purchase_rate: formData.purchase_rate ? parseFloat(formData.purchase_rate) : null,
        mrp: formData.mrp ? parseFloat(formData.mrp) : null,
        wholesale_rate: formData.wholesale_rate ? parseFloat(formData.wholesale_rate) : null,
        retail_rate: formData.retail_rate ? parseFloat(formData.retail_rate) : null,
        dealer_rate: formData.dealer_rate ? parseFloat(formData.dealer_rate) : null,
        minimum_selling_price: formData.minimum_selling_price ? parseFloat(formData.minimum_selling_price) : null,
        discount_limit_percent: formData.discount_limit_percent ? parseFloat(formData.discount_limit_percent) : null,
        opening_stock: formData.opening_stock ? parseFloat(formData.opening_stock) : 0,
        minimum_stock_level: formData.minimum_stock_level ? parseFloat(formData.minimum_stock_level) : 0,
        maximum_stock_level: formData.maximum_stock_level ? parseFloat(formData.maximum_stock_level) : null,
        reorder_level: formData.reorder_level ? parseFloat(formData.reorder_level) : null,
        reorder_quantity: formData.reorder_quantity ? parseFloat(formData.reorder_quantity) : null,
        lead_time_days: formData.lead_time_days ? parseInt(formData.lead_time_days) : 0,
        shelf_life_days: formData.shelf_life_days ? parseInt(formData.shelf_life_days) : null,
        storage_conditions: formData.storage_conditions || null,
        purchase_account: formData.purchase_account || null,
        sales_account: formData.sales_account || null,
        tax_category: formData.tax_category || null,
        tax_exemption: formData.tax_exemption,
        product_description: formData.product_description || null,
        specifications: formData.specifications || null,
        weight: formData.weight ? parseFloat(formData.weight) : null,
        dimensions: formData.dimensions || null,
        is_serialized: formData.is_serialized,
        is_batch_tracked: formData.is_batch_tracked,
        is_active: formData.is_active,
        created_by: user?.id ? parseInt(user.id) : null,
      };

      let result;
      if (isEdit && productId) {
        result = await supabase
          .from('products')
          .update(saveData)
          .eq('product_id', parseInt(productId));
      } else {
        result = await supabase
          .from('products')
          .insert(saveData);
      }

      if (result.error) throw result.error;

      toast.success(`Product ${isEdit ? 'updated' : 'created'} successfully`);
      navigate('/masters/products/list');
    } catch (error) {
      console.error('Error saving product:', error);
      toast.error(`Failed to ${isEdit ? 'update' : 'create'} product`);
    } finally {
      setIsSaving(false);
    }
  };

  const updateFormData = (field: keyof ProductFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto p-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-lg">Loading product data...</div>
          </div>
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
              <Button variant="ghost" size="sm" onClick={() => navigate('/masters/products/list')}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <CardTitle>{isEdit ? 'Edit Product' : 'Add New Product'}</CardTitle>
                <CardDescription>
                  {company ? `${company.company_name} (${company.company_code})` : 'Loading...'}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <Tabs defaultValue="basic" className="w-full">
                <TabsList className="grid w-full grid-cols-5">
                  <TabsTrigger value="basic">Basic Info</TabsTrigger>
                  <TabsTrigger value="clothing">Clothing</TabsTrigger>
                  <TabsTrigger value="pricing">Pricing</TabsTrigger>
                  <TabsTrigger value="stock">Stock</TabsTrigger>
                  <TabsTrigger value="other">Other</TabsTrigger>
                </TabsList>
                <TabsContent value="basic" className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="product_code">Product Code *</Label>
                      <Input
                        id="product_code"
                        value={formData.product_code}
                        onChange={(e) => updateFormData('product_code', e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="product_name">Product Name *</Label>
                      <Input
                        id="product_name"
                        value={formData.product_name}
                        onChange={(e) => updateFormData('product_name', e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="product_name_local">Product Name (Local)</Label>
                      <Input
                        id="product_name_local"
                        value={formData.product_name_local}
                        onChange={(e) => updateFormData('product_name_local', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="brand_id">Brand</Label>
                      <Select value={formData.brand_id} onValueChange={(value) => updateFormData('brand_id', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select brand" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">No Brand</SelectItem>
                          {brands.map(brand => (
                            <SelectItem key={brand.brand_id} value={brand.brand_id.toString()}>
                              {brand.brand_name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="category_id">Category *</Label>
                      <Select value={formData.category_id} onValueChange={(value) => updateFormData('category_id', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map(category => (
                            <SelectItem key={category.category_id} value={category.category_id.toString()}>
                              {category.category_name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="product_type">Product Type</Label>
                      <Select value={formData.product_type} onValueChange={(value) => updateFormData('product_type', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="finished">Finished</SelectItem>
                          <SelectItem value="raw_material">Raw Material</SelectItem>
                          <SelectItem value="service">Service</SelectItem>
                          <SelectItem value="consumable">Consumable</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="primary_uom_id">Primary UOM *</Label>
                      <Select value={formData.primary_uom_id} onValueChange={(value) => updateFormData('primary_uom_id', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select UOM" />
                        </SelectTrigger>
                        <SelectContent>
                          {uoms.map(uom => (
                            <SelectItem key={uom.uom_id} value={uom.uom_id.toString()}>
                              {uom.uom_name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="secondary_uom_id">Secondary UOM</Label>
                      <Select value={formData.secondary_uom_id} onValueChange={(value) => updateFormData('secondary_uom_id', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select UOM" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">No Secondary UOM</SelectItem>
                          {uoms.map(uom => (
                            <SelectItem key={uom.uom_id} value={uom.uom_id.toString()}>
                              {uom.uom_name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="hsn_sac_code">HSN/SAC Code</Label>
                      <Input
                        id="hsn_sac_code"
                        value={formData.hsn_sac_code}
                        onChange={(e) => updateFormData('hsn_sac_code', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="barcode">Barcode</Label>
                      <Input
                        id="barcode"
                        value={formData.barcode}
                        onChange={(e) => updateFormData('barcode', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="qr_code">QR Code</Label>
                      <Input
                        id="qr_code"
                        value={formData.qr_code}
                        onChange={(e) => updateFormData('qr_code', e.target.value)}
                      />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="clothing" className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="gender">Gender</Label>
                      <Select value={formData.gender} onValueChange={(value) => updateFormData('gender', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="men">Men</SelectItem>
                          <SelectItem value="women">Women</SelectItem>
                          <SelectItem value="kids">Kids</SelectItem>
                          <SelectItem value="unisex">Unisex</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="age_group">Age Group</Label>
                      <Select value={formData.age_group} onValueChange={(value) => updateFormData('age_group', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select age group" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="infant">Infant</SelectItem>
                          <SelectItem value="kids">Kids</SelectItem>
                          <SelectItem value="adult">Adult</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="season">Season</Label>
                      <Select value={formData.season} onValueChange={(value) => updateFormData('season', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select season" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="summer">Summer</SelectItem>
                          <SelectItem value="winter">Winter</SelectItem>
                          <SelectItem value="monsoon">Monsoon</SelectItem>
                          <SelectItem value="all_season">All Season</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="collection_name">Collection Name</Label>
                      <Input
                        id="collection_name"
                        value={formData.collection_name}
                        onChange={(e) => updateFormData('collection_name', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="style_number">Style Number</Label>
                      <Input
                        id="style_number"
                        value={formData.style_number}
                        onChange={(e) => updateFormData('style_number', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="fabric_composition">Fabric Composition</Label>
                    <Textarea
                      id="fabric_composition"
                      value={formData.fabric_composition}
                      onChange={(e) => updateFormData('fabric_composition', e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="care_instructions">Care Instructions</Label>
                    <Textarea
                      id="care_instructions"
                      value={formData.care_instructions}
                      onChange={(e) => updateFormData('care_instructions', e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="country_of_origin">Country of Origin</Label>
                    <Input
                      id="country_of_origin"
                      value={formData.country_of_origin}
                      onChange={(e) => updateFormData('country_of_origin', e.target.value)}
                    />
                  </div>
                </TabsContent>

                <TabsContent value="pricing" className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="purchase_rate">Purchase Rate</Label>
                      <Input
                        id="purchase_rate"
                        type="number"
                        step="0.01"
                        value={formData.purchase_rate}
                        onChange={(e) => updateFormData('purchase_rate', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="mrp">MRP</Label>
                      <Input
                        id="mrp"
                        type="number"
                        step="0.01"
                        value={formData.mrp}
                        onChange={(e) => updateFormData('mrp', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="wholesale_rate">Wholesale Rate</Label>
                      <Input
                        id="wholesale_rate"
                        type="number"
                        step="0.01"
                        value={formData.wholesale_rate}
                        onChange={(e) => updateFormData('wholesale_rate', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="retail_rate">Retail Rate</Label>
                      <Input
                        id="retail_rate"
                        type="number"
                        step="0.01"
                        value={formData.retail_rate}
                        onChange={(e) => updateFormData('retail_rate', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="dealer_rate">Dealer Rate</Label>
                      <Input
                        id="dealer_rate"
                        type="number"
                        step="0.01"
                        value={formData.dealer_rate}
                        onChange={(e) => updateFormData('dealer_rate', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="minimum_selling_price">Minimum Selling Price</Label>
                      <Input
                        id="minimum_selling_price"
                        type="number"
                        step="0.01"
                        value={formData.minimum_selling_price}
                        onChange={(e) => updateFormData('minimum_selling_price', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="discount_limit_percent">Discount Limit (%)</Label>
                    <Input
                      id="discount_limit_percent"
                      type="number"
                      min="0"
                      max="100"
                      step="0.01"
                      value={formData.discount_limit_percent}
                      onChange={(e) => updateFormData('discount_limit_percent', e.target.value)}
                    />
                  </div>
                </TabsContent>

                <TabsContent value="stock" className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="opening_stock">Opening Stock</Label>
                      <Input
                        id="opening_stock"
                        type="number"
                        step="0.001"
                        value={formData.opening_stock}
                        onChange={(e) => updateFormData('opening_stock', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="minimum_stock_level">Minimum Stock Level</Label>
                      <Input
                        id="minimum_stock_level"
                        type="number"
                        step="0.001"
                        value={formData.minimum_stock_level}
                        onChange={(e) => updateFormData('minimum_stock_level', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="maximum_stock_level">Maximum Stock Level</Label>
                      <Input
                        id="maximum_stock_level"
                        type="number"
                        step="0.001"
                        value={formData.maximum_stock_level}
                        onChange={(e) => updateFormData('maximum_stock_level', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="reorder_level">Reorder Level</Label>
                      <Input
                        id="reorder_level"
                        type="number"
                        step="0.001"
                        value={formData.reorder_level}
                        onChange={(e) => updateFormData('reorder_level', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="reorder_quantity">Reorder Quantity</Label>
                      <Input
                        id="reorder_quantity"
                        type="number"
                        step="0.001"
                        value={formData.reorder_quantity}
                        onChange={(e) => updateFormData('reorder_quantity', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lead_time_days">Lead Time (Days)</Label>
                      <Input
                        id="lead_time_days"
                        type="number"
                        value={formData.lead_time_days}
                        onChange={(e) => updateFormData('lead_time_days', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="shelf_life_days">Shelf Life (Days)</Label>
                      <Input
                        id="shelf_life_days"
                        type="number"
                        value={formData.shelf_life_days}
                        onChange={(e) => updateFormData('shelf_life_days', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="storage_conditions">Storage Conditions</Label>
                      <Input
                        id="storage_conditions"
                        value={formData.storage_conditions}
                        onChange={(e) => updateFormData('storage_conditions', e.target.value)}
                      />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="other" className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="purchase_account">Purchase Account</Label>
                      <Input
                        id="purchase_account"
                        value={formData.purchase_account}
                        onChange={(e) => updateFormData('purchase_account', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="sales_account">Sales Account</Label>
                      <Input
                        id="sales_account"
                        value={formData.sales_account}
                        onChange={(e) => updateFormData('sales_account', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="tax_category">Tax Category</Label>
                      <Input
                        id="tax_category"
                        value={formData.tax_category}
                        onChange={(e) => updateFormData('tax_category', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="weight">Weight</Label>
                      <Input
                        id="weight"
                        type="number"
                        step="0.001"
                        value={formData.weight}
                        onChange={(e) => updateFormData('weight', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="dimensions">Dimensions</Label>
                      <Input
                        id="dimensions"
                        value={formData.dimensions}
                        onChange={(e) => updateFormData('dimensions', e.target.value)}
                        placeholder="e.g. 15x7x0.8 cm"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="product_description">Product Description</Label>
                    <Textarea
                      id="product_description"
                      value={formData.product_description}
                      onChange={(e) => updateFormData('product_description', e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="specifications">Specifications (JSON)</Label>
                    <Textarea
                      id="specifications"
                      value={formData.specifications}
                      onChange={(e) => updateFormData('specifications', e.target.value)}
                      placeholder='{"key": "value"}'
                    />
                  </div>

                  <Separator />

                  <div className="flex flex-wrap gap-6">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="tax_exemption"
                        checked={formData.tax_exemption}
                        onCheckedChange={(checked) => updateFormData('tax_exemption', checked)}
                      />
                      <Label htmlFor="tax_exemption">Tax Exemption</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="is_serialized"
                        checked={formData.is_serialized}
                        onCheckedChange={(checked) => updateFormData('is_serialized', checked)}
                      />
                      <Label htmlFor="is_serialized">Serialized</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="is_batch_tracked"
                        checked={formData.is_batch_tracked}
                        onCheckedChange={(checked) => updateFormData('is_batch_tracked', checked)}
                      />
                      <Label htmlFor="is_batch_tracked">Batch Tracked</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="is_active"
                        checked={formData.is_active}
                        onCheckedChange={(checked) => updateFormData('is_active', checked)}
                      />
                      <Label htmlFor="is_active">Active</Label>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
              <div className="flex gap-4 pt-6">
                <Button type="submit" disabled={isSaving}>
                  <Save className="h-4 w-4 mr-2" />
                  {isSaving ? 'Saving...' : isEdit ? 'Update Product' : 'Save Product'}
                </Button>
                <Button type="button" variant="outline" onClick={() => navigate('/masters/products/list')}>
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

export default ProductEdit;
