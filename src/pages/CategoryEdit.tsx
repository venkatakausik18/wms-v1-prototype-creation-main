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
import { ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

interface CategoryFormData {
  category_code: string;
  category_name: string;
  parent_category_id: number | null;
  category_level: number;
  category_path: string;
  commission_structure: string;
  default_tax_category: string;
  is_active: boolean;
}

const CategoryEdit = () => {
  const { categoryId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isViewMode = searchParams.get('mode') === 'view';
  const isEditMode = !!categoryId && !isViewMode;
  const { toast } = useToast();
  const { user } = useAuth();

  const [formData, setFormData] = useState<CategoryFormData>({
    category_code: '',
    category_name: '',
    parent_category_id: null,
    category_level: 1,
    category_path: '',
    commission_structure: '',
    default_tax_category: '',
    is_active: true,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [company, setCompany] = useState<any>(null);

  // Fetch category data for editing
  const { data: category, isLoading } = useQuery({
    queryKey: ['category', categoryId],
    queryFn: async () => {
      if (!categoryId) return null;
      
      console.log('Fetching category:', categoryId);
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('category_id', parseInt(categoryId))
        .single();

      if (error) {
        console.error('Error fetching category:', error);
        throw error;
      }

      console.log('Fetched category data:', data);
      return data;
    },
    enabled: !!categoryId,
  });

  // Fetch parent categories for dropdown
  const { data: parentCategories } = useQuery({
    queryKey: ['parentCategories'],
    queryFn: async () => {
      console.log('Fetching parent categories');
      const { data, error } = await supabase
        .from('categories')
        .select('category_id, category_name, category_level')
        .eq('company_id', 1) // You might want to get this from context/auth
        .eq('is_active', true)
        .order('category_name');

      if (error) {
        console.error('Error fetching parent categories:', error);
        throw error;
      }

      return data || [];
    },
  });

  useEffect(() => {
    if (category) {
      setFormData({
        category_code: category.category_code || '',
        category_name: category.category_name || '',
        parent_category_id: category.parent_category_id,
        category_level: category.category_level || 1,
        category_path: category.category_path || '',
        commission_structure: category.commission_structure ? JSON.stringify(category.commission_structure, null, 2) : '',
        default_tax_category: category.default_tax_category || '',
        is_active: category.is_active ?? true,
      });
    }
  }, [category]);

  // Calculate category level and path when parent changes
  useEffect(() => {
    if (formData.parent_category_id && parentCategories) {
      const parentCategory = parentCategories.find(c => c.category_id === formData.parent_category_id);
      if (parentCategory) {
        const newLevel = parentCategory.category_level + 1;
        setFormData(prev => ({
          ...prev,
          category_level: newLevel,
        }));
        
        // Generate category path
        generateCategoryPath(formData.parent_category_id, formData.category_name);
      }
    } else {
      setFormData(prev => ({
        ...prev,
        category_level: 1,
        category_path: formData.category_name,
      }));
    }
  }, [formData.parent_category_id, formData.category_name, parentCategories]);

  const generateCategoryPath = async (parentId: number, categoryName: string) => {
    if (!parentId || !categoryName) return;

    try {
      // Fetch parent category path
      const { data: parentCategory } = await supabase
        .from('categories')
        .select('category_path, category_name')
        .eq('category_id', parentId)
        .single();

      if (parentCategory) {
        const newPath = parentCategory.category_path 
          ? `${parentCategory.category_path}/${categoryName}`
          : `${parentCategory.category_name}/${categoryName}`;
        
        setFormData(prev => ({
          ...prev,
          category_path: newPath,
        }));
      }
    } catch (error) {
      console.error('Error generating category path:', error);
    }
  };

  const handleInputChange = (field: keyof CategoryFormData, value: string | boolean | number | null) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateForm = () => {
    if (!formData.category_code.trim()) {
      toast({
        title: "Validation Error",
        description: "Category Code is required",
        variant: "destructive",
      });
      return false;
    }

    if (!formData.category_name.trim()) {
      toast({
        title: "Validation Error",
        description: "Category Name is required",
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
        description: "You must be logged in to save categories",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      let commissionStructure = null;
      if (formData.commission_structure.trim()) {
        try {
          commissionStructure = JSON.parse(formData.commission_structure);
        } catch (e) {
          toast({
            title: "Validation Error",
            description: "Invalid JSON format for Commission Structure",
            variant: "destructive",
          });
          setIsSubmitting(false);
          return;
        }
      }

      const saveData = {
        company_id: 1, // You might want to get this from context/auth
        category_code: formData.category_code.trim(),
        category_name: formData.category_name.trim(),
        parent_category_id: formData.parent_category_id,
        category_level: formData.category_level,
        category_path: formData.category_path || formData.category_name.trim(),
        commission_structure: commissionStructure,
        default_tax_category: formData.default_tax_category.trim() || null,
        is_active: formData.is_active,
        created_by: parseInt(user.id),
      };

      console.log('Saving category data:', saveData);

      let result;
      if (isEditMode && categoryId) {
        result = await supabase
          .from('categories')
          .update(saveData)
          .eq('category_id', parseInt(categoryId));
      } else {
        result = await supabase
          .from('categories')
          .insert(saveData);
      }

      if (result.error) throw result.error;

      toast({
        title: "Success",
        description: `Category ${isEditMode ? 'updated' : 'created'} successfully`,
      });

      navigate('/masters/categories/list');
    } catch (error) {
      console.error('Error saving category:', error);
      toast({
        title: "Error",
        description: `Failed to ${isEditMode ? 'update' : 'create'} category. Please try again.`,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getPageTitle = () => {
    if (isViewMode) return 'View Category';
    if (isEditMode) return 'Edit Category';
    return 'Add Category';
  };

  useEffect(() => {
    const fetchCompany = async () => {
      const { data, error } = await supabase
        .from('companies')
        .select('company_id, company_name, company_code')
        .single();
      if (!error) setCompany(data);
    };
    fetchCompany();
  }, []);

  if (categoryId && isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">Loading category...</div>
        </div>
      </Layout>
    );
  }

  // Filter parent categories to exclude current category and its children
  const filteredParentCategories = parentCategories?.filter(cat => {
    if (isEditMode && categoryId) {
      return cat.category_id !== parseInt(categoryId);
    }
    return true;
  }) || [];

  return (
    <Layout>
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate('/masters/categories/list')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Categories
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{getPageTitle()}</h1>
            <p className="text-gray-600">
              {isViewMode ? 'View category details' : isEditMode ? 'Update category information' : 'Create a new category'}
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={() => navigate('/masters/categories/list')}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <CardTitle>{isEditMode ? 'Edit Category' : isViewMode ? 'View Category' : 'Add Category'}</CardTitle>
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
                  <Label htmlFor="category_code">Category Code *</Label>
                  <Input
                    id="category_code"
                    value={formData.category_code}
                    onChange={(e) => handleInputChange('category_code', e.target.value)}
                    placeholder="Enter category code"
                    disabled={isViewMode}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category_name">Category Name *</Label>
                  <Input
                    id="category_name"
                    value={formData.category_name}
                    onChange={(e) => handleInputChange('category_name', e.target.value)}
                    placeholder="Enter category name"
                    disabled={isViewMode}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="parent_category_id">Parent Category</Label>
                <Select
                  value={formData.parent_category_id?.toString() || "none"}
                  onValueChange={(value) => handleInputChange('parent_category_id', value === "none" ? null : parseInt(value))}
                  disabled={isViewMode}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select parent category (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No Parent (Root Level)</SelectItem>
                    {filteredParentCategories.map((cat) => (
                      <SelectItem key={cat.category_id} value={cat.category_id.toString()}>
                        {cat.category_name} (Level {cat.category_level})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="category_level">Category Level</Label>
                  <Input
                    id="category_level"
                    value={formData.category_level}
                    disabled
                    className="bg-gray-100"
                  />
                  <p className="text-sm text-gray-500">Auto-calculated based on parent category</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="default_tax_category">Default Tax Category</Label>
                  <Input
                    id="default_tax_category"
                    value={formData.default_tax_category}
                    onChange={(e) => handleInputChange('default_tax_category', e.target.value)}
                    placeholder="Enter tax category"
                    disabled={isViewMode}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="category_path">Category Path</Label>
                <Input
                  id="category_path"
                  value={formData.category_path}
                  disabled
                  className="bg-gray-100"
                />
                <p className="text-sm text-gray-500">Auto-generated based on parent hierarchy</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="commission_structure">Commission Structure (JSON)</Label>
                <Textarea
                  id="commission_structure"
                  value={formData.commission_structure}
                  onChange={(e) => handleInputChange('commission_structure', e.target.value)}
                  placeholder='{"rate": 5, "type": "percentage"}'
                  disabled={isViewMode}
                  rows={4}
                />
                <p className="text-sm text-gray-500">Optional: Enter commission structure as JSON</p>
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

              {!isViewMode && (
                <div className="flex gap-4 pt-6">
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Saving...' : isEditMode ? 'Update Category' : 'Create Category'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate('/masters/categories/list')}
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

export default CategoryEdit;
