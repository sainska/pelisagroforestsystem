
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  MapPin, 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Eye,
  Users,
  Calendar,
  Download
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface Plot {
  id: string;
  name: string;
  size: number;
  status: string;
  location_description: string;
  assigned_to: string | null;
  assignment_date: string | null;
  expiry_date: string | null;
  created_at: string;
  gps_coordinates: any;
  notes: string | null;
}

interface PlotApplication {
  id: string;
  applicant_id: string;
  status: string;
  preferred_size: number;
  location_preference: string;
  reason: string;
  created_at: string;
  reviewed_at: string | null;
  reviewed_by: string | null;
  applicant_name?: string;
  applicant_email?: string;
}

const PlotManagementPanel = () => {
  const [plots, setPlots] = useState<Plot[]>([]);
  const [applications, setApplications] = useState<PlotApplication[]>([]);
  const [filteredPlots, setFilteredPlots] = useState<Plot[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [activeTab, setActiveTab] = useState('plots');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchPlotsAndApplications();
  }, []);

  useEffect(() => {
    filterPlots();
  }, [plots, searchTerm, filterStatus]);

  const fetchPlotsAndApplications = async () => {
    try {
      setIsLoading(true);
      
      const [plotsRes, applicationsRes] = await Promise.all([
        supabase.from('plots').select('*').order('created_at', { ascending: false }),
        supabase.from('plot_applications')
          .select(`
            *,
            profiles:applicant_id (
              name,
              email
            )
          `)
          .order('created_at', { ascending: false })
      ]);

      if (plotsRes.error) throw plotsRes.error;
      if (applicationsRes.error) throw applicationsRes.error;

      setPlots(plotsRes.data || []);
      
      const processedApplications = (applicationsRes.data || []).map(app => ({
        ...app,
        applicant_name: app.profiles?.name || 'Unknown',
        applicant_email: app.profiles?.email || 'Unknown'
      }));
      
      setApplications(processedApplications);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch plots and applications.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filterPlots = () => {
    let filtered = plots;

    if (searchTerm) {
      filtered = filtered.filter(plot => 
        plot.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        plot.location_description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterStatus !== 'all') {
      filtered = filtered.filter(plot => plot.status === filterStatus);
    }

    setFilteredPlots(filtered);
  };

  const approveApplication = async (applicationId: string, plotId?: string) => {
    try {
      const { error } = await supabase
        .from('plot_applications')
        .update({ 
          status: 'Approved',
          reviewed_at: new Date().toISOString(),
          reviewed_by: (await supabase.auth.getUser()).data.user?.id,
          plot_id: plotId
        })
        .eq('id', applicationId);

      if (error) throw error;

      // If a plot is assigned, update the plot status
      if (plotId) {
        const application = applications.find(app => app.id === applicationId);
        if (application) {
          await supabase
            .from('plots')
            .update({ 
              status: 'Assigned',
              assigned_to: application.applicant_id,
              assignment_date: new Date().toISOString()
            })
            .eq('id', plotId);
        }
      }

      toast({
        title: 'Success',
        description: 'Application approved successfully.',
      });

      fetchPlotsAndApplications();
    } catch (error) {
      console.error('Error approving application:', error);
      toast({
        title: 'Error',
        description: 'Failed to approve application.',
        variant: 'destructive',
      });
    }
  };

  const rejectApplication = async (applicationId: string) => {
    try {
      const { error } = await supabase
        .from('plot_applications')
        .update({ 
          status: 'Rejected',
          reviewed_at: new Date().toISOString(),
          reviewed_by: (await supabase.auth.getUser()).data.user?.id
        })
        .eq('id', applicationId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Application rejected.',
      });

      fetchPlotsAndApplications();
    } catch (error) {
      console.error('Error rejecting application:', error);
      toast({
        title: 'Error',
        description: 'Failed to reject application.',
        variant: 'destructive',
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Available': return 'bg-green-100 text-green-800';
      case 'Assigned': return 'bg-blue-100 text-blue-800';
      case 'Maintenance': return 'bg-yellow-100 text-yellow-800';
      case 'Approved': return 'bg-green-100 text-green-800';
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      case 'Rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <MapPin className="h-5 w-5" />
              <span>Plot Management</span>
            </CardTitle>
            <div className="flex space-x-2">
              <Button
                variant={activeTab === 'plots' ? 'default' : 'outline'}
                onClick={() => setActiveTab('plots')}
              >
                Plots ({plots.length})
              </Button>
              <Button
                variant={activeTab === 'applications' ? 'default' : 'outline'}
                onClick={() => setActiveTab('applications')}
              >
                Applications ({applications.filter(app => app.status === 'Pending').length})
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
                  placeholder={activeTab === 'plots' ? "Search plots..." : "Search applications..."}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            {activeTab === 'plots' && (
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border rounded-md"
              >
                <option value="all">All Status</option>
                <option value="Available">Available</option>
                <option value="Assigned">Assigned</option>
                <option value="Maintenance">Maintenance</option>
              </select>
            )}
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            {activeTab === 'plots' && (
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Plot
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Content based on active tab */}
      {activeTab === 'plots' ? (
        <Card>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex items-center justify-center p-8">
                <div className="animate-spin w-6 h-6 border-4 border-emerald-500 border-t-transparent rounded-full"></div>
                <span className="ml-2">Loading plots...</span>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="text-left p-4 font-medium text-gray-700">Plot Details</th>
                      <th className="text-left p-4 font-medium text-gray-700">Size</th>
                      <th className="text-left p-4 font-medium text-gray-700">Status</th>
                      <th className="text-left p-4 font-medium text-gray-700">Assignment</th>
                      <th className="text-left p-4 font-medium text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPlots.map((plot) => (
                      <tr key={plot.id} className="border-b hover:bg-gray-50">
                        <td className="p-4">
                          <div>
                            <p className="font-medium">{plot.name}</p>
                            <p className="text-sm text-gray-500">{plot.location_description}</p>
                            <p className="text-xs text-gray-400">
                              Created: {new Date(plot.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className="font-medium">{plot.size} acres</span>
                        </td>
                        <td className="p-4">
                          <Badge className={getStatusColor(plot.status)}>
                            {plot.status}
                          </Badge>
                        </td>
                        <td className="p-4">
                          {plot.assigned_to ? (
                            <div>
                              <p className="text-sm">Assigned</p>
                              <p className="text-xs text-gray-500">
                                {plot.assignment_date && new Date(plot.assignment_date).toLocaleDateString()}
                              </p>
                            </div>
                          ) : (
                            <span className="text-gray-400">Unassigned</span>
                          )}
                        </td>
                        <td className="p-4">
                          <div className="flex space-x-2">
                            <Button size="sm" variant="outline">
                              <Eye className="h-3 w-3" />
                            </Button>
                            <Button size="sm" variant="outline">
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button size="sm" variant="outline">
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
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
                    <th className="text-left p-4 font-medium text-gray-700">Applicant</th>
                    <th className="text-left p-4 font-medium text-gray-700">Request</th>
                    <th className="text-left p-4 font-medium text-gray-700">Status</th>
                    <th className="text-left p-4 font-medium text-gray-700">Applied</th>
                    <th className="text-left p-4 font-medium text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {applications.map((application) => (
                    <tr key={application.id} className="border-b hover:bg-gray-50">
                      <td className="p-4">
                        <div>
                          <p className="font-medium">{application.applicant_name}</p>
                          <p className="text-sm text-gray-500">{application.applicant_email}</p>
                        </div>
                      </td>
                      <td className="p-4">
                        <div>
                          <p className="text-sm">{application.preferred_size} acres</p>
                          <p className="text-sm text-gray-500">{application.location_preference}</p>
                        </div>
                      </td>
                      <td className="p-4">
                        <Badge className={getStatusColor(application.status)}>
                          {application.status}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <p className="text-sm">{new Date(application.created_at).toLocaleDateString()}</p>
                      </td>
                      <td className="p-4">
                        {application.status === 'Pending' ? (
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              onClick={() => approveApplication(application.id)}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => rejectApplication(application.id)}
                            >
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
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PlotManagementPanel;
