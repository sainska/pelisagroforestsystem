
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  CreditCard, 
  Search, 
  CheckCircle, 
  XCircle, 
  Eye,
  Download,
  DollarSign,
  Calendar,
  Phone
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface Payment {
  id: string;
  user_id: string;
  mpesa_code: string;
  phone_number: string;
  amount: number;
  status: string;
  payment_type: string;
  created_at: string;
  verified_at: string | null;
  verified_by: string | null;
  user_name?: string;
  user_email?: string;
}

interface STKRequest {
  id: string;
  phone_number: string;
  amount: number;
  account_reference: string;
  status: string;
  checkout_request_id: string | null;
  merchant_request_id: string | null;
  mpesa_receipt_number: string | null;
  created_at: string;
}

const PaymentManagementPanel = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [stkRequests, setStkRequests] = useState<STKRequest[]>([]);
  const [filteredPayments, setFilteredPayments] = useState<Payment[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [activeTab, setActiveTab] = useState('payments');
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalAmount: 0,
    verifiedAmount: 0,
    pendingAmount: 0,
    totalCount: 0
  });

  useEffect(() => {
    fetchPaymentsAndRequests();
  }, []);

  useEffect(() => {
    filterPayments();
    calculateStats();
  }, [payments, searchTerm, filterStatus]);

  const fetchPaymentsAndRequests = async () => {
    try {
      setIsLoading(true);
      
      const [paymentsRes, stkRequestsRes] = await Promise.all([
        supabase.from('payments')
          .select(`
            *,
            profiles:user_id (
              name,
              email
            )
          `)
          .order('created_at', { ascending: false }),
        supabase.from('stk_push_requests')
          .select('*')
          .order('created_at', { ascending: false })
      ]);

      if (paymentsRes.error) throw paymentsRes.error;
      if (stkRequestsRes.error) throw stkRequestsRes.error;

      const processedPayments = (paymentsRes.data || []).map(payment => ({
        ...payment,
        user_name: payment.profiles?.name || 'Unknown',
        user_email: payment.profiles?.email || 'Unknown'
      }));

      setPayments(processedPayments);
      setStkRequests(stkRequestsRes.data || []);
    } catch (error) {
      console.error('Error fetching payments:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch payment data.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filterPayments = () => {
    let filtered = payments;

    if (searchTerm) {
      filtered = filtered.filter(payment => 
        payment.mpesa_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.phone_number.includes(searchTerm) ||
        payment.user_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.user_email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterStatus !== 'all') {
      filtered = filtered.filter(payment => payment.status === filterStatus);
    }

    setFilteredPayments(filtered);
  };

  const calculateStats = () => {
    const totalAmount = payments.reduce((sum, payment) => sum + Number(payment.amount), 0);
    const verifiedAmount = payments
      .filter(payment => payment.status === 'Verified')
      .reduce((sum, payment) => sum + Number(payment.amount), 0);
    const pendingAmount = payments
      .filter(payment => payment.status === 'Pending')
      .reduce((sum, payment) => sum + Number(payment.amount), 0);

    setStats({
      totalAmount,
      verifiedAmount,
      pendingAmount,
      totalCount: payments.length
    });
  };

  const verifyPayment = async (paymentId: string) => {
    try {
      const { error } = await supabase
        .from('payments')
        .update({ 
          status: 'Verified',
          verified_at: new Date().toISOString(),
          verified_by: (await supabase.auth.getUser()).data.user?.id
        })
        .eq('id', paymentId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Payment verified successfully.',
      });

      fetchPaymentsAndRequests();
    } catch (error) {
      console.error('Error verifying payment:', error);
      toast({
        title: 'Error',
        description: 'Failed to verify payment.',
        variant: 'destructive',
      });
    }
  };

  const rejectPayment = async (paymentId: string) => {
    try {
      const { error } = await supabase
        .from('payments')
        .update({ 
          status: 'Rejected',
          verified_at: new Date().toISOString(),
          verified_by: (await supabase.auth.getUser()).data.user?.id
        })
        .eq('id', paymentId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Payment rejected.',
      });

      fetchPaymentsAndRequests();
    } catch (error) {
      console.error('Error rejecting payment:', error);
      toast({
        title: 'Error',
        description: 'Failed to reject payment.',
        variant: 'destructive',
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Verified': return 'bg-green-100 text-green-800';
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      case 'Rejected': return 'bg-red-100 text-red-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const exportPayments = () => {
    const csvContent = [
      ['Date', 'User', 'M-Pesa Code', 'Phone', 'Amount', 'Status', 'Type'],
      ...filteredPayments.map(payment => [
        new Date(payment.created_at).toLocaleDateString(),
        payment.user_name,
        payment.mpesa_code,
        payment.phone_number,
        payment.amount,
        payment.status,
        payment.payment_type
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `payments_export_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-green-800">
                  KSh {stats.totalAmount.toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Verified</p>
                <p className="text-2xl font-bold text-blue-800">
                  KSh {stats.verifiedAmount.toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-yellow-800">
                  KSh {stats.pendingAmount.toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CreditCard className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">Total Payments</p>
                <p className="text-2xl font-bold text-purple-800">{stats.totalCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Header and Controls */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <CreditCard className="h-5 w-5" />
              <span>Payment Management</span>
            </CardTitle>
            <div className="flex space-x-2">
              <Button
                variant={activeTab === 'payments' ? 'default' : 'outline'}
                onClick={() => setActiveTab('payments')}
              >
                Payments ({payments.length})
              </Button>
              <Button
                variant={activeTab === 'stk-requests' ? 'default' : 'outline'}
                onClick={() => setActiveTab('stk-requests')}
              >
                STK Requests ({stkRequests.length})
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by M-Pesa code, phone, or user..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            {activeTab === 'payments' && (
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border rounded-md"
              >
                <option value="all">All Status</option>
                <option value="Verified">Verified</option>
                <option value="Pending">Pending</option>
                <option value="Rejected">Rejected</option>
              </select>
            )}
            <Button onClick={exportPayments} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Content based on active tab */}
      {activeTab === 'payments' ? (
        <Card>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex items-center justify-center p-8">
                <div className="animate-spin w-6 h-6 border-4 border-emerald-500 border-t-transparent rounded-full"></div>
                <span className="ml-2">Loading payments...</span>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="text-left p-4 font-medium text-gray-700">User</th>
                      <th className="text-left p-4 font-medium text-gray-700">Payment Details</th>
                      <th className="text-left p-4 font-medium text-gray-700">Amount</th>
                      <th className="text-left p-4 font-medium text-gray-700">Status</th>
                      <th className="text-left p-4 font-medium text-gray-700">Date</th>
                      <th className="text-left p-4 font-medium text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPayments.map((payment) => (
                      <tr key={payment.id} className="border-b hover:bg-gray-50">
                        <td className="p-4">
                          <div>
                            <p className="font-medium">{payment.user_name}</p>
                            <p className="text-sm text-gray-500">{payment.user_email}</p>
                          </div>
                        </td>
                        <td className="p-4">
                          <div>
                            <p className="font-mono text-sm">{payment.mpesa_code}</p>
                            <p className="text-sm text-gray-500 flex items-center">
                              <Phone className="h-3 w-3 mr-1" />
                              {payment.phone_number}
                            </p>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className="font-bold text-green-600">
                            KSh {Number(payment.amount).toLocaleString()}
                          </span>
                        </td>
                        <td className="p-4">
                          <Badge className={getStatusColor(payment.status)}>
                            {payment.status}
                          </Badge>
                        </td>
                        <td className="p-4">
                          <div>
                            <p className="text-sm">{new Date(payment.created_at).toLocaleDateString()}</p>
                            <p className="text-xs text-gray-500">
                              {new Date(payment.created_at).toLocaleTimeString()}
                            </p>
                          </div>
                        </td>
                        <td className="p-4">
                          {payment.status === 'Pending' ? (
                            <div className="flex space-x-2">
                              <Button
                                size="sm"
                                onClick={() => verifyPayment(payment.id)}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Verify
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => rejectPayment(payment.id)}
                              >
                                <XCircle className="h-3 w-3 mr-1" />
                                Reject
                              </Button>
                            </div>
                          ) : (
                            <Button size="sm" variant="outline">
                              <Eye className="h-3 w-3" />
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filteredPayments.length === 0 && (
                  <div className="text-center p-8 text-gray-500">
                    No payments found matching your criteria.
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left p-4 font-medium text-gray-700">Phone Number</th>
                    <th className="text-left p-4 font-medium text-gray-700">Amount</th>
                    <th className="text-left p-4 font-medium text-gray-700">Reference</th>
                    <th className="text-left p-4 font-medium text-gray-700">Status</th>
                    <th className="text-left p-4 font-medium text-gray-700">Request ID</th>
                    <th className="text-left p-4 font-medium text-gray-700">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {stkRequests.map((request) => (
                    <tr key={request.id} className="border-b hover:bg-gray-50">
                      <td className="p-4">
                        <span className="font-mono">{request.phone_number}</span>
                      </td>
                      <td className="p-4">
                        <span className="font-bold">KSh {Number(request.amount).toLocaleString()}</span>
                      </td>
                      <td className="p-4">
                        <span className="text-sm">{request.account_reference}</span>
                      </td>
                      <td className="p-4">
                        <Badge className={getStatusColor(request.status)}>
                          {request.status}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <span className="font-mono text-xs">{request.checkout_request_id || 'N/A'}</span>
                      </td>
                      <td className="p-4">
                        <p className="text-sm">{new Date(request.created_at).toLocaleDateString()}</p>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PaymentManagementPanel;
