
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Warehouse, LogIn, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface Company {
  company_id: number;
  company_name: string;
}

interface Branch {
  branch_id: number;
  branch_name: string;
}

const Login = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedCompany, setSelectedCompany] = useState<string>('');
  const [selectedBranch, setSelectedBranch] = useState<string>('');
  const [rememberMe, setRememberMe] = useState(false);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [showCaptcha, setShowCaptcha] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  // Load companies on mount
  useEffect(() => {
    loadCompanies();
  }, []);

  // Load branches when company changes
  useEffect(() => {
    if (selectedCompany) {
      loadBranches(parseInt(selectedCompany));
    } else {
      setBranches([]);
      setSelectedBranch('');
    }
  }, [selectedCompany]);

  const loadCompanies = async () => {
    try {
      const { data, error } = await supabase
        .from('companies')
        .select('company_id, company_name')
        .eq('is_active', true);

      if (error) throw error;
      setCompanies(data || []);
    } catch (error) {
      console.error('Error loading companies:', error);
      toast({
        title: "Error",
        description: "Failed to load companies",
        variant: "destructive"
      });
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
      toast({
        title: "Error",
        description: "Failed to load branches",
        variant: "destructive"
      });
    }
  };

  const checkFailedAttempts = async () => {
    try {
      const { data } = await supabase
        .from('users')
        .select('failed_login_attempts, is_locked')
        .eq('email', email)
        .single();

      if (data && data.failed_login_attempts >= 3) {
        setShowCaptcha(true);
        setFailedAttempts(data.failed_login_attempts);
      }
    } catch (error) {
      console.error('Error checking failed attempts:', error);
    }
  };

  const recordFailedAttempt = async () => {
    try {
      // Record in failed_login_attempts table
      await supabase
        .from('failed_login_attempts')
        .insert({
          ip_address: 'unknown', // Would need to get actual IP
          user_agent: navigator.userAgent,
          reason: 'Invalid credentials'
        });

      // Update user's failed attempt count
      const { data: userData } = await supabase
        .from('users')
        .select('user_id, failed_login_attempts')
        .eq('email', email)
        .single();

      if (userData) {
        const newFailedAttempts = (userData.failed_login_attempts || 0) + 1;
        await supabase
          .from('users')
          .update({ 
            failed_login_attempts: newFailedAttempts,
            is_locked: newFailedAttempts >= 3
          })
          .eq('user_id', userData.user_id);

        if (newFailedAttempts >= 3) {
          setShowCaptcha(true);
        }
      }
    } catch (error) {
      console.error('Error recording failed attempt:', error);
    }
  };

  const createUserSession = async (userId: number, sessionId: string) => {
    try {
      const expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + (rememberMe ? 1440 : 30)); // 24h or 30min

      await supabase
        .from('user_sessions')
        .insert({
          session_id: sessionId,
          user_id: userId,
          ip_address: 'unknown', // Would need to get actual IP
          user_agent: navigator.userAgent,
          login_at: new Date().toISOString(),
          expires_at: expiresAt.toISOString(),
          is_active: true
        });
    } catch (error) {
      console.error('Error creating user session:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedCompany || !selectedBranch) {
      toast({
        title: "Error",
        description: "Please select company and branch",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      // Check failed attempts before proceeding
      await checkFailedAttempts();

      // Attempt Supabase Auth login
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (authError) {
        await recordFailedAttempt();
        toast({
          title: "Login Failed",
          description: authError.message,
          variant: "destructive"
        });
        return;
      }

      // Get user data from our users table
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('user_id, is_active, is_locked, company_id')
        .eq('email', email)
        .single();

      if (userError || !userData) {
        toast({
          title: "Error",
          description: "User account not found",
          variant: "destructive"
        });
        return;
      }

      if (!userData.is_active) {
        toast({
          title: "Account Disabled",
          description: "Your account has been disabled. Contact administrator.",
          variant: "destructive"
        });
        return;
      }

      if (userData.is_locked) {
        toast({
          title: "Account Locked",
          description: "Your account is locked due to failed login attempts. Contact administrator.",
          variant: "destructive"
        });
        return;
      }

      // Verify company access
      if (userData.company_id !== parseInt(selectedCompany)) {
        toast({
          title: "Access Denied",
          description: "You don't have access to the selected company",
          variant: "destructive"
        });
        return;
      }

      // Reset failed attempts on successful login
      await supabase
        .from('users')
        .update({ failed_login_attempts: 0, is_locked: false })
        .eq('user_id', userData.user_id);

      // Create user session with session ID from auth
      if (authData.session) {
        await createUserSession(userData.user_id, authData.session.access_token);
      }

      toast({
        title: "Login Successful",
        description: "Welcome back!",
      });

      navigate('/dashboard');
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg border-0 bg-white">
        <CardHeader className="text-center pb-4">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-blue-600 rounded-full">
              <Warehouse className="h-6 w-6 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl text-slate-900">InventControl Login</CardTitle>
          <CardDescription>
            Sign in to access your warehouse management system
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="company">Company</Label>
              <Select value={selectedCompany} onValueChange={setSelectedCompany}>
                <SelectTrigger>
                  <SelectValue placeholder="Select company" />
                </SelectTrigger>
                <SelectContent>
                  {companies.map((company) => (
                    <SelectItem key={company.company_id} value={company.company_id.toString()}>
                      {company.company_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="branch">Branch</Label>
              <Select value={selectedBranch} onValueChange={setSelectedBranch} disabled={!selectedCompany}>
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

            <div className="flex items-center space-x-2">
              <Checkbox
                id="remember"
                checked={rememberMe}
                onCheckedChange={(checked) => setRememberMe(checked as boolean)}
              />
              <Label htmlFor="remember" className="text-sm">Remember me</Label>
            </div>

            {showCaptcha && (
              <div className="flex items-center space-x-2 p-3 bg-yellow-50 border border-yellow-200 rounded">
                <AlertCircle className="h-4 w-4 text-yellow-600" />
                <span className="text-sm text-yellow-800">
                  Account locked after {failedAttempts} failed attempts. Contact administrator.
                </span>
              </div>
            )}

            <Button 
              type="submit" 
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              disabled={loading || showCaptcha}
            >
              {loading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Signing in...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <LogIn className="h-4 w-4" />
                  <span>Sign In</span>
                </div>
              )}
            </Button>

            <div className="text-center space-y-2">
              <button
                type="button"
                onClick={() => navigate('/reset-password')}
                className="text-sm text-blue-600 hover:text-blue-700 hover:underline"
              >
                Forgot your password?
              </button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
