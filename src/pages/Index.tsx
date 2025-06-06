
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Boxes, LogIn, Shield, Warehouse, BarChart3, Users, Package } from "lucide-react";

const Index = () => {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-600 rounded-lg">
                <Warehouse className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">InventControl Suite</h1>
                <p className="text-sm text-slate-600">Warehouse Management System</p>
              </div>
            </div>
            <div className="flex items-center space-x-4 text-sm text-slate-600">
              <div className="flex items-center space-x-1">
                <Shield className="h-4 w-4" />
                <span>Secure</span>
              </div>
              <div className="flex items-center space-x-1">
                <BarChart3 className="h-4 w-4" />
                <span>Analytics</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-12">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left side - Features */}
          <div className="space-y-8">
            <div>
              <h2 className="text-4xl font-bold text-slate-900 mb-4">
                Complete Warehouse Management Solution
              </h2>
              <p className="text-lg text-slate-600 leading-relaxed">
                Streamline your warehouse operations with our comprehensive management system. 
                Track inventory, manage orders, and optimize your supply chain with real-time insights.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-6">
              <div className="flex items-start space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Package className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">Inventory Management</h3>
                  <p className="text-sm text-slate-600">Real-time stock tracking and control</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Boxes className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">Order Processing</h3>
                  <p className="text-sm text-slate-600">Streamlined purchase and sales flow</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <BarChart3 className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">Advanced Reports</h3>
                  <p className="text-sm text-slate-600">Comprehensive analytics and insights</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Users className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">User Management</h3>
                  <p className="text-sm text-slate-600">Role-based access control</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right side - Login Form */}
          <div className="flex justify-center">
            <Card className="w-full max-w-md shadow-lg border-0 bg-white">
              <CardHeader className="text-center pb-4">
                <div className="flex justify-center mb-4">
                  <div className="p-3 bg-blue-600 rounded-full">
                    <LogIn className="h-6 w-6 text-white" />
                  </div>
                </div>
                <CardTitle className="text-2xl text-slate-900">
                  {isLogin ? "Welcome Back" : "Create Account"}
                </CardTitle>
                <CardDescription>
                  {isLogin 
                    ? "Sign in to access your warehouse dashboard" 
                    : "Get started with your warehouse management"
                  }
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {!isLogin && (
                  <div className="space-y-2">
                    <Label htmlFor="company">Company Name</Label>
                    <Input id="company" placeholder="Enter your company name" />
                  </div>
                )}
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="Enter your email" />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input id="password" type="password" placeholder="Enter your password" />
                </div>

                {!isLogin && (
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirm Password</Label>
                    <Input id="confirm-password" type="password" placeholder="Confirm your password" />
                  </div>
                )}

                <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                  {isLogin ? "Sign In" : "Create Account"}
                </Button>

                <Separator />

                <div className="text-center">
                  <button
                    onClick={() => setIsLogin(!isLogin)}
                    className="text-sm text-blue-600 hover:text-blue-700 hover:underline"
                  >
                    {isLogin 
                      ? "Don't have an account? Sign up" 
                      : "Already have an account? Sign in"
                    }
                  </button>
                </div>

                {isLogin && (
                  <div className="text-center">
                    <button className="text-sm text-slate-600 hover:text-slate-700 hover:underline">
                      Forgot your password?
                    </button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Bottom Features */}
        <div className="mt-20 text-center">
          <h3 className="text-2xl font-bold text-slate-900 mb-8">
            Trusted by Warehouses Worldwide
          </h3>
          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">99.9%</div>
              <div className="text-slate-600">Uptime</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">24/7</div>
              <div className="text-slate-600">Support</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">1000+</div>
              <div className="text-slate-600">Companies</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">50M+</div>
              <div className="text-slate-600">Transactions</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
