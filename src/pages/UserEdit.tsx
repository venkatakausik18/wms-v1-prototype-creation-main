
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
import { Switch } from '@/components/ui/switch';
import { toast } from '@/hooks/use-toast';
import { ArrowLeft, User } from 'lucide-react';

const userSchema = z.object({
  full_name: z.string().min(1, 'Full name is required'),
  employee_code: z.string().optional(),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  address_line1: z.string().optional(),
  address_line2: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  pin_code: z.string().optional(),
  date_of_birth: z.string().optional(),
  date_of_joining: z.string().optional(),
  department: z.string().optional(),
  designation: z.string().optional(),
  reporting_manager_id: z.number().optional(),
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(6, 'Password must be at least 6 characters').optional(),
  role_id: z.number().min(1, 'Role is required'),
  ip_restrictions: z.string().optional(),
  login_time_restrictions: z.string().optional(),
  commission_structure: z.string().optional(),
  target_assignment: z.string().optional(),
  notification_preferences: z.string().optional(),
  language_preference: z.string().default('en'),
  is_active: z.boolean().default(true),
});

type UserFormData = z.infer<typeof userSchema>;

const UserEdit = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const isNew = !userId || userId === 'new';
  const [loading, setLoading] = useState(false);
  const [roles, setRoles] = useState<Array<{ role_id: number; role_name: string }>>([]);
  const [managers, setManagers] = useState<Array<{ user_id: number; full_name: string }>>([]);

  const form = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      full_name: '',
      employee_code: '',
      email: '',
      phone: '',
      address_line1: '',
      address_line2: '',
      city: '',
      state: '',
      pin_code: '',
      date_of_birth: '',
      date_of_joining: '',
      department: '',
      designation: '',
      username: '',
      password: '',
      ip_restrictions: '',
      login_time_restrictions: '',
      commission_structure: '',
      target_assignment: '',
      notification_preferences: '',
      language_preference: 'en',
      is_active: true,
    },
  });

  useEffect(() => {
    fetchRoles();
    fetchManagers();
    if (!isNew && userId) {
      fetchUser();
    }
  }, [userId, isNew]);

  const fetchRoles = async () => {
    try {
      const { data, error } = await supabase
        .from('roles')
        .select('role_id, role_name')
        .eq('is_active', true)
        .order('role_name');

      if (error) throw error;
      setRoles(data || []);
    } catch (error) {
      console.error('Error fetching roles:', error);
    }
  };

  const fetchManagers = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('user_id, full_name')
        .eq('is_active', true)
        .order('full_name');

      if (error) throw error;
      setManagers(data || []);
    } catch (error) {
      console.error('Error fetching managers:', error);
    }
  };

  const fetchUser = async () => {
    if (!userId || userId === 'new') return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('user_id', parseInt(userId))
        .single();

      if (error) throw error;

      if (data) {
        const formData: UserFormData = {
          full_name: data.full_name || '',
          employee_code: data.employee_code || '',
          email: data.email || '',
          phone: data.phone || '',
          address_line1: data.address_line1 || '',
          address_line2: data.address_line2 || '',
          city: data.city || '',
          state: data.state || '',
          pin_code: data.pin_code || '',
          date_of_birth: data.date_of_birth || '',
          date_of_joining: data.date_of_joining || '',
          department: data.department || '',
          designation: data.designation || '',
          reporting_manager_id: data.reporting_manager_id,
          username: data.username || '',
          role_id: data.role_id,
          ip_restrictions: data.ip_restrictions || '',
          login_time_restrictions: JSON.stringify(data.login_time_restrictions) || '',
          commission_structure: JSON.stringify(data.commission_structure) || '',
          target_assignment: JSON.stringify(data.target_assignment) || '',
          notification_preferences: JSON.stringify(data.notification_preferences) || '',
          language_preference: data.language_preference || 'en',
          is_active: data.is_active ?? true,
        };
        form.reset(formData);
      }
    } catch (error) {
      console.error('Error fetching user:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch user details',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: UserFormData) => {
    try {
      setLoading(true);

      // Parse JSON fields safely
      let loginTimeRestrictions = null;
      let commissionStructure = null;
      let targetAssignment = null;
      let notificationPreferences = null;

      try {
        loginTimeRestrictions = data.login_time_restrictions ? JSON.parse(data.login_time_restrictions) : null;
      } catch (e) {
        console.warn('Invalid login_time_restrictions JSON');
      }

      try {
        commissionStructure = data.commission_structure ? JSON.parse(data.commission_structure) : null;
      } catch (e) {
        console.warn('Invalid commission_structure JSON');
      }

      try {
        targetAssignment = data.target_assignment ? JSON.parse(data.target_assignment) : null;
      } catch (e) {
        console.warn('Invalid target_assignment JSON');
      }

      try {
        notificationPreferences = data.notification_preferences ? JSON.parse(data.notification_preferences) : null;
      } catch (e) {
        console.warn('Invalid notification_preferences JSON');
      }

      // Prepare user data
      const saveData = {
        full_name: data.full_name,
        employee_code: data.employee_code || null,
        email: data.email,
        phone: data.phone || null,
        address_line1: data.address_line1 || null,
        address_line2: data.address_line2 || null,
        city: data.city || null,
        state: data.state || null,
        pin_code: data.pin_code || null,
        date_of_birth: data.date_of_birth || null,
        date_of_joining: data.date_of_joining || null,
        department: data.department || null,
        designation: data.designation || null,
        reporting_manager_id: data.reporting_manager_id || null,
        username: data.username,
        role_id: data.role_id,
        ip_restrictions: data.ip_restrictions || null,
        login_time_restrictions: loginTimeRestrictions,
        commission_structure: commissionStructure,
        target_assignment: targetAssignment,
        notification_preferences: notificationPreferences,
        language_preference: data.language_preference || 'en',
        is_active: data.is_active,
        company_id: 1, // Default company_id for now
      };

      if (isNew) {
        // For new users, add password_hash field (in real app, this should be properly hashed)
        const userDataWithPassword = {
          ...saveData,
          password_hash: data.password || 'temp_password', // Temporary solution
        };

        const { data: userData, error } = await supabase
          .from('users')
          .insert(userDataWithPassword)
          .select()
          .single();

        if (error) throw error;

        // Insert password history if password is provided
        if (data.password && userData) {
          const { error: passwordError } = await supabase
            .from('password_history')
            .insert({
              user_id: userData.user_id,
              password_hash: data.password, // In real app, hash this
            });

          if (passwordError) console.warn('Password history insert failed:', passwordError);
        }

        toast({
          title: 'Success',
          description: 'User created successfully',
        });
      } else {
        // Update user
        const { error } = await supabase
          .from('users')
          .update(saveData)
          .eq('user_id', parseInt(userId!));

        if (error) throw error;

        // If password is being changed
        if (data.password) {
          // Update password_hash in users table
          const { error: passwordUpdateError } = await supabase
            .from('users')
            .update({ password_hash: data.password })
            .eq('user_id', parseInt(userId!));

          if (passwordUpdateError) console.warn('Password update failed:', passwordUpdateError);

          // Insert into password history
          const { error: passwordError } = await supabase
            .from('password_history')
            .insert({
              user_id: parseInt(userId!),
              password_hash: data.password, // In real app, hash this
            });

          if (passwordError) console.warn('Password history insert failed:', passwordError);
        }

        toast({
          title: 'Success',
          description: 'User updated successfully',
        });
      }

      navigate('/settings/users/list');
    } catch (error) {
      console.error('Error saving user:', error);
      toast({
        title: 'Error',
        description: 'Failed to save user',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="flex items-center mb-6">
        <Button variant="ghost" onClick={() => navigate('/settings/users/list')} className="mr-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Users
        </Button>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <User className="h-8 w-8" />
          {isNew ? 'Add New User' : 'Edit User'}
        </h1>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>
                Basic personal details of the user
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="full_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name *</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Enter full name" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="employee_code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Employee Code</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Enter employee code" />
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
                      <FormLabel>Email *</FormLabel>
                      <FormControl>
                        <Input {...field} type="email" placeholder="Enter email address" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

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
                  name="date_of_birth"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date of Birth</FormLabel>
                      <FormControl>
                        <Input {...field} type="date" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="date_of_joining"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date of Joining</FormLabel>
                      <FormControl>
                        <Input {...field} type="date" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Address Information */}
          <Card>
            <CardHeader>
              <CardTitle>Address Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
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
            </CardContent>
          </Card>

          {/* Job Information */}
          <Card>
            <CardHeader>
              <CardTitle>Job Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="department"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Department</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Enter department" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="designation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Designation</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Enter designation" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="reporting_manager_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Reporting Manager</FormLabel>
                      <Select 
                        onValueChange={(value) => field.onChange(parseInt(value))} 
                        value={field.value?.toString()}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select reporting manager" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {managers.map(manager => (
                            <SelectItem key={manager.user_id} value={manager.user_id.toString()}>
                              {manager.full_name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="role_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Role *</FormLabel>
                      <Select 
                        onValueChange={(value) => field.onChange(parseInt(value))} 
                        value={field.value?.toString()}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select role" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {roles.map(role => (
                            <SelectItem key={role.role_id} value={role.role_id.toString()}>
                              {role.role_name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* System Access */}
          <Card>
            <CardHeader>
              <CardTitle>System Access</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Username *</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Enter username" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {isNew && (
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password *</FormLabel>
                        <FormControl>
                          <Input {...field} type="password" placeholder="Enter password" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                {!isNew && (
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>New Password (optional)</FormLabel>
                        <FormControl>
                          <Input {...field} type="password" placeholder="Enter new password" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                <FormField
                  control={form.control}
                  name="language_preference"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Language Preference</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select language" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="en">English</SelectItem>
                          <SelectItem value="hi">Hindi</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="is_active"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Active Status</FormLabel>
                        <div className="text-sm text-muted-foreground">
                          Enable or disable user access
                        </div>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Advanced Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Advanced Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="ip_restrictions"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>IP Restrictions</FormLabel>
                    <FormControl>
                      <Textarea {...field} placeholder="Enter allowed IP addresses (one per line)" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="login_time_restrictions"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Login Time Restrictions (JSON)</FormLabel>
                      <FormControl>
                        <Textarea {...field} placeholder='{"start":"09:00","end":"18:00"}' />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="commission_structure"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Commission Structure (JSON)</FormLabel>
                      <FormControl>
                        <Textarea {...field} placeholder='{"sales": 5, "purchase": 2}' />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="target_assignment"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Target Assignment (JSON)</FormLabel>
                      <FormControl>
                        <Textarea {...field} placeholder='{"monthly_sales": 100000}' />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="notification_preferences"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notification Preferences (JSON)</FormLabel>
                      <FormControl>
                        <Textarea {...field} placeholder='{"email":true,"sms":false}' />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex gap-4">
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : isNew ? 'Create User' : 'Update User'}
            </Button>
            <Button type="button" variant="outline" onClick={() => navigate('/settings/users/list')}>
              Cancel
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default UserEdit;
