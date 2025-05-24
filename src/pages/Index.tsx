
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sprout, MapPin, FileText } from "lucide-react";
import AuthModal from "@/components/AuthModal";
import { useAuth } from "@/contexts/AuthContext";

const Index = () => {
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const { profile } = useAuth();
  const navigate = useNavigate();
  
  if (profile) {
    navigate('/dashboard');
    return null;
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
        onLogin={() => navigate('/dashboard')}
      />
    </div>
  );
};

export default Index;
