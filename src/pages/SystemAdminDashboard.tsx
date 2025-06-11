
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Users, 
  FileText, 
  Settings, 
  Database, 
  Shield, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  BarChart3,
  MapPin,
  CreditCard,
  MessageSquare,
  Download,
  Upload,
  Eye,
  UserCheck,
  Globe
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import AdminProtectedRoute from "@/components/AdminProtectedRoute";
import UserManagementPanel from "@/components/admin/UserManagementPanel";
import PlotManagementPanel from "@/components/admin/PlotManagementPanel";
import PaymentManagementPanel from "@/components/admin/PaymentManagementPanel";
import SystemLogsPanel from "@/components/admin/SystemLogsPanel";
import ReportsAnalyticsPanel from "@/components/admin/ReportsAnalyticsPanel";
import NotificationManagementPanel from "@/components/admin/NotificationManagementPanel";
import BackupManagementPanel from "@/components/admin/BackupManagementPanel";
import SystemSettingsPanel from "@/components/admin/SystemSettingsPanel";

const SystemAdminDashboard = () => {
  const { profile } = useAuth();
  const [activePanel, setActivePanel] = useState('overview');
  const [systemStats, setSystemStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    pendingApprovals: 0,
    totalPlots: 0,
    availablePlots: 0,
    assignedPlots: 0,
    totalPayments: 0,
    pendingPayments: 0,
    verifiedPayments: 0,
    totalApplications: 0,
    approvedApplications: 0,
    rejectedApplications: 0,
    systemLogs: 0,
    unreadNotifications: 0,
    marketplaceListings: 0,
    cropReports: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchSystemStats();
  }, []);

  const fetchSystemStats = async () => {
    try {
      setIsLoading(true);
      
      const [
        usersRes,
        activeUsersRes,
        pendingApprovalsRes,
        plotsRes,
        availablePlotsRes,
        assignedPlotsRes,
        paymentsRes,
        pendingPaymentsRes,
        verifiedPaymentsRes,
        applicationsRes,
        approvedApplicationsRes,
        rejectedApplicationsRes,
        systemLogsRes,
        notificationsRes,
        marketplaceRes,
        cropReportsRes
      ] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('profiles').select('*', { count: 'exact', head: true })
          .eq('account_approved', true),
        supabase.from('profiles').select('*', { count: 'exact', head: true })
          .eq('account_approved', false),
        supabase.from('plots').select('*', { count: 'exact', head: true }),
        supabase.from('plots').select('*', { count: 'exact', head: true })
          .eq('status', 'Available'),
        supabase.from('plots').select('*', { count: 'exact', head: true })
          .eq('status', 'Assigned'),
        supabase.from('payments').select('*', { count: 'exact', head: true }),
        supabase.from('payments').select('*', { count: 'exact', head: true })
          .eq('status', 'Pending'),
        supabase.from('payments').select('*', { count: 'exact', head: true })
          .eq('status', 'Verified'),
        supabase.from('plot_applications').select('*', { count: 'exact', head: true }),
        supabase.from('plot_applications').select('*', { count: 'exact', head: true })
          .eq('status', 'Approved'),
        supabase.from('plot_applications').select('*', { count: 'exact', head: true })
          .eq('status', 'Rejected'),
        supabase.from('system_logs').select('*', { count: 'exact', head: true }),
        supabase.from('notifications').select('*', { count: 'exact', head: true })
          .eq('is_read', false),
        supabase.from('marketplace_listings').select('*', { count: 'exact', head: true }),
        supabase.from('crop_reports').select('*', { count: 'exact', head: true })
      ]);

      setSystemStats({
        totalUsers: usersRes.count || 0,
        activeUsers: activeUsersRes.count || 0,
        pendingApprovals: pendingApprovalsRes.count || 0,
        totalPlots: plotsRes.count || 0,
        availablePlots: availablePlotsRes.count || 0,
        assignedPlots: assignedPlotsRes.count || 0,
        totalPayments: paymentsRes.count || 0,
        pendingPayments: pendingPaymentsRes.count || 0,
        verifiedPayments: verifiedPaymentsRes.count || 0,
        totalApplications: applicationsRes.count || 0,
        approvedApplications: approvedApplicationsRes.count || 0,
        rejectedApplications: rejectedApplicationsRes.count || 0,
        systemLogs: systemLogsRes.count || 0,
        unreadNotifications: notificationsRes.count || 0,
        marketplaceListings: marketplaceRes.count || 0,
        cropReports: cropReportsRes.count || 0
      });
    } catch (error) {
      console.error('Error fetching system stats:', error);
      toast({
        title: 'Error',
        description: 'Failed to load system statistics.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const adminPanels = [
    {
      id: 'overview',
      title: 'System Overview',
      icon: <BarChart3 className="h-5 w-5" />,
      description: 'System statistics and health monitoring'
    },
    {
      id: 'users',
      title: 'User Management',
      icon: <Users className="h-5 w-5" />,
      description: 'Manage users, roles, and approvals'
    },
    {
      id: 'plots',
      title: 'Plot Management',
      icon: <MapPin className="h-5 w-5" />,
      description: 'Manage plots, assignments, and applications'
    },
    {
      id: 'payments',
      title: 'Payment Management',
      icon: <CreditCard className="h-5 w-5" />,
      description: 'Monitor and verify payments'
    },
    {
      id: 'reports',
      title: 'Reports & Analytics',
      icon: <TrendingUp className="h-5 w-5" />,
      description: 'System reports and data analytics'
    },
    {
      id: 'notifications',
      title: 'Notifications',
      icon: <MessageSquare className="h-5 w-5" />,
      description: 'Manage system notifications'
    },
    {
      id: 'logs',
      title: 'System Logs',
      icon: <FileText className="h-5 w-5" />,
      description: 'View system activity and audit logs'
    },
    {
      id: 'backup',
      title: 'Backup & Restore',
      icon: <Database className="h-5 w-5" />,
      description: 'Data backup and recovery management'
    },
    {
      id: 'settings',
      title: 'System Settings',
      icon: <Settings className="h-5 w-5" />,
      description: 'Configure system parameters'
    }
  ];

  const renderActivePanel = () => {
    switch (activePanel) {
      case 'users':
        return <UserManagementPanel />;
      case 'plots':
        return <PlotManagementPanel />;
      case 'payments':
        return <PaymentManagementPanel />;
      case 'reports':
        return <ReportsAnalyticsPanel />;
      case 'notifications':
        return <NotificationManagementPanel />;
      case 'logs':
        return <SystemLogsPanel />;
      case 'backup':
        return <BackupManagementPanel />;
      case 'settings':
        return <SystemSettingsPanel />;
      default:
        return (
          <div className="space-y-6">
            {/* System Health Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Users className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="text-sm text-gray-600">Total Users</p>
                      <p className="text-2xl font-bold text-blue-800">{systemStats.totalUsers}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge variant="outline" className="text-green-600">
                          {systemStats.activeUsers} Active
                        </Badge>
                        <Badge variant="outline" className="text-yellow-600">
                          {systemStats.pendingApprovals} Pending
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="text-sm text-gray-600">Total Plots</p>
                      <p className="text-2xl font-bold text-green-800">{systemStats.totalPlots}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge variant="outline" className="text-green-600">
                          {systemStats.availablePlots} Available
                        </Badge>
                        <Badge variant="outline" className="text-blue-600">
                          {systemStats.assignedPlots} Assigned
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <CreditCard className="h-5 w-5 text-purple-600" />
                    <div>
                      <p className="text-sm text-gray-600">Payments</p>
                      <p className="text-2xl font-bold text-purple-800">{systemStats.totalPayments}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge variant="outline" className="text-green-600">
                          {systemStats.verifiedPayments} Verified
                        </Badge>
                        <Badge variant="outline" className="text-yellow-600">
                          {systemStats.pendingPayments} Pending
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <FileText className="h-5 w-5 text-orange-600" />
                    <div>
                      <p className="text-sm text-gray-600">Applications</p>
                      <p className="text-2xl font-bold text-orange-800">{systemStats.totalApplications}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge variant="outline" className="text-green-600">
                          {systemStats.approvedApplications} Approved
                        </Badge>
                        <Badge variant="outline" className="text-red-600">
                          {systemStats.rejectedApplications} Rejected
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick System Health */}
            <Card>
              <CardHeader>
                <CardTitle className="text-emerald-800">System Health Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="flex items-center space-x-3 p-4 bg-green-50 rounded-lg">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                    <div>
                      <p className="font-semibold text-green-800">Database</p>
                      <p className="text-sm text-green-600">Connected & Healthy</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-4 bg-green-50 rounded-lg">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                    <div>
                      <p className="font-semibold text-green-800">Authentication</p>
                      <p className="text-sm text-green-600">Services Active</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-4 bg-yellow-50 rounded-lg">
                    <AlertTriangle className="h-6 w-6 text-yellow-600" />
                    <div>
                      <p className="font-semibold text-yellow-800">Pending Actions</p>
                      <p className="text-sm text-yellow-600">{systemStats.pendingApprovals} User Approvals</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="text-emerald-800">Recent System Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="text-center p-4 border rounded-lg">
                    <p className="text-2xl font-bold text-blue-600">{systemStats.marketplaceListings}</p>
                    <p className="text-sm text-gray-600">Marketplace Listings</p>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <p className="text-2xl font-bold text-green-600">{systemStats.cropReports}</p>
                    <p className="text-sm text-gray-600">Crop Reports</p>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <p className="text-2xl font-bold text-purple-600">{systemStats.systemLogs}</p>
                    <p className="text-sm text-gray-600">System Logs</p>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <p className="text-2xl font-bold text-orange-600">{systemStats.unreadNotifications}</p>
                    <p className="text-sm text-gray-600">Unread Notifications</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full"></div>
        <p className="ml-2 text-emerald-700">Loading system dashboard...</p>
      </div>
    );
  }

  return (
    <AdminProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <div className="flex">
          {/* Sidebar Navigation */}
          <div className="w-64 bg-white shadow-lg min-h-screen">
            <div className="p-6 border-b">
              <h1 className="text-xl font-bold text-emerald-800">
                Pelis Agroforest
              </h1>
              <p className="text-sm text-emerald-600">System Administration</p>
            </div>
            <nav className="p-4 space-y-2">
              {adminPanels.map((panel) => (
                <button
                  key={panel.id}
                  onClick={() => setActivePanel(panel.id)}
                  className={`w-full flex items-center space-x-3 p-3 rounded-lg text-left transition-colors ${
                    activePanel === panel.id
                      ? 'bg-emerald-100 text-emerald-800 border-l-4 border-emerald-500'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {panel.icon}
                  <div>
                    <p className="font-medium">{panel.title}</p>
                    <p className="text-xs opacity-75">{panel.description}</p>
                  </div>
                </button>
              ))}
            </nav>
          </div>

          {/* Main Content */}
          <div className="flex-1 p-6">
            <div className="mb-6 flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">
                  {adminPanels.find(p => p.id === activePanel)?.title || 'System Overview'}
                </h2>
                <p className="text-gray-600">
                  Welcome back, {profile?.name}
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant="outline" className="text-emerald-600">
                  System Online
                </Badge>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={fetchSystemStats}
                >
                  Refresh Data
                </Button>
              </div>
            </div>

            {/* Render Active Panel */}
            {renderActivePanel()}
          </div>
        </div>
      </div>
    </AdminProtectedRoute>
  );
};

export default SystemAdminDashboard;
