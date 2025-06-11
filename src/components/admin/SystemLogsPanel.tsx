
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  FileText, 
  Search, 
  Download, 
  Eye,
  Filter,
  Calendar,
  User,
  Activity
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface SystemLog {
  id: string;
  actor_id: string | null;
  action: string;
  target_table: string | null;
  target_id: string | null;
  details: any;
  ip_address: string | null;
  created_at: string;
  actor_name?: string;
}

interface ActivityLog {
  id: string;
  user_id: string | null;
  related_user_id: string | null;
  type: string;
  description: string;
  status: string | null;
  metadata: any;
  created_at: string;
  user_name?: string;
}

const SystemLogsPanel = () => {
  const [systemLogs, setSystemLogs] = useState<SystemLog[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [activeTab, setActiveTab] = useState('system');
  const [dateFilter, setDateFilter] = useState('today');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
  }, []);

  useEffect(() => {
    filterLogs();
  }, [systemLogs, activityLogs, searchTerm, filterType, activeTab, dateFilter]);

  const fetchLogs = async () => {
    try {
      setIsLoading(true);
      
      const [systemLogsRes, activityLogsRes] = await Promise.all([
        supabase.from('system_logs')
          .select(`
            *,
            profiles:actor_id (
              name
            )
          `)
          .order('created_at', { ascending: false })
          .limit(1000),
        supabase.from('activity_log')
          .select(`
            *,
            profiles:user_id (
              name
            )
          `)
          .order('created_at', { ascending: false })
          .limit(1000)
      ]);

      if (systemLogsRes.error) throw systemLogsRes.error;
      if (activityLogsRes.error) throw activityLogsRes.error;

      const processedSystemLogs = (systemLogsRes.data || []).map(log => ({
        ...log,
        actor_name: log.profiles?.name || 'System'
      }));

      const processedActivityLogs = (activityLogsRes.data || []).map(log => ({
        ...log,
        user_name: log.profiles?.name || 'Unknown User'
      }));

      setSystemLogs(processedSystemLogs);
      setActivityLogs(processedActivityLogs);
    } catch (error) {
      console.error('Error fetching logs:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch system logs.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filterLogs = () => {
    let logs = activeTab === 'system' ? systemLogs : activityLogs;
    
    // Date filter
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

    switch (dateFilter) {
      case 'today':
        logs = logs.filter(log => new Date(log.created_at) >= today);
        break;
      case 'yesterday':
        logs = logs.filter(log => {
          const logDate = new Date(log.created_at);
          return logDate >= yesterday && logDate < today;
        });
        break;
      case 'week':
        logs = logs.filter(log => new Date(log.created_at) >= weekAgo);
        break;
    }

    // Search filter
    if (searchTerm) {
      logs = logs.filter(log => {
        const searchableText = activeTab === 'system' 
          ? `${log.action} ${log.target_table || ''} ${log.actor_name || ''}`
          : `${log.description} ${log.type} ${log.user_name || ''}`;
        return searchableText.toLowerCase().includes(searchTerm.toLowerCase());
      });
    }

    // Type filter
    if (filterType !== 'all') {
      if (activeTab === 'system') {
        logs = logs.filter(log => log.action === filterType);
      } else {
        logs = logs.filter(log => log.type === filterType);
      }
    }

    setFilteredLogs(logs);
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'created':
      case 'application':
        return 'bg-green-100 text-green-800';
      case 'updated':
      case 'report':
        return 'bg-blue-100 text-blue-800';
      case 'deleted':
        return 'bg-red-100 text-red-800';
      case 'marketplace':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const exportLogs = () => {
    const headers = activeTab === 'system' 
      ? ['Date', 'Actor', 'Action', 'Target Table', 'Target ID', 'IP Address']
      : ['Date', 'User', 'Type', 'Description', 'Status'];

    const data = filteredLogs.map(log => {
      if (activeTab === 'system') {
        return [
          new Date(log.created_at).toLocaleString(),
          log.actor_name || 'System',
          log.action,
          log.target_table || '',
          log.target_id || '',
          log.ip_address || ''
        ];
      } else {
        return [
          new Date(log.created_at).toLocaleString(),
          log.user_name || 'Unknown',
          log.type,
          log.description,
          log.status || ''
        ];
      }
    });

    const csvContent = [headers, ...data]
      .map(row => row.join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activeTab}_logs_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <FileText className="h-5 w-5" />
              <span>System Logs</span>
            </CardTitle>
            <div className="flex space-x-2">
              <Button
                variant={activeTab === 'system' ? 'default' : 'outline'}
                onClick={() => setActiveTab('system')}
              >
                <Activity className="h-4 w-4 mr-2" />
                System Logs ({systemLogs.length})
              </Button>
              <Button
                variant={activeTab === 'activity' ? 'default' : 'outline'}
                onClick={() => setActiveTab('activity')}
              >
                <User className="h-4 w-4 mr-2" />
                Activity Logs ({activityLogs.length})
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
                  placeholder="Search logs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="px-3 py-2 border rounded-md"
            >
              <option value="today">Today</option>
              <option value="yesterday">Yesterday</option>
              <option value="week">This Week</option>
              <option value="all">All Time</option>
            </select>
            {activeTab === 'system' ? (
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-3 py-2 border rounded-md"
              >
                <option value="all">All Actions</option>
                <option value="created">Created</option>
                <option value="updated">Updated</option>
                <option value="deleted">Deleted</option>
              </select>
            ) : (
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-3 py-2 border rounded-md"
              >
                <option value="all">All Types</option>
                <option value="application">Applications</option>
                <option value="report">Reports</option>
                <option value="marketplace">Marketplace</option>
              </select>
            )}
            <Button onClick={exportLogs} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Logs Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin w-6 h-6 border-4 border-emerald-500 border-t-transparent rounded-full"></div>
              <span className="ml-2">Loading logs...</span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left p-4 font-medium text-gray-700">Timestamp</th>
                    <th className="text-left p-4 font-medium text-gray-700">
                      {activeTab === 'system' ? 'Actor' : 'User'}
                    </th>
                    <th className="text-left p-4 font-medium text-gray-700">
                      {activeTab === 'system' ? 'Action' : 'Type'}
                    </th>
                    <th className="text-left p-4 font-medium text-gray-700">
                      {activeTab === 'system' ? 'Target' : 'Description'}
                    </th>
                    {activeTab === 'activity' && (
                      <th className="text-left p-4 font-medium text-gray-700">Status</th>
                    )}
                    <th className="text-left p-4 font-medium text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLogs.map((log) => (
                    <tr key={log.id} className="border-b hover:bg-gray-50">
                      <td className="p-4">
                        <div>
                          <p className="text-sm font-medium">
                            {new Date(log.created_at).toLocaleDateString()}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(log.created_at).toLocaleTimeString()}
                          </p>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="text-sm">
                          {activeTab === 'system' ? log.actor_name : log.user_name}
                        </span>
                      </td>
                      <td className="p-4">
                        <Badge className={getActionColor(activeTab === 'system' ? log.action : log.type)}>
                          {activeTab === 'system' ? log.action : log.type}
                        </Badge>
                      </td>
                      <td className="p-4">
                        {activeTab === 'system' ? (
                          <div>
                            <p className="text-sm font-medium">{log.target_table || 'N/A'}</p>
                            {log.target_id && (
                              <p className="text-xs text-gray-500 font-mono">
                                ID: {log.target_id.substring(0, 8)}...
                              </p>
                            )}
                          </div>
                        ) : (
                          <p className="text-sm">{log.description}</p>
                        )}
                      </td>
                      {activeTab === 'activity' && (
                        <td className="p-4">
                          {log.status && (
                            <Badge variant="outline">{log.status}</Badge>
                          )}
                        </td>
                      )}
                      <td className="p-4">
                        <Button size="sm" variant="outline">
                          <Eye className="h-3 w-3" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredLogs.length === 0 && (
                <div className="text-center p-8 text-gray-500">
                  No logs found matching your criteria.
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SystemLogsPanel;
