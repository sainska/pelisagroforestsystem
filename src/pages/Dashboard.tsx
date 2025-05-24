
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
  User,
  Settings,
  LogOut
} from "lucide-react";

import { useAuth } from "@/contexts/AuthContext";
import DashboardStats from "@/components/DashboardStats";
import PlotApplicationForm from "@/components/PlotApplicationForm";
import CropReportForm from "@/components/CropReportForm";
import MonitoringRecords from "@/components/MonitoringRecords";
import UserProfile from "@/components/UserProfile";

const Dashboard = () => {
  const { profile, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState("dashboard");
  const navigate = useNavigate();

  useEffect(() => {
    if (!profile) {
      navigate('/');
    }
  }, [profile, navigate]);

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-amber-50 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full"></div>
        <p className="ml-2 text-emerald-700">Loading...</p>
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
              <p className="text-sm text-emerald-600">Welcome, {profile.name}</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Badge variant="outline" className="border-emerald-200 text-emerald-700">
              {profile.role}
            </Badge>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => signOut()}
              className="border-emerald-200 text-emerald-700 hover:bg-emerald-50"
            >
              <LogOut className="w-4 h-4 mr-1" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full md:grid-cols-5 grid-cols-3 bg-white border border-emerald-200">
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
            <DashboardStats userRole={profile.role} />
          </TabsContent>

          <TabsContent value="plots" className="mt-6">
            <PlotApplicationForm userRole={profile.role} />
          </TabsContent>

          <TabsContent value="crops" className="mt-6">
            <CropReportForm userRole={profile.role} />
          </TabsContent>

          <TabsContent value="monitoring" className="mt-6">
            <MonitoringRecords userRole={profile.role} />
          </TabsContent>

          <TabsContent value="profile" className="mt-6">
            <UserProfile />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;
