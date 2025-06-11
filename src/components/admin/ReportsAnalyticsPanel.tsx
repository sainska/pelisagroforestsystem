
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  TrendingUp, 
  Download, 
  BarChart3, 
  PieChart, 
  Calendar,
  Users,
  MapPin,
  CreditCard
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart as RechartsPieChart, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const ReportsAnalyticsPanel = () => {
  const [analyticsData, setAnalyticsData] = useState({
    userGrowth: [],
    paymentTrends: [],
    plotUtilization: [],
    applicationStatus: [],
    cropTypes: [],
    regionDistribution: []
  });
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAnalyticsData();
  }, [selectedPeriod]);

  const fetchAnalyticsData = async () => {
    try {
      setIsLoading(true);
      
      // Fetch user growth data
      const userGrowthData = await fetchUserGrowthData();
      const paymentTrendsData = await fetchPaymentTrendsData();
      const plotUtilizationData = await fetchPlotUtilizationData();
      const applicationStatusData = await fetchApplicationStatusData();
      const cropTypesData = await fetchCropTypesData();
      const regionDistributionData = await fetchRegionDistributionData();

      setAnalyticsData({
        userGrowth: userGrowthData,
        paymentTrends: paymentTrendsData,
        plotUtilization: plotUtilizationData,
        applicationStatus: applicationStatusData,
        cropTypes: cropTypesData,
        regionDistribution: regionDistributionData
      });
    } catch (error) {
      console.error('Error fetching analytics data:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch analytics data.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUserGrowthData = async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('created_at')
      .order('created_at', { ascending: true });

    if (error) throw error;

    // Process data by month
    const growthData = {};
    data?.forEach(user => {
      const month = new Date(user.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
      growthData[month] = (growthData[month] || 0) + 1;
    });

    return Object.entries(growthData).map(([month, count]) => ({
      month,
      users: count,
      cumulative: Object.entries(growthData)
        .slice(0, Object.keys(growthData).indexOf(month) + 1)
        .reduce((sum, [, c]) => sum + c, 0)
    }));
  };

  const fetchPaymentTrendsData = async () => {
    const { data, error } = await supabase
      .from('payments')
      .select('created_at, amount, status')
      .order('created_at', { ascending: true });

    if (error) throw error;

    const trendsData = {};
    data?.forEach(payment => {
      const month = new Date(payment.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
      if (!trendsData[month]) {
        trendsData[month] = { month, total: 0, verified: 0, pending: 0 };
      }
      trendsData[month].total += Number(payment.amount);
      if (payment.status === 'Verified') {
        trendsData[month].verified += Number(payment.amount);
      } else {
        trendsData[month].pending += Number(payment.amount);
      }
    });

    return Object.values(trendsData);
  };

  const fetchPlotUtilizationData = async () => {
    const { data, error } = await supabase
      .from('plots')
      .select('status');

    if (error) throw error;

    const statusCounts = {};
    data?.forEach(plot => {
      statusCounts[plot.status] = (statusCounts[plot.status] || 0) + 1;
    });

    return Object.entries(statusCounts).map(([status, count]) => ({
      status,
      count,
      percentage: Math.round((count / data.length) * 100)
    }));
  };

  const fetchApplicationStatusData = async () => {
    const { data, error } = await supabase
      .from('plot_applications')
      .select('status');

    if (error) throw error;

    const statusCounts = {};
    data?.forEach(app => {
      statusCounts[app.status] = (statusCounts[app.status] || 0) + 1;
    });

    return Object.entries(statusCounts).map(([status, count]) => ({
      status,
      count
    }));
  };

  const fetchCropTypesData = async () => {
    const { data, error } = await supabase
      .from('crop_reports')
      .select(`
        crop_types (
          name
        )
      `);

    if (error) throw error;

    const cropCounts = {};
    data?.forEach(report => {
      const cropName = report.crop_types?.name || 'Unknown';
      cropCounts[cropName] = (cropCounts[cropName] || 0) + 1;
    });

    return Object.entries(cropCounts).map(([name, count]) => ({
      name,
      count
    }));
  };

  const fetchRegionDistributionData = async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('location');

    if (error) throw error;

    const locationCounts = {};
    data?.forEach(profile => {
      const location = profile.location || 'Unknown';
      locationCounts[location] = (locationCounts[location] || 0) + 1;
    });

    return Object.entries(locationCounts).map(([location, count]) => ({
      location,
      count
    }));
  };

  const COLORS = ['#10B981', '#3B82F6', '#EF4444', '#F59E0B', '#8B5CF6', '#EC4899'];

  const exportReport = () => {
    // Generate comprehensive report
    const reportData = {
      generatedAt: new Date().toISOString(),
      period: selectedPeriod,
      summary: {
        totalUsers: analyticsData.userGrowth.reduce((sum, item) => sum + item.users, 0),
        totalRevenue: analyticsData.paymentTrends.reduce((sum, item) => sum + item.total, 0),
        plotUtilization: analyticsData.plotUtilization,
        applicationStatus: analyticsData.applicationStatus
      },
      detailedData: analyticsData
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics_report_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full"></div>
        <span className="ml-2">Loading analytics...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5" />
              <span>Reports & Analytics</span>
            </CardTitle>
            <div className="flex space-x-2">
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="px-3 py-2 border rounded-md"
              >
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="quarter">This Quarter</option>
                <option value="year">This Year</option>
              </select>
              <Button onClick={exportReport} variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export Report
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* User Growth Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5" />
            <span>User Growth Trends</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={analyticsData.userGrowth}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Area type="monotone" dataKey="users" stackId="1" stroke="#10B981" fill="#10B981" fillOpacity={0.6} name="New Users" />
              <Area type="monotone" dataKey="cumulative" stackId="2" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.6} name="Total Users" />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Payment Trends and Plot Utilization */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CreditCard className="h-5 w-5" />
              <span>Payment Trends</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={analyticsData.paymentTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="verified" fill="#10B981" name="Verified" />
                <Bar dataKey="pending" fill="#F59E0B" name="Pending" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <MapPin className="h-5 w-5" />
              <span>Plot Utilization</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <RechartsPieChart>
                <Pie
                  data={analyticsData.plotUtilization}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ status, percentage }) => `${status}: ${percentage}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {analyticsData.plotUtilization.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </RechartsPieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Application Status and Crop Types */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Application Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analyticsData.applicationStatus.map((item, index) => (
                <div key={item.status} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-4 h-4 rounded-full" 
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    ></div>
                    <span>{item.status}</span>
                  </div>
                  <span className="font-bold">{item.count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Popular Crop Types</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analyticsData.cropTypes.slice(0, 5).map((item, index) => (
                <div key={item.name} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-4 h-4 rounded-full" 
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    ></div>
                    <span>{item.name}</span>
                  </div>
                  <span className="font-bold">{item.count} reports</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Region Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>User Distribution by Region</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analyticsData.regionDistribution} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="location" type="category" width={100} />
              <Tooltip />
              <Bar dataKey="count" fill="#10B981" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReportsAnalyticsPanel;
