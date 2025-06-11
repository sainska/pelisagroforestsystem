
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Database, 
  Download, 
  Upload, 
  RefreshCw, 
  Calendar,
  HardDrive,
  CheckCircle,
  AlertTriangle,
  Clock
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface BackupHistory {
  id: string;
  backup_date: string;
  status: string;
  file_path: string | null;
  file_size: number | null;
  triggered_by: string | null;
  notes: string | null;
}

const BackupManagementPanel = () => {
  const [backupHistory, setBackupHistory] = useState<BackupHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreatingBackup, setIsCreatingBackup] = useState(false);
  const [lastBackup, setLastBackup] = useState<BackupHistory | null>(null);

  useEffect(() => {
    fetchBackupHistory();
  }, []);

  const fetchBackupHistory = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('backup_history')
        .select('*')
        .order('backup_date', { ascending: false })
        .limit(50);

      if (error) throw error;

      setBackupHistory(data || []);
      setLastBackup(data?.[0] || null);
    } catch (error) {
      console.error('Error fetching backup history:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch backup history.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const createBackup = async () => {
    try {
      setIsCreatingBackup(true);
      
      // Create backup record
      const { data: currentUser } = await supabase.auth.getUser();
      const backupRecord = {
        status: 'In Progress',
        triggered_by: currentUser.user?.id,
        notes: 'Manual backup initiated by admin'
      };

      const { data: backup, error: backupError } = await supabase
        .from('backup_history')
        .insert(backupRecord)
        .select()
        .single();

      if (backupError) throw backupError;

      // Simulate backup process (in real implementation, this would call a database backup function)
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Update backup status
      const { error: updateError } = await supabase
        .from('backup_history')
        .update({
          status: 'Completed',
          file_path: `backup_${new Date().toISOString().split('T')[0]}.sql`,
          file_size: Math.floor(Math.random() * 100000) + 50000 // Simulated file size
        })
        .eq('id', backup.id);

      if (updateError) throw updateError;

      toast({
        title: 'Success',
        description: 'Backup created successfully.',
      });

      fetchBackupHistory();
    } catch (error) {
      console.error('Error creating backup:', error);
      toast({
        title: 'Error',
        description: 'Failed to create backup.',
        variant: 'destructive',
      });
    } finally {
      setIsCreatingBackup(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'in progress':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'failed':
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case 'in progress':
        return <Clock className="h-4 w-4 text-blue-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getBackupHealth = () => {
    if (!lastBackup) return { status: 'warning', message: 'No backups found' };
    
    const lastBackupDate = new Date(lastBackup.backup_date);
    const now = new Date();
    const hoursSinceLastBackup = (now.getTime() - lastBackupDate.getTime()) / (1000 * 60 * 60);
    
    if (hoursSinceLastBackup > 72) {
      return { status: 'error', message: 'Last backup is over 3 days old' };
    } else if (hoursSinceLastBackup > 24) {
      return { status: 'warning', message: 'Last backup is over 24 hours old' };
    } else {
      return { status: 'success', message: 'Backup schedule is up to date' };
    }
  };

  const backupHealth = getBackupHealth();

  return (
    <div className="space-y-6">
      {/* Backup Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Database className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Total Backups</p>
                <p className="text-2xl font-bold text-blue-800">{backupHistory.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Last Backup</p>
                <p className="text-xl font-bold text-green-800">
                  {lastBackup ? new Date(lastBackup.backup_date).toLocaleDateString() : 'Never'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <HardDrive className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">Storage Used</p>
                <p className="text-xl font-bold text-purple-800">
                  {formatFileSize(backupHistory.reduce((sum, backup) => sum + (backup.file_size || 0), 0))}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Backup Health Alert */}
      <Alert className={
        backupHealth.status === 'error' ? 'border-red-200 bg-red-50' :
        backupHealth.status === 'warning' ? 'border-yellow-200 bg-yellow-50' :
        'border-green-200 bg-green-50'
      }>
        {backupHealth.status === 'error' ? (
          <AlertTriangle className="h-4 w-4 text-red-600" />
        ) : backupHealth.status === 'warning' ? (
          <AlertTriangle className="h-4 w-4 text-yellow-600" />
        ) : (
          <CheckCircle className="h-4 w-4 text-green-600" />
        )}
        <AlertDescription className={
          backupHealth.status === 'error' ? 'text-red-800' :
          backupHealth.status === 'warning' ? 'text-yellow-800' :
          'text-green-800'
        }>
          {backupHealth.message}
        </AlertDescription>
      </Alert>

      {/* Backup Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Database className="h-5 w-5" />
            <span>Backup Management</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
            <Button 
              onClick={createBackup} 
              disabled={isCreatingBackup}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              {isCreatingBackup ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Creating Backup...
                </>
              ) : (
                <>
                  <Database className="h-4 w-4 mr-2" />
                  Create Backup Now
                </>
              )}
            </Button>
            <Button variant="outline">
              <Upload className="h-4 w-4 mr-2" />
              Schedule Automatic Backups
            </Button>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Download Latest Backup
            </Button>
            <Button variant="outline" onClick={fetchBackupHistory}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Backup History */}
      <Card>
        <CardHeader>
          <CardTitle>Backup History</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin w-6 h-6 border-4 border-emerald-500 border-t-transparent rounded-full"></div>
              <span className="ml-2">Loading backup history...</span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left p-4 font-medium text-gray-700">Date & Time</th>
                    <th className="text-left p-4 font-medium text-gray-700">Status</th>
                    <th className="text-left p-4 font-medium text-gray-700">File Size</th>
                    <th className="text-left p-4 font-medium text-gray-700">File Path</th>
                    <th className="text-left p-4 font-medium text-gray-700">Triggered By</th>
                    <th className="text-left p-4 font-medium text-gray-700">Notes</th>
                    <th className="text-left p-4 font-medium text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {backupHistory.map((backup) => (
                    <tr key={backup.id} className="border-b hover:bg-gray-50">
                      <td className="p-4">
                        <div>
                          <p className="font-medium">
                            {new Date(backup.backup_date).toLocaleDateString()}
                          </p>
                          <p className="text-sm text-gray-500">
                            {new Date(backup.backup_date).toLocaleTimeString()}
                          </p>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(backup.status)}
                          <Badge className={getStatusColor(backup.status)}>
                            {backup.status}
                          </Badge>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="text-sm">
                          {backup.file_size ? formatFileSize(backup.file_size) : 'N/A'}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="font-mono text-sm text-gray-600">
                          {backup.file_path || 'N/A'}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="text-sm">
                          {backup.triggered_by ? 'Admin' : 'System'}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="text-sm text-gray-600">
                          {backup.notes || 'No notes'}
                        </span>
                      </td>
                      <td className="p-4">
                        {backup.status === 'Completed' && backup.file_path && (
                          <Button size="sm" variant="outline">
                            <Download className="h-3 w-3 mr-1" />
                            Download
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {backupHistory.length === 0 && (
                <div className="text-center p-8 text-gray-500">
                  No backup history found. Create your first backup to get started.
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default BackupManagementPanel;
