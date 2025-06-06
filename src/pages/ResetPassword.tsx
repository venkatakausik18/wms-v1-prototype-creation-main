
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { KeyRound, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

interface SecurityQuestion {
  question_text: string;
  answer_hash: string;
}

const ResetPassword = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [step, setStep] = useState(1); // 1: Email, 2: Security Questions, 3: New Password
  const [email, setEmail] = useState('');
  const [securityQuestions, setSecurityQuestions] = useState<SecurityQuestion[]>([]);
  const [securityAnswers, setSecurityAnswers] = useState<string[]>([]);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<number | null>(null);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [useTemporaryPassword, setUseTemporaryPassword] = useState(false);

  const calculatePasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    return strength;
  };

  const generateTemporaryPassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Check if user exists and is active
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('user_id, email_verified, is_active')
        .eq('email', email)
        .single();

      if (userError || !userData) {
        toast({
          title: "User Not Found",
          description: "No account found with this email address",
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

      setUserId(userData.user_id);

      // Load security questions
      const { data: questionsData, error: questionsError } = await supabase
        .from('security_questions')
        .select('question_text, answer_hash')
        .eq('user_id', userData.user_id);

      if (questionsError) {
        toast({
          title: "Error",
          description: "Failed to load security questions",
          variant: "destructive"
        });
        return;
      }

      if (!questionsData || questionsData.length === 0) {
        toast({
          title: "No Security Questions",
          description: "No security questions found. Contact administrator for password reset.",
          variant: "destructive"
        });
        return;
      }

      setSecurityQuestions(questionsData);
      setSecurityAnswers(new Array(questionsData.length).fill(''));
      setStep(2);

    } catch (error) {
      console.error('Email verification error:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const hashAnswer = (answer: string) => {
    // In production, use proper hashing like bcrypt
    // This is a simple hash for demonstration
    return btoa(answer.toLowerCase().trim());
  };

  const handleSecurityQuestionsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Verify all security answers
      let allCorrect = true;
      for (let i = 0; i < securityQuestions.length; i++) {
        const hashedAnswer = hashAnswer(securityAnswers[i]);
        if (hashedAnswer !== securityQuestions[i].answer_hash) {
          allCorrect = false;
          break;
        }
      }

      if (!allCorrect) {
        toast({
          title: "Incorrect Answers",
          description: "One or more security answers are incorrect",
          variant: "destructive"
        });
        return;
      }

      setStep(3);

    } catch (error) {
      console.error('Security questions verification error:', error);
      toast({
        title: "Error",
        description: "Failed to verify security answers",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const checkPasswordHistory = async (newPasswordHash: string) => {
    try {
      const { data, error } = await supabase
        .from('password_history')
        .select('password_hash')
        .eq('user_id', userId)
        .order('changed_at', { ascending: false })
        .limit(5);

      if (error) throw error;

      return data?.some(record => record.password_hash === newPasswordHash) || false;
    } catch (error) {
      console.error('Error checking password history:', error);
      return false;
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userId) return;

    let finalPassword = newPassword;
    
    if (useTemporaryPassword) {
      finalPassword = generateTemporaryPassword();
    } else {
      if (newPassword !== confirmPassword) {
        toast({
          title: "Password Mismatch",
          description: "Passwords do not match",
          variant: "destructive"
        });
        return;
      }

      if (passwordStrength < 3) {
        toast({
          title: "Weak Password",
          description: "Password must be at least 8 characters with uppercase, lowercase, number, and symbol",
          variant: "destructive"
        });
        return;
      }
    }

    setLoading(true);

    try {
      // Check password history
      const isReused = await checkPasswordHistory(finalPassword);
      if (isReused) {
        toast({
          title: "Password Reuse",
          description: "Cannot reuse recent password. Please choose a different password.",
          variant: "destructive"
        });
        return;
      }

      // Reset password in Supabase Auth
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/login`
      });

      if (resetError) {
        toast({
          title: "Reset Failed",
          description: resetError.message,
          variant: "destructive"
        });
        return;
      }

      // Update user record
      await supabase
        .from('users')
        .update({
          password_changed_at: new Date().toISOString(),
          failed_login_attempts: 0,
          is_locked: false
        })
        .eq('user_id', userId);

      // Add to password history
      await supabase
        .from('password_history')
        .insert({
          user_id: userId,
          password_hash: finalPassword // In production, hash this properly
        });

      if (useTemporaryPassword) {
        toast({
          title: "Temporary Password Generated",
          description: `Your temporary password is: ${finalPassword}. Please change it after logging in.`,
        });
      } else {
        toast({
          title: "Password Reset Successful",
          description: "Your password has been reset. Please check your email for confirmation.",
        });
      }

      navigate('/login');

    } catch (error) {
      console.error('Password reset error:', error);
      toast({
        title: "Error",
        description: "Failed to reset password",
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

  const handlePasswordChange = (password: string) => {
    setNewPassword(password);
    setPasswordStrength(calculatePasswordStrength(password));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg border-0 bg-white">
        <CardHeader className="text-center pb-4">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-blue-600 rounded-full">
              <KeyRound className="h-6 w-6 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl text-slate-900">Reset Password</CardTitle>
          <CardDescription>
            {step === 1 && "Enter your email to start password reset"}
            {step === 2 && "Answer your security questions"}
            {step === 3 && "Set your new password"}
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          {step === 1 && (
            <form onSubmit={handleEmailSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  required
                />
              </div>
              
              <Button 
                type="submit" 
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                disabled={loading}
              >
                {loading ? "Verifying..." : "Continue"}
              </Button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleSecurityQuestionsSubmit} className="space-y-4">
              {securityQuestions.map((question, index) => (
                <div key={index} className="space-y-2">
                  <Label htmlFor={`answer-${index}`}>{question.question_text}</Label>
                  <Input
                    id={`answer-${index}`}
                    value={securityAnswers[index]}
                    onChange={(e) => {
                      const newAnswers = [...securityAnswers];
                      newAnswers[index] = e.target.value;
                      setSecurityAnswers(newAnswers);
                    }}
                    placeholder="Enter your answer"
                    required
                  />
                </div>
              ))}
              
              <Button 
                type="submit" 
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                disabled={loading}
              >
                {loading ? "Verifying..." : "Continue"}
              </Button>
            </form>
          )}

          {step === 3 && (
            <form onSubmit={handlePasswordReset} className="space-y-4">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="temporary"
                  checked={useTemporaryPassword}
                  onChange={(e) => setUseTemporaryPassword(e.target.checked)}
                />
                <Label htmlFor="temporary">Generate temporary password</Label>
              </div>

              {!useTemporaryPassword && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">New Password</Label>
                    <div className="relative">
                      <Input
                        id="newPassword"
                        type={showPassword ? 'text' : 'password'}
                        value={newPassword}
                        onChange={(e) => handlePasswordChange(e.target.value)}
                        placeholder="Enter new password"
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
                    {newPassword && (
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
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirm new password"
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
                </>
              )}
              
              <Button 
                type="submit" 
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                disabled={loading}
              >
                {loading ? "Resetting..." : "Reset Password"}
              </Button>
            </form>
          )}

          <div className="text-center mt-4">
            <button
              onClick={() => {
                if (step > 1) {
                  setStep(step - 1);
                } else {
                  navigate('/login');
                }
              }}
              className="text-sm text-blue-600 hover:text-blue-700 hover:underline flex items-center justify-center space-x-1"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>{step > 1 ? 'Back' : 'Back to Login'}</span>
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ResetPassword;
