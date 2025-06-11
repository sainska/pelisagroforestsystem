
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Users, 
  Search, 
  UserCheck, 
  UserX, 
  Shield, 
  Eye,
  Edit,
  Trash2,
  Download,
  Filter
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import type { Profile } from "@/types/auth";

const UserManagementPanel = () => {
  const [users, setUsers] = useState<Profile[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<Profile[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, searchTerm, filterStatus]);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch users.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = users;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(user => 
        user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.national_id?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by status
    if (filterStatus !== 'all') {
      switch (filterStatus) {
        case 'approved':
          filtered = filtered.filter(user => user.account_approved);
          break;
        case 'pending':
          filtered = filtered.filter(user => !user.account_approved);
          break;
        case 'verified':
          filtered = filtered.filter(user => user.payment_verified);
          break;
        case 'admin':
          filtered = filtered.filter(user => user.role === 'NNECFA Admin');
          break;
        case 'official':
          filtered = filtered.filter(user => user.role === 'NNECFA Official');
          break;
      }
    }

    setFilteredUsers(filtered);
  };

  const approveUser = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ 
          account_approved: true,
          approved_at: new Date().toISOString(),
          approved_by: (await supabase.auth.getUser()).data.user?.id
        })
        .eq('id', userId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'User approved successfully.',
      });

      fetchUsers();
    } catch (error) {
      console.error('Error approving user:', error);
      toast({
        title: 'Error',
        description: 'Failed to approve user.',
        variant: 'destructive',
      });
    }
  };

  const suspendUser = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ account_approved: false })
        .eq('id', userId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'User suspended successfully.',
      });

      fetchUsers();
    } catch (error) {
      console.error('Error suspending user:', error);
      toast({
        title: 'Error',
        description: 'Failed to suspend user.',
        variant: 'destructive',
      });
    }
  };

  const exportUsers = () => {
    const csvContent = [
      ['Name', 'Email', 'National ID', 'Phone', 'Role', 'Status', 'Created At'],
      ...filteredUsers.map(user => [
        user.name || '',
        user.email,
        user.national_id || '',
        user.phone || '',
        user.role || '',
        user.account_approved ? 'Approved' : 'Pending',
        new Date(user.created_at).toLocaleDateString()
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `users_export_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5" />
            <span>User Management</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by name, email, or national ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border rounded-md"
            >
              <option value="all">All Users</option>
              <option value="approved">Approved</option>
              <option value="pending">Pending Approval</option>
              <option value="verified">Payment Verified</option>
              <option value="admin">Administrators</option>
              <option value="official">Officials</option>
            </select>
            <Button onClick={exportUsers} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin w-6 h-6 border-4 border-emerald-500 border-t-transparent rounded-full"></div>
              <span className="ml-2">Loading users...</span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left p-4 font-medium text-gray-700">User Details</th>
                    <th className="text-left p-4 font-medium text-gray-700">Contact</th>
                    <th className="text-left p-4 font-medium text-gray-700">Role</th>
                    <th className="text-left p-4 font-medium text-gray-700">Status</th>
                    <th className="text-left p-4 font-medium text-gray-700">Verification</th>
                    <th className="text-left p-4 font-medium text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="border-b hover:bg-gray-50">
                      <td className="p-4">
                        <div>
                          <p className="font-medium">{user.name || 'No Name'}</p>
                          <p className="text-sm text-gray-500">ID: {user.national_id || 'N/A'}</p>
                          <p className="text-xs text-gray-400">
                            Joined: {new Date(user.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </td>
                      <td className="p-4">
                        <div>
                          <p className="text-sm">{user.email}</p>
                          <p className="text-sm text-gray-500">{user.phone || 'No phone'}</p>
                        </div>
                      </td>
                      <td className="p-4">
                        <Badge 
                          variant={user.role === 'NNECFA Admin' ? 'destructive' : 
                                  user.role === 'NNECFA Official' ? 'default' : 'secondary'}
                        >
                          {user.role}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <Badge variant={user.account_approved ? 'default' : 'secondary'}>
                          {user.account_approved ? 'Approved' : 'Pending'}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <div className={`w-2 h-2 rounded-full ${user.email_verified ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                            <span className="text-xs">Email</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className={`w-2 h-2 rounded-full ${user.payment_verified ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                            <span className="text-xs">Payment</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className={`w-2 h-2 rounded-full ${user.face_verified ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                            <span className="text-xs">Identity</span>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex space-x-2">
                          {!user.account_approved ? (
                            <Button
                              size="sm"
                              onClick={() => approveUser(user.id)}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <UserCheck className="h-3 w-3 mr-1" />
                              Approve
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => suspendUser(user.id)}
                            >
                              <UserX className="h-3 w-3 mr-1" />
                              Suspend
                            </Button>
                          )}
                          <Button size="sm" variant="outline">
                            <Eye className="h-3 w-3" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredUsers.length === 0 && (
                <div className="text-center p-8 text-gray-500">
                  No users found matching your criteria.
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default UserManagementPanel;
