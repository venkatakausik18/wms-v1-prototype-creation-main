
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Plus, Edit, Eye, Search } from "lucide-react";

interface StockEntry {
  txn_id: number;
  txn_number: string;
  txn_type: string;
  txn_date: string;
  warehouse_id: number;
  warehouse_name?: string;
  total_items: number;
  total_quantity: number;
  total_value: number;
  reference_document?: string;
  created_at: string;
}

const StockEntryList = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  
  const [entries, setEntries] = useState<StockEntry[]>([]);
  const [filteredEntries, setFilteredEntries] = useState<StockEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) {
      fetchStockEntries();
    }
  }, [user]);

  useEffect(() => {
    filterEntries();
  }, [entries, searchTerm, typeFilter]);

  const fetchStockEntries = async () => {
    try {
      const { data, error } = await supabase
        .from('inventory_transactions')
        .select(`
          txn_id,
          txn_number,
          txn_type,
          txn_date,
          warehouse_id,
          total_items,
          total_quantity,
          total_value,
          reference_document,
          created_at,
          warehouses!warehouse_id(warehouse_name)
        `)
        .in('txn_type', ['purchase_in', 'purchase_return_in', 'transfer_in', 'adjustment_in'])
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const transformedData = data?.map(entry => ({
        ...entry,
        warehouse_name: (entry.warehouses as any)?.warehouse_name
      })) || [];
      
      setEntries(transformedData);
    } catch (error) {
      console.error('Error fetching stock entries:', error);
      toast.error('Failed to fetch stock entries');
    } finally {
      setIsLoading(false);
    }
  };

  const filterEntries = () => {
    let filtered = entries;

    if (searchTerm) {
      filtered = filtered.filter(entry =>
        entry.txn_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.reference_document?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.warehouse_name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (typeFilter && typeFilter !== "all") {
      filtered = filtered.filter(entry => entry.txn_type === typeFilter);
    }

    setFilteredEntries(filtered);
  };

  const formatTxnType = (type: string) => {
    return type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Stock Entry (Inward)</CardTitle>
                <CardDescription>
                  Manage inward stock transactions including purchases, returns, transfers, and adjustments
                </CardDescription>
              </div>
              <Button onClick={() => navigate('/inventory/stock-entry/add')}>
                <Plus className="mr-2 h-4 w-4" />
                New Stock Entry
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Filters */}
              <div className="flex gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by transaction number, reference, or warehouse..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Transaction Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="purchase_in">Purchase In</SelectItem>
                    <SelectItem value="purchase_return_in">Purchase Return In</SelectItem>
                    <SelectItem value="transfer_in">Transfer In</SelectItem>
                    <SelectItem value="adjustment_in">Adjustment In</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Table */}
              <div className="border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Transaction #</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Warehouse</TableHead>
                      <TableHead>Items</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Value</TableHead>
                      <TableHead>Reference</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      <TableRow>
                        <TableCell colSpan={9} className="text-center py-8">
                          Loading stock entries...
                        </TableCell>
                      </TableRow>
                    ) : filteredEntries.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={9} className="text-center py-8">
                          No stock entries found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredEntries.map((entry) => (
                        <TableRow key={entry.txn_id}>
                          <TableCell className="font-medium">{entry.txn_number}</TableCell>
                          <TableCell>{new Date(entry.txn_date).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {formatTxnType(entry.txn_type)}
                            </span>
                          </TableCell>
                          <TableCell>{entry.warehouse_name || '-'}</TableCell>
                          <TableCell>{entry.total_items || 0}</TableCell>
                          <TableCell>{entry.total_quantity || 0}</TableCell>
                          <TableCell>{formatCurrency(entry.total_value || 0)}</TableCell>
                          <TableCell>{entry.reference_document || '-'}</TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => navigate(`/inventory/stock-entry/view/${entry.txn_id}`)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => navigate(`/inventory/stock-entry/edit/${entry.txn_id}`)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default StockEntryList;
