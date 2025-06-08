import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import Layout from "@/components/Layout";
import { MoreHorizontal, Plus, Edit, ArrowRightLeft, BarChart2, CheckCircle, XCircle } from "lucide-react";

interface Vendor {
  vendor_id: number;
  vendor_code: string;
  vendor_name: string;
  contact_person?: string;
  primary_phone: string;
  email: string;
  vendor_type: "local" | "import" | "service";
  is_active: boolean;
  total_pos?: number;
  outstanding_amount?: number;
}

const VendorList = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [vendorType, setVendorType] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) fetchVendors();
    // eslint-disable-next-line
  }, [user, searchTerm, vendorType, statusFilter]);

  const fetchVendors = async () => {
    setLoading(true);
    try {
      // Fetch vendors with performance and outstanding info
      let query = supabase
        .from('vendors')
        .select(`
          vendor_id,
          vendor_code,
          vendor_name,
          contact_person,
          primary_phone,
          email,
          vendor_type,
          is_active,
          vendor_payments(amount_paid)
        `)
        .eq('company_id', 1);

      if (searchTerm) {
        query = query.or(`vendor_name.ilike.%${searchTerm}%,contact_person.ilike.%${searchTerm}%`);
      }
      if (vendorType !== "all") {
        query = query.eq('vendor_type', vendorType as "local" | "import" | "service");
      }
      if (statusFilter !== "all") {
        query = query.eq('is_active', statusFilter === "active");
      }

      const { data, error } = await query;
      if (error) throw error;

      // Calculate performance and outstanding
      const processed = (data || []).map((v: any) => {
        const payments = v.vendor_payments || [];
        const total_pos = 0;
        const total_paid = payments.reduce((sum: number, p: any) => sum + (p.amount_paid || 0), 0);
        const outstanding_amount = 0 - total_paid;
        return {
          ...v,
          total_pos,
          outstanding_amount,
        };
      });
      setVendors(processed);
    } catch (error) {
      console.error('Error fetching vendors:', error);
      toast.error('Failed to fetch vendors');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusToggle = async (vendor: Vendor) => {
    try {
      const { error } = await supabase
        .from('vendors')
        .update({ is_active: !vendor.is_active })
        .eq('vendor_id', vendor.vendor_id);
      if (error) throw error;
      toast.success(`Vendor ${vendor.is_active ? 'deactivated' : 'activated'}`);
      fetchVendors();
    } catch (error) {
      toast.error('Failed to update vendor status');
    }
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto py-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Vendors</h1>
          <Button onClick={() => navigate('/masters/vendors/add')}>
            <Plus className="h-4 w-4 mr-2" /> Add New Vendor
          </Button>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Vendor List</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4 mb-4">
              <Input
                placeholder="Search by name or contact person"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-64"
              />
              <Select value={vendorType} onValueChange={setVendorType}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Vendor Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="local">Local</SelectItem>
                  <SelectItem value="import">Import</SelectItem>
                  <SelectItem value="service">Service</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" onClick={() => navigate('/reports/purchase/vendors')}>
                <BarChart2 className="h-4 w-4 mr-2" /> Compare Vendors
              </Button>
            </div>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Contact Person</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Total POs</TableHead>
                    <TableHead>Outstanding</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {vendors.map(vendor => (
                    <TableRow key={vendor.vendor_id} className={vendor.outstanding_amount && vendor.outstanding_amount > 0 ? 'bg-red-50' : 'bg-green-50'}>
                      <TableCell>{vendor.vendor_code}</TableCell>
                      <TableCell>{vendor.vendor_name}</TableCell>
                      <TableCell>{vendor.contact_person}</TableCell>
                      <TableCell>{vendor.primary_phone}</TableCell>
                      <TableCell>{vendor.email}</TableCell>
                      <TableCell><Badge>{vendor.vendor_type}</Badge></TableCell>
                      <TableCell>
                        {vendor.is_active ? (
                          <span className="text-green-600 flex items-center"><CheckCircle className="h-4 w-4 mr-1" /> Active</span>
                        ) : (
                          <span className="text-gray-400 flex items-center"><XCircle className="h-4 w-4 mr-1" /> Inactive</span>
                        )}
                      </TableCell>
                      <TableCell>{vendor.total_pos}</TableCell>
                      <TableCell>
                        <span className={vendor.outstanding_amount && vendor.outstanding_amount > 0 ? 'text-red-600' : 'text-green-600'}>
                          {vendor.outstanding_amount?.toFixed(2) ?? '-'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => navigate(`/purchase/payments/add?vendor_id=${vendor.vendor_id}`)}>
                            <ArrowRightLeft className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => navigate(`/masters/vendors/edit/${vendor.vendor_id}`)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => handleStatusToggle(vendor)}>
                            {vendor.is_active ? <XCircle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {vendors.length === 0 && (
                <div className="text-center text-gray-500 py-8">No vendors found.</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default VendorList; 