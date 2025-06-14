
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Boxes, LogIn, Shield, Warehouse, BarChart3, Users, Package, CheckCircle, ArrowRight, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
      {/* Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg shadow">
                <Boxes className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">InventControl Suite</h1>
                <p className="text-sm text-slate-600">Warehouse Management System</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button 
                onClick={() => navigate('/login')}
                className="bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg transition-all"
              >
                <LogIn className="h-4 w-4 mr-2" />
                Sign In
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-16">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left side - Hero Content */}
          <div className="space-y-8">
            <div className="space-y-6">
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-100 text-blue-700 text-sm font-medium">
                <Star className="h-4 w-4 mr-2" />
                #1 Warehouse Management Platform
              </div>
              <h2 className="text-5xl font-bold text-slate-900 leading-tight">
                Transform Your 
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600"> Warehouse </span>
                Operations
              </h2>
              <p className="text-xl text-slate-600 leading-relaxed">
                Streamline inventory management, optimize workflows, and gain real-time insights 
                with our comprehensive warehouse management solution built for modern businesses.
              </p>
            </div>

            <div className="flex flex-wrap gap-4">
              <Button 
                onClick={() => navigate('/login')}
                size="lg"
                className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transition-all"
              >
                Get Started
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                className="border-slate-300 hover:bg-slate-50"
              >
                Watch Demo
              </Button>
            </div>

            {/* Features Grid */}
            <div className="grid sm:grid-cols-2 gap-6 pt-8">
              <div className="flex items-start space-x-4 p-4 rounded-lg bg-white/60 backdrop-blur-sm border border-slate-200">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Package className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">Smart Inventory</h3>
                  <p className="text-sm text-slate-600">AI-powered stock optimization and tracking</p>
                </div>
              </div>

              <div className="flex items-start space-x-4 p-4 rounded-lg bg-white/60 backdrop-blur-sm border border-slate-200">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Boxes className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">Order Management</h3>
                  <p className="text-sm text-slate-600">Streamlined purchase and fulfillment</p>
                </div>
              </div>

              <div className="flex items-start space-x-4 p-4 rounded-lg bg-white/60 backdrop-blur-sm border border-slate-200">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <BarChart3 className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">Analytics & Reports</h3>
                  <p className="text-sm text-slate-600">Data-driven insights and forecasting</p>
                </div>
              </div>

              <div className="flex items-start space-x-4 p-4 rounded-lg bg-white/60 backdrop-blur-sm border border-slate-200">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Shield className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">Security & Access</h3>
                  <p className="text-sm text-slate-600">Role-based permissions and audit trails</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right side - Login Card */}
          <div className="flex justify-center">
            <Card className="w-full max-w-md shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="text-center pb-6">
                <div className="flex justify-center mb-6">
                  <div className="p-4 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl shadow-lg">
                    <Warehouse className="h-8 w-8 text-white" />
                  </div>
                </div>
                <CardTitle className="text-2xl text-slate-900">
                  Access Your Dashboard
                </CardTitle>
                <CardDescription className="text-slate-600">
                  Sign in to manage your warehouse operations
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-3 p-3 rounded-lg bg-green-50 text-green-700">
                    <CheckCircle className="h-5 w-5" />
                    <span className="text-sm font-medium">Real-time inventory tracking</span>
                  </div>
                  <div className="flex items-center space-x-3 p-3 rounded-lg bg-blue-50 text-blue-700">
                    <CheckCircle className="h-5 w-5" />
                    <span className="text-sm font-medium">Advanced reporting & analytics</span>
                  </div>
                  <div className="flex items-center space-x-3 p-3 rounded-lg bg-purple-50 text-purple-700">
                    <CheckCircle className="h-5 w-5" />
                    <span className="text-sm font-medium">Multi-warehouse support</span>
                  </div>
                </div>
                
                <Button 
                  onClick={() => navigate('/login')}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all"
                  size="lg"
                >
                  <LogIn className="h-5 w-5 mr-2" />
                  Access Dashboard
                </Button>
                
                <Separator />
                
                <div className="text-center">
                  <p className="text-sm text-slate-600">
                    Need assistance? Contact your system administrator
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Stats Section */}
        <div className="mt-24 text-center">
          <div className="mb-12">
            <h3 className="text-3xl font-bold text-slate-900 mb-4">
              Trusted by Leading Businesses
            </h3>
            <p className="text-lg text-slate-600">
              Join thousands of companies optimizing their warehouse operations
            </p>
          </div>
          <div className="grid md:grid-cols-4 gap-8">
            <div className="p-6 rounded-lg bg-white/60 backdrop-blur-sm border border-slate-200">
              <div className="text-4xl font-bold text-blue-600 mb-2">99.9%</div>
              <div className="text-slate-600 font-medium">System Uptime</div>
            </div>
            <div className="p-6 rounded-lg bg-white/60 backdrop-blur-sm border border-slate-200">
              <div className="text-4xl font-bold text-green-600 mb-2">24/7</div>
              <div className="text-slate-600 font-medium">Expert Support</div>
            </div>
            <div className="p-6 rounded-lg bg-white/60 backdrop-blur-sm border border-slate-200">
              <div className="text-4xl font-bold text-purple-600 mb-2">1000+</div>
              <div className="text-slate-600 font-medium">Active Companies</div>
            </div>
            <div className="p-6 rounded-lg bg-white/60 backdrop-blur-sm border border-slate-200">
              <div className="text-4xl font-bold text-orange-600 mb-2">50M+</div>
              <div className="text-slate-600 font-medium">Daily Transactions</div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-24 pt-12 border-t border-slate-200 text-center">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="p-2 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg">
              <Boxes className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-semibold text-slate-900">InventControl Suite</span>
          </div>
          <p className="text-slate-600">
            © 2024 InventControl Suite. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Index;
