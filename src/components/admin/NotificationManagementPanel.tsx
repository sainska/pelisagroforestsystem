
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  MessageSquare, 
  Send, 
  Users, 
  UserCheck,
  Bell,
  Plus,
  Eye,
  Trash2
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string;
  is_read: boolean;
  read_at: string | null;
  created_at: string;
  user_name?: string;
}

const NotificationManagementPanel = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newNotification, setNewNotification] = useState({
    type: 'general',
    title: '',
    message: '',
    recipients: 'all'
  });

  useEffect(() => {
    fetchNotificationsAndUsers();
  }, []);

  const fetchNotificationsAndUsers = async () => {
    try {
      setIsLoading(true);
      
      const [notificationsRes, usersRes] = await Promise.all([
        supabase.from('notifications')
          .select(`
            *,
            profiles:user_id (
              name
            )
          `)
          .order('created_at', { ascending: false })
          .limit(100),
        supabase.from('profiles')
          .select('id, name, email, account_approved')
          .eq('account_approved', true)
      ]);

      if (notificationsRes.error) throw notificationsRes.error;
      if (usersRes.error) throw usersRes.error;

      const processedNotifications = (notificationsRes.data || []).map(notification => ({
        ...notification,
        user_name: notification.profiles?.name || 'Unknown User'
      }));

      setNotifications(processedNotifications);
      setUsers(usersRes.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch notifications.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const sendNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newNotification.title || !newNotification.message) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields.',
        variant: 'destructive',
      });
      return;
    }

    try {
      let recipients = [];
      
      if (newNotification.recipients === 'all') {
        recipients = users.map(user => user.id);
      } else if (newNotification.recipients === 'approved') {
        recipients = users.filter(user => user.account_approved).map(user => user.id);
      } else {
        // Individual recipient would be handled differently
        recipients = [newNotification.recipients];
      }

      // Create notifications for all recipients
      const notificationPromises = recipients.map(userId =>
        supabase.from('notifications').insert({
          user_id: userId,
          type: newNotification.type,
          title: newNotification.title,
          message: newNotification.message
        })
      );

      await Promise.all(notificationPromises);

      toast({
        title: 'Success',
        description: `Notification sent to ${recipients.length} users.`,
      });

      setNewNotification({
        type: 'general',
        title: '',
        message: '',
        recipients: 'all'
      });
      setShowCreateForm(false);
      fetchNotificationsAndUsers();
    } catch (error) {
      console.error('Error sending notification:', error);
      toast({
        title: 'Error',
        description: 'Failed to send notification.',
        variant: 'destructive',
      });
    }
  };

  const deleteNotification = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Notification deleted successfully.',
      });

      fetchNotificationsAndUsers();
    } catch (error) {
      console.error('Error deleting notification:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete notification.',
        variant: 'destructive',
      });
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'info': return 'bg-blue-100 text-blue-800';
      case 'success': return 'bg-green-100 text-green-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const notificationStats = {
    total: notifications.length,
    read: notifications.filter(n => n.is_read).length,
    unread: notifications.filter(n => !n.is_read).length,
    byType: notifications.reduce((acc, n) => {
      acc[n.type] = (acc[n.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  };

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <MessageSquare className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Total Notifications</p>
                <p className="text-2xl font-bold text-blue-800">{notificationStats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Eye className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Read</p>
                <p className="text-2xl font-bold text-green-800">{notificationStats.read}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Bell className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="text-sm text-gray-600">Unread</p>
                <p className="text-2xl font-bold text-yellow-800">{notificationStats.unread}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">Active Users</p>
                <p className="text-2xl font-bold text-purple-800">{users.length}</p>
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
              <MessageSquare className="h-5 w-5" />
              <span>Notification Management</span>
            </CardTitle>
            <Button onClick={() => setShowCreateForm(!showCreateForm)}>
              <Plus className="h-4 w-4 mr-2" />
              Send Notification
            </Button>
          </div>
        </CardHeader>
        
        {showCreateForm && (
          <CardContent className="border-t">
            <form onSubmit={sendNotification} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Notification Type</label>
                  <select
                    value={newNotification.type}
                    onChange={(e) => setNewNotification({...newNotification, type: e.target.value})}
                    className="w-full px-3 py-2 border rounded-md"
                  >
                    <option value="general">General</option>
                    <option value="urgent">Urgent</option>
                    <option value="info">Information</option>
                    <option value="success">Success</option>
                    <option value="warning">Warning</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Recipients</label>
                  <select
                    value={newNotification.recipients}
                    onChange={(e) => setNewNotification({...newNotification, recipients: e.target.value})}
                    className="w-full px-3 py-2 border rounded-md"
                  >
                    <option value="all">All Users</option>
                    <option value="approved">Approved Users Only</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Title *</label>
                <Input
                  value={newNotification.title}
                  onChange={(e) => setNewNotification({...newNotification, title: e.target.value})}
                  placeholder="Notification title..."
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Message *</label>
                <Textarea
                  value={newNotification.message}
                  onChange={(e) => setNewNotification({...newNotification, message: e.target.value})}
                  placeholder="Notification message..."
                  rows={4}
                  required
                />
              </div>
              <div className="flex space-x-2">
                <Button type="submit">
                  <Send className="h-4 w-4 mr-2" />
                  Send Notification
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowCreateForm(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        )}
      </Card>

      {/* Notifications List */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Notifications</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin w-6 h-6 border-4 border-emerald-500 border-t-transparent rounded-full"></div>
              <span className="ml-2">Loading notifications...</span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left p-4 font-medium text-gray-700">Type</th>
                    <th className="text-left p-4 font-medium text-gray-700">Title</th>
                    <th className="text-left p-4 font-medium text-gray-700">Message</th>
                    <th className="text-left p-4 font-medium text-gray-700">Recipient</th>
                    <th className="text-left p-4 font-medium text-gray-700">Status</th>
                    <th className="text-left p-4 font-medium text-gray-700">Date</th>
                    <th className="text-left p-4 font-medium text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {notifications.map((notification) => (
                    <tr key={notification.id} className="border-b hover:bg-gray-50">
                      <td className="p-4">
                        <Badge className={getTypeColor(notification.type)}>
                          {notification.type}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <p className="font-medium">{notification.title}</p>
                      </td>
                      <td className="p-4">
                        <p className="text-sm text-gray-600 max-w-md truncate">
                          {notification.message}
                        </p>
                      </td>
                      <td className="p-4">
                        <p className="text-sm">{notification.user_name}</p>
                      </td>
                      <td className="p-4">
                        <Badge variant={notification.is_read ? 'default' : 'secondary'}>
                          {notification.is_read ? 'Read' : 'Unread'}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <p className="text-sm">{new Date(notification.created_at).toLocaleDateString()}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(notification.created_at).toLocaleTimeString()}
                        </p>
                      </td>
                      <td className="p-4">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => deleteNotification(notification.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {notifications.length === 0 && (
                <div className="text-center p-8 text-gray-500">
                  No notifications found.
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default NotificationManagementPanel;
