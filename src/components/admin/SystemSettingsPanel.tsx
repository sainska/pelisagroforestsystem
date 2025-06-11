
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { 
  Settings, 
  Save, 
  RefreshCw, 
  Globe, 
  Mail, 
  Phone,
  MapPin,
  CreditCard,
  Shield,
  Database,
  Bell
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface SystemSetting {
  key: string;
  value: string;
  type: 'text' | 'email' | 'number' | 'boolean' | 'textarea';
  category: string;
  label: string;
  description: string;
}

const SystemSettingsPanel = () => {
  const [settings, setSettings] = useState<SystemSetting[]>([
    // Organization Settings
    {
      key: 'org_name',
      value: 'Nandi North Escarpment Community Forest Association',
      type: 'text',
      category: 'organization',
      label: 'Organization Name',
      description: 'The official name of your organization'
    },
    {
      key: 'org_email',
      value: 'admin@nnecfa.org',
      type: 'email',
      category: 'organization',
      label: 'Organization Email',
      description: 'Primary contact email for the organization'
    },
    {
      key: 'org_phone',
      value: '+254700000000',
      type: 'text',
      category: 'organization',
      label: 'Organization Phone',
      description: 'Primary contact phone number'
    },
    {
      key: 'org_address',
      value: 'Nandi County, Kenya',
      type: 'textarea',
      category: 'organization',
      label: 'Organization Address',
      description: 'Physical address of the organization'
    },
    
    // Payment Settings
    {
      key: 'membership_fee',
      value: '300',
      type: 'number',
      category: 'payment',
      label: 'Membership Fee (KSh)',
      description: 'Annual membership fee amount in Kenyan Shillings'
    },
    {
      key: 'payment_timeout',
      value: '1440',
      type: 'number',
      category: 'payment',
      label: 'Payment Timeout (minutes)',
      description: 'Time limit for payment completion'
    },
    
    // System Settings
    {
      key: 'max_plot_size',
      value: '5',
      type: 'number',
      category: 'system',
      label: 'Maximum Plot Size (acres)',
      description: 'Maximum allowed plot size for applications'
    },
    {
      key: 'auto_approve_payments',
      value: 'false',
      type: 'boolean',
      category: 'system',
      label: 'Auto-approve Payments',
      description: 'Automatically approve verified M-Pesa payments'
    },
    {
      key: 'require_face_verification',
      value: 'true',
      type: 'boolean',
      category: 'system',
      label: 'Require Face Verification',
      description: 'Require users to upload face photos for verification'
    },
    {
      key: 'session_timeout',
      value: '30',
      type: 'number',
      category: 'system',
      label: 'Session Timeout (minutes)',
      description: 'User session timeout duration'
    },
    
    // Notification Settings
    {
      key: 'email_notifications',
      value: 'true',
      type: 'boolean',
      category: 'notifications',
      label: 'Email Notifications',
      description: 'Enable email notifications for system events'
    },
    {
      key: 'sms_notifications',
      value: 'false',
      type: 'boolean',
      category: 'notifications',
      label: 'SMS Notifications',
      description: 'Enable SMS notifications for critical events'
    },
    {
      key: 'notification_sender_email',
      value: 'notifications@nnecfa.org',
      type: 'email',
      category: 'notifications',
      label: 'Notification Sender Email',
      description: 'Email address used for sending notifications'
    }
  ]);

  const [isLoading, setIsLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const updateSetting = (key: string, value: string) => {
    setSettings(prev => prev.map(setting => 
      setting.key === key ? { ...setting, value } : setting
    ));
    setHasChanges(true);
  };

  const saveSettings = async () => {
    try {
      setIsLoading(true);
      
      // Simulate API call to save settings
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: 'Success',
        description: 'System settings saved successfully.',
      });
      
      setHasChanges(false);
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: 'Error',
        description: 'Failed to save system settings.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetSettings = () => {
    // Reset to original values (in real implementation, this would fetch from database)
    setHasChanges(false);
    toast({
      title: 'Settings Reset',
      description: 'All settings have been reset to their original values.',
    });
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'organization': return <Globe className="h-5 w-5" />;
      case 'payment': return <CreditCard className="h-5 w-5" />;
      case 'system': return <Settings className="h-5 w-5" />;
      case 'notifications': return <Bell className="h-5 w-5" />;
      default: return <Settings className="h-5 w-5" />;
    }
  };

  const getCategoryTitle = (category: string) => {
    switch (category) {
      case 'organization': return 'Organization Settings';
      case 'payment': return 'Payment Settings';
      case 'system': return 'System Settings';
      case 'notifications': return 'Notification Settings';
      default: return 'Settings';
    }
  };

  const groupedSettings = settings.reduce((acc, setting) => {
    if (!acc[setting.category]) {
      acc[setting.category] = [];
    }
    acc[setting.category].push(setting);
    return acc;
  }, {} as Record<string, SystemSetting[]>);

  const renderSettingInput = (setting: SystemSetting) => {
    switch (setting.type) {
      case 'boolean':
        return (
          <Switch
            checked={setting.value === 'true'}
            onCheckedChange={(checked) => updateSetting(setting.key, checked.toString())}
          />
        );
      case 'textarea':
        return (
          <Textarea
            value={setting.value}
            onChange={(e) => updateSetting(setting.key, e.target.value)}
            rows={3}
          />
        );
      case 'number':
        return (
          <Input
            type="number"
            value={setting.value}
            onChange={(e) => updateSetting(setting.key, e.target.value)}
          />
        );
      default:
        return (
          <Input
            type={setting.type}
            value={setting.value}
            onChange={(e) => updateSetting(setting.key, e.target.value)}
          />
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header and Actions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Settings className="h-5 w-5" />
              <span>System Settings</span>
            </CardTitle>
            <div className="flex space-x-2">
              {hasChanges && (
                <Badge variant="outline" className="text-yellow-600">
                  Unsaved Changes
                </Badge>
              )}
              <Button 
                variant="outline" 
                onClick={resetSettings}
                disabled={isLoading}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Reset
              </Button>
              <Button 
                onClick={saveSettings} 
                disabled={isLoading || !hasChanges}
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Settings Categories */}
      {Object.entries(groupedSettings).map(([category, categorySettings]) => (
        <Card key={category}>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              {getCategoryIcon(category)}
              <span>{getCategoryTitle(category)}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {categorySettings.map((setting) => (
              <div key={setting.key} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="font-medium text-gray-700">
                      {setting.label}
                    </label>
                    <p className="text-sm text-gray-500 mt-1">
                      {setting.description}
                    </p>
                  </div>
                  <div className="w-64">
                    {renderSettingInput(setting)}
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      ))}

      {/* System Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Database className="h-5 w-5" />
            <span>System Information</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-700">System Version</h4>
                <p className="text-sm text-gray-600">Pelis Agroforest v1.0.0</p>
              </div>
              <div>
                <h4 className="font-medium text-gray-700">Database Version</h4>
                <p className="text-sm text-gray-600">PostgreSQL 14.x</p>
              </div>
              <div>
                <h4 className="font-medium text-gray-700">Last System Update</h4>
                <p className="text-sm text-gray-600">{new Date().toLocaleDateString()}</p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-700">Server Status</h4>
                <Badge className="bg-green-100 text-green-800">Online</Badge>
              </div>
              <div>
                <h4 className="font-medium text-gray-700">Database Status</h4>
                <Badge className="bg-green-100 text-green-800">Connected</Badge>
              </div>
              <div>
                <h4 className="font-medium text-gray-700">Storage Used</h4>
                <p className="text-sm text-gray-600">2.3 GB / 100 GB</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SystemSettingsPanel;
