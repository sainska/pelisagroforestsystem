
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Users, 
  MapPin, 
  Sprout, 
  FileText, 
  TrendingUp, 
  AlertTriangle,
  Calendar,
  CheckCircle
} from "lucide-react";

interface DashboardStatsProps {
  userRole: string;
}

const DashboardStats = ({ userRole }: DashboardStatsProps) => {
  const mockStats = {
    totalPlots: 245,
    activePlots: 189,
    pendingApplications: 12,
    totalMembers: 156,
    cropReports: 89,
    monitoringRecords: 67,
    violations: 3,
    compliance: 94
  };

  const recentActivities = [
    { id: 1, action: "New plot application", user: "Mary Chepkoech", time: "2 hours ago", type: "application" },
    { id: 2, action: "Crop report submitted", user: "James Kiprop", time: "4 hours ago", type: "report" },
    { id: 3, action: "Monitoring visit completed", user: "Officer Kimani", time: "1 day ago", type: "monitoring" },
    { id: 4, action: "Plot allocation approved", user: "Grace Wanjiku", time: "2 days ago", type: "approval" },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-emerald-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-emerald-700">Total Plots</CardTitle>
            <MapPin className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-800">{mockStats.totalPlots}</div>
            <p className="text-xs text-emerald-600">
              +12% from last month
            </p>
          </CardContent>
        </Card>

        <Card className="border-emerald-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-emerald-700">Active Plots</CardTitle>
            <Sprout className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-800">{mockStats.activePlots}</div>
            <p className="text-xs text-emerald-600">
              77% of total plots
            </p>
          </CardContent>
        </Card>

        <Card className="border-emerald-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-emerald-700">Community Members</CardTitle>
            <Users className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-800">{mockStats.totalMembers}</div>
            <p className="text-xs text-emerald-600">
              +8 new this month
            </p>
          </CardContent>
        </Card>

        <Card className="border-emerald-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-emerald-700">Compliance Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-800">{mockStats.compliance}%</div>
            <p className="text-xs text-emerald-600">
              +2% improvement
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Role-specific Stats */}
      {userRole === "Community Member" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-amber-200 bg-amber-50">
            <CardHeader>
              <CardTitle className="text-amber-800">My Applications</CardTitle>
              <CardDescription>Plot allocation requests</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-amber-800">2</div>
              <div className="flex gap-2 mt-2">
                <Badge variant="outline" className="text-green-700 border-green-200">1 Approved</Badge>
                <Badge variant="outline" className="text-yellow-700 border-yellow-200">1 Pending</Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle className="text-green-800">My Plots</CardTitle>
              <CardDescription>Allocated forest plots</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-800">1</div>
              <p className="text-sm text-green-600 mt-2">Plot ID: P-2024-001</p>
              <p className="text-sm text-green-600">Size: 0.5 hectares</p>
            </CardContent>
          </Card>

          <Card className="border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle className="text-blue-800">Crop Reports</CardTitle>
              <CardDescription>Submitted this quarter</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-800">4</div>
              <p className="text-sm text-blue-600 mt-2">Next due: Jan 15, 2025</p>
            </CardContent>
          </Card>
        </div>
      )}

      {(userRole === "Forest Officer" || userRole === "NNECFA Official") && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-orange-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-orange-700">Pending Applications</CardTitle>
              <FileText className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-800">{mockStats.pendingApplications}</div>
              <p className="text-xs text-orange-600">
                Requires review
              </p>
            </CardContent>
          </Card>

          <Card className="border-blue-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-700">Crop Reports</CardTitle>
              <Sprout className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-800">{mockStats.cropReports}</div>
              <p className="text-xs text-blue-600">
                This quarter
              </p>
            </CardContent>
          </Card>

          <Card className="border-purple-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-purple-700">Monitoring Records</CardTitle>
              <Calendar className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-800">{mockStats.monitoringRecords}</div>
              <p className="text-xs text-purple-600">
                Site visits completed
              </p>
            </CardContent>
          </Card>

          <Card className="border-red-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-red-700">Violations</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-800">{mockStats.violations}</div>
              <p className="text-xs text-red-600">
                Requires attention
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Recent Activities */}
      <Card className="border-emerald-200">
        <CardHeader>
          <CardTitle className="text-emerald-800">Recent Activities</CardTitle>
          <CardDescription>Latest system activities and updates</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="flex items-center justify-between border-b border-emerald-100 pb-3">
                <div className="flex items-center space-x-3">
                  <div className={`w-2 h-2 rounded-full ${
                    activity.type === 'application' ? 'bg-orange-400' :
                    activity.type === 'report' ? 'bg-blue-400' :
                    activity.type === 'monitoring' ? 'bg-purple-400' :
                    'bg-green-400'
                  }`} />
                  <div>
                    <p className="text-sm font-medium text-emerald-800">{activity.action}</p>
                    <p className="text-xs text-emerald-600">by {activity.user}</p>
                  </div>
                </div>
                <p className="text-xs text-emerald-500">{activity.time}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card className="border-emerald-200">
        <CardHeader>
          <CardTitle className="text-emerald-800">Quick Actions</CardTitle>
          <CardDescription>Common tasks and shortcuts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {userRole === "Community Member" && (
              <>
                <Button variant="outline" className="border-emerald-200 text-emerald-700 hover:bg-emerald-50">
                  <MapPin className="w-4 h-4 mr-2" />
                  Apply for Plot
                </Button>
                <Button variant="outline" className="border-emerald-200 text-emerald-700 hover:bg-emerald-50">
                  <Sprout className="w-4 h-4 mr-2" />
                  Submit Crop Report
                </Button>
              </>
            )}
            
            {(userRole === "Forest Officer" || userRole === "NNECFA Official") && (
              <>
                <Button variant="outline" className="border-emerald-200 text-emerald-700 hover:bg-emerald-50">
                  <FileText className="w-4 h-4 mr-2" />
                  Review Applications
                </Button>
                <Button variant="outline" className="border-emerald-200 text-emerald-700 hover:bg-emerald-50">
                  <Calendar className="w-4 h-4 mr-2" />
                  Schedule Monitoring
                </Button>
              </>
            )}
            
            <Button variant="outline" className="border-emerald-200 text-emerald-700 hover:bg-emerald-50">
              <TrendingUp className="w-4 h-4 mr-2" />
              View Reports
            </Button>
            <Button variant="outline" className="border-emerald-200 text-emerald-700 hover:bg-emerald-50">
              <Users className="w-4 h-4 mr-2" />
              Community Directory
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardStats;
