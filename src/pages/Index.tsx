
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Users, 
  MapPin, 
  Sprout, 
  FileText, 
  TrendingUp, 
  AlertTriangle,
  Calendar,
  User,
  Settings
} from "lucide-react";
import AuthModal from "@/components/AuthModal";
import DashboardStats from "@/components/DashboardStats";
import PlotApplicationForm from "@/components/PlotApplicationForm";
import CropReportForm from "@/components/CropReportForm";
import MonitoringRecords from "@/components/MonitoringRecords";

const Index = () => {
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState("dashboard");

  const handleLogin = (userData: any) => {
    setUser(userData);
    setIsAuthOpen(false);
  };

  const handleLogout = () => {
    setUser(null);
    setActiveTab("dashboard");
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-amber-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-emerald-100">
          <div className="container mx-auto px-4 py-4 flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-emerald-600 rounded-lg flex items-center justify-center">
                <Sprout className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-emerald-800">Pelis Agroforest System</h1>
                <p className="text-sm text-emerald-600">NNECFA Digital Platform</p>
              </div>
            </div>
            <Button 
              onClick={() => setIsAuthOpen(true)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              Login / Register
            </Button>
          </div>
        </header>

        {/* Hero Section */}
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl font-bold text-emerald-800 mb-6">
              Digital Forest Management for Sustainable Communities
            </h2>
            <p className="text-lg text-emerald-700 mb-8 leading-relaxed">
              The Pelis Agroforest System empowers the Nandi North Escarpment Community Forest Association 
              with modern tools for plot allocation, crop monitoring, and transparent forest governance.
            </p>
            
            <div className="grid md:grid-cols-3 gap-6 mt-12">
              <Card className="border-emerald-200 hover:shadow-lg transition-shadow">
                <CardHeader>
                  <MapPin className="w-12 h-12 text-emerald-600 mb-2" />
                  <CardTitle className="text-emerald-800">Plot Management</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-emerald-700">
                    Apply for forest plots, track allocation status, and manage your assigned land digitally.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-emerald-200 hover:shadow-lg transition-shadow">
                <CardHeader>
                  <Sprout className="w-12 h-12 text-emerald-600 mb-2" />
                  <CardTitle className="text-emerald-800">Crop Monitoring</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-emerald-700">
                    Report crop activities, track growth progress, and ensure sustainable farming practices.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-emerald-200 hover:shadow-lg transition-shadow">
                <CardHeader>
                  <FileText className="w-12 h-12 text-emerald-600 mb-2" />
                  <CardTitle className="text-emerald-800">Transparent Reporting</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-emerald-700">
                    Generate detailed reports, maintain audit trails, and ensure accountability in forest management.
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="mt-12">
              <Button 
                size="lg"
                onClick={() => setIsAuthOpen(true)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3 text-lg"
              >
                Get Started Today
              </Button>
            </div>
          </div>
        </div>

        <AuthModal 
          isOpen={isAuthOpen} 
          onClose={() => setIsAuthOpen(false)}
          onLogin={handleLogin}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-amber-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-emerald-100">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-emerald-600 rounded-lg flex items-center justify-center">
              <Sprout className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-emerald-800">Pelis Agroforest System</h1>
              <p className="text-sm text-emerald-600">Welcome, {user.name}</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Badge variant="outline" className="border-emerald-200 text-emerald-700">
              {user.role}
            </Badge>
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleLogout}
              className="border-emerald-200 text-emerald-700 hover:bg-emerald-50"
            >
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5 bg-white border border-emerald-200">
            <TabsTrigger 
              value="dashboard" 
              className="data-[state=active]:bg-emerald-100 data-[state=active]:text-emerald-800"
            >
              <TrendingUp className="w-4 h-4 mr-2" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger 
              value="plots"
              className="data-[state=active]:bg-emerald-100 data-[state=active]:text-emerald-800"
            >
              <MapPin className="w-4 h-4 mr-2" />
              Plots
            </TabsTrigger>
            <TabsTrigger 
              value="crops"
              className="data-[state=active]:bg-emerald-100 data-[state=active]:text-emerald-800"
            >
              <Sprout className="w-4 h-4 mr-2" />
              Crops
            </TabsTrigger>
            <TabsTrigger 
              value="monitoring"
              className="data-[state=active]:bg-emerald-100 data-[state=active]:text-emerald-800"
            >
              <FileText className="w-4 h-4 mr-2" />
              Monitoring
            </TabsTrigger>
            <TabsTrigger 
              value="profile"
              className="data-[state=active]:bg-emerald-100 data-[state=active]:text-emerald-800"
            >
              <User className="w-4 h-4 mr-2" />
              Profile
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="mt-6">
            <DashboardStats userRole={user.role} />
          </TabsContent>

          <TabsContent value="plots" className="mt-6">
            <PlotApplicationForm userRole={user.role} />
          </TabsContent>

          <TabsContent value="crops" className="mt-6">
            <CropReportForm userRole={user.role} />
          </TabsContent>

          <TabsContent value="monitoring" className="mt-6">
            <MonitoringRecords userRole={user.role} />
          </TabsContent>

          <TabsContent value="profile" className="mt-6">
            <Card className="border-emerald-200">
              <CardHeader>
                <CardTitle className="text-emerald-800">Profile Settings</CardTitle>
                <CardDescription>Manage your account information and preferences</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-emerald-700">Name</label>
                    <p className="text-emerald-800">{user.name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-emerald-700">Email</label>
                    <p className="text-emerald-800">{user.email}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-emerald-700">Role</label>
                    <p className="text-emerald-800">{user.role}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-emerald-700">ID Number</label>
                    <p className="text-emerald-800">{user.idNumber}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
