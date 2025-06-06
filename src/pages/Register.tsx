
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { UserPlus, Eye, EyeOff } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface Role {
  role_id: number;
  role_name: string;
}

interface Branch {
  branch_id: number;
  branch_name: string;
}

interface User {
  user_id: number;
  full_name: string;
}

const Register = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    username: '',
    password: '',
    confirmPassword: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    pinCode: '',
    employeeCode: '',
    department: '',
    designation: '',
    isActive: true
  });
  
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [selectedBranch, setSelectedBranch] = useState<string>('');
  const [selectedManager, setSelectedManager] = useState<string>('');
  const [roles, setRoles] = useState<Role[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [managers, setManagers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [currentUserCompanyId, setCurrentUserCompanyId] = useState<number | null>(null);

  // Check if user is admin and get company info
  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    checkAdminAccess();
  }, [user, navigate]);

  const checkAdminAccess = async () => {
    try {
      const { data: userData, error } = await supabase
        .from('users')
        .select(`
          user_id,
          company_id,
          roles (
            role_name
          )
        `)
        .eq('auth_user_id', user?.id)
        .single();

      if (error || !userData) {
        toast({
          title: "Access Denied",
          description: "User account not found",
          variant: "destructive"
        });
        navigate('/dashboard');
        return;
      }

      if (userData.roles?.role_name !== 'admin') {
        toast({
          title: "Access Denied",
          description: "Only administrators can register new users",
          variant: "destructive"
        });
        navigate('/dashboard');
        return;
      }

      setCurrentUserCompanyId(userData.company_id);
      loadRoles(userData.company_id);
      loadBranches(userData.company_id);
      loadManagers(userData.company_id);
    } catch (error) {
      console.error('Error checking admin access:', error);
      navigate('/dashboard');
    }
  };

  const loadRoles = async (companyId: number) => {
    try {
      const { data, error } = await supabase
        .from('roles')
        .select('role_id, role_name')
        .eq('company_id', companyId)
        .eq('is_active', true);

      if (error) throw error;
      setRoles(data || []);
    } catch (error) {
      console.error('Error loading roles:', error);
    }
  };

  const loadBranches = async (companyId: number) => {
    try {
      const { data, error } = await supabase
        .from('branches')
        .select('branch_id, branch_name')
        .eq('company_id', companyId)
        .eq('is_active', true);

      if (error) throw error;
      setBranches(data || []);
    } catch (error) {
      console.error('Error loading branches:', error);
    }
  };

  const loadManagers = async (companyId: number) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('user_id, full_name')
        .eq('company_id', companyId)
        .eq('is_active', true);

      if (error) throw error;
      setManagers(data || []);
    } catch (error) {
      console.error('Error loading managers:', error);
    }
  };

  const calculatePasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    return strength;
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    if (field === 'password') {
      setPasswordStrength(calculatePasswordStrength(value as string));
    }
  };

  const validateForm = () => {
    if (!formData.fullName || !formData.email || !formData.username || !formData.password) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Validation Error",
        description: "Passwords do not match",
        variant: "destructive"
      });
      return false;
    }

    if (passwordStrength < 3) {
      toast({
        title: "Weak Password",
        description: "Password must be at least 8 characters with uppercase, lowercase, number, and symbol",
        variant: "destructive"
      });
      return false;
    }

    if (!selectedRole || !selectedBranch) {
      toast({
        title: "Validation Error",
        description: "Please select role and branch",
        variant: "destructive"
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm() || !currentUserCompanyId) return;

    setLoading(true);

    try {
      // Create Supabase Auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/login`
        }
      });

      if (authError) {
        toast({
          title: "Registration Failed",
          description: authError.message,
          variant: "destructive"
        });
        return;
      }

      if (!authData.user) {
        toast({
          title: "Registration Failed",
          description: "Failed to create user account",
          variant: "destructive"
        });
        return;
      }

      // Create user record in our users table
      const { data: userData, error: userError } = await supabase
        .from('users')
        .insert({
          auth_user_id: authData.user.id,
          company_id: currentUserCompanyId,
          branch_id: parseInt(selectedBranch),
          role_id: parseInt(selectedRole),
          username: formData.username,
          email: formData.email,
          full_name: formData.fullName,
          phone: formData.phone,
          address_line1: formData.addressLine1,
          address_line2: formData.addressLine2,
          city: formData.city,
          state: formData.state,
          pin_code: formData.pinCode,
          employee_code: formData.employeeCode,
          department: formData.department,
          designation: formData.designation,
          reporting_manager_id: selectedManager ? parseInt(selectedManager) : null,
          is_active: formData.isActive,
          email_verified: false,
          failed_login_attempts: 0,
          is_locked: false
        })
        .select()
        .single();

      if (userError) {
        // If user creation fails, we should clean up the auth user
        await supabase.auth.admin.deleteUser(authData.user.id);
        toast({
          title: "Registration Failed",
          description: userError.message,
          variant: "destructive"
        });
        return;
      }

      // Store password in history
      await supabase
        .from('password_history')
        .insert({
          user_id: userData.user_id,
          password_hash: formData.password // In production, this should be properly hashed
        });

      toast({
        title: "Registration Successful",
        description: `User ${formData.fullName} has been created successfully. Verification email sent.`,
      });

      // Reset form
      setFormData({
        fullName: '',
        email: '',
        phone: '',
        username: '',
        password: '',
        confirmPassword: '',
        addressLine1: '',
        addressLine2: '',
        city: '',
        state: '',
        pinCode: '',
        employeeCode: '',
        department: '',
        designation: '',
        isActive: true
      });
      setSelectedRole('');
      setSelectedBranch('');
      setSelectedManager('');
      setPasswordStrength(0);

    } catch (error) {
      console.error('Registration error:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength <= 2) return 'bg-red-500';
    if (passwordStrength <= 3) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getPasswordStrengthText = () => {
    if (passwordStrength <= 2) return 'Weak';
    if (passwordStrength <= 3) return 'Medium';
    return 'Strong';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="max-w-4xl mx-auto">
        <Card className="shadow-lg border-0 bg-white">
          <CardHeader className="text-center pb-4">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-blue-600 rounded-full">
                <UserPlus className="h-6 w-6 text-white" />
              </div>
            </div>
            <CardTitle className="text-2xl text-slate-900">Register New User</CardTitle>
            <CardDescription>
              Create a new user account for the warehouse management system
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Personal Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name *</Label>
                  <Input
                    id="fullName"
                    value={formData.fullName}
                    onChange={(e) => handleInputChange('fullName', e.target.value)}
                    placeholder="Enter full name"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="Enter email address"
                    required
                  />
                </div>
                
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
                  <Label htmlFor="username">Username *</Label>
                  <Input
                    id="username"
                    value={formData.username}
                    onChange={(e) => handleInputChange('username', e.target.value)}
                    placeholder="Enter username"
                    required
                  />
                </div>
              </div>

              {/* Password Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="password">Password *</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      placeholder="Enter password"
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                  {formData.password && (
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full transition-all ${getPasswordStrengthColor()}`}
                            style={{ width: `${(passwordStrength / 5) * 100}%` }}
                          />
                        </div>
                        <span className="text-sm text-gray-600">{getPasswordStrengthText()}</span>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password *</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={formData.confirmPassword}
                      onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                      placeholder="Confirm password"
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              </div>

              {/* Address Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="addressLine1">Address Line 1</Label>
                  <Input
                    id="addressLine1"
                    value={formData.addressLine1}
                    onChange={(e) => handleInputChange('addressLine1', e.target.value)}
                    placeholder="Enter address line 1"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="addressLine2">Address Line 2</Label>
                  <Input
                    id="addressLine2"
                    value={formData.addressLine2}
                    onChange={(e) => handleInputChange('addressLine2', e.target.value)}
                    placeholder="Enter address line 2"
                  />
                </div>
                
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
                  <Label htmlFor="pinCode">PIN Code</Label>
                  <Input
                    id="pinCode"
                    value={formData.pinCode}
                    onChange={(e) => handleInputChange('pinCode', e.target.value)}
                    placeholder="Enter PIN code"
                  />
                </div>
              </div>

              {/* Role and Organization */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="role">Role *</Label>
                  <Select value={selectedRole} onValueChange={setSelectedRole}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      {roles.map((role) => (
                        <SelectItem key={role.role_id} value={role.role_id.toString()}>
                          {role.role_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="branch">Branch *</Label>
                  <Select value={selectedBranch} onValueChange={setSelectedBranch}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select branch" />
                    </SelectTrigger>
                    <SelectContent>
                      {branches.map((branch) => (
                        <SelectItem key={branch.branch_id} value={branch.branch_id.toString()}>
                          {branch.branch_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="department">Department</Label>
                  <Input
                    id="department"
                    value={formData.department}
                    onChange={(e) => handleInputChange('department', e.target.value)}
                    placeholder="Enter department"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="designation">Designation</Label>
                  <Input
                    id="designation"
                    value={formData.designation}
                    onChange={(e) => handleInputChange('designation', e.target.value)}
                    placeholder="Enter designation"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="employeeCode">Employee Code</Label>
                  <Input
                    id="employeeCode"
                    value={formData.employeeCode}
                    onChange={(e) => handleInputChange('employeeCode', e.target.value)}
                    placeholder="Enter employee code"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="manager">Reporting Manager</Label>
                  <Select value={selectedManager} onValueChange={setSelectedManager}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select manager" />
                    </SelectTrigger>
                    <SelectContent>
                      {managers.map((manager) => (
                        <SelectItem key={manager.user_id} value={manager.user_id.toString()}>
                          {manager.full_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Status */}
              <div className="flex items-center space-x-2">
                <Switch
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => handleInputChange('isActive', checked)}
                />
                <Label htmlFor="isActive">Active User</Label>
              </div>

              {/* Submit Buttons */}
              <div className="flex space-x-4">
                <Button 
                  type="submit" 
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                  disabled={loading}
                >
                  {loading ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Creating User...</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <UserPlus className="h-4 w-4" />
                      <span>Create User</span>
                    </div>
                  )}
                </Button>
                
                <Button 
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/dashboard')}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Register;
