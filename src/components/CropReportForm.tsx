
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Sprout, Calendar, Camera, TrendingUp } from "lucide-react";

interface CropReportFormProps {
  userRole: string;
}

const CropReportForm = ({ userRole }: CropReportFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const [reportData, setReportData] = useState({
    plotId: "",
    cropType: "",
    plantingDate: "",
    areaPlanted: "",
    growthStage: "",
    condition: "",
    notes: "",
    challenges: ""
  });

  // Mock data for existing reports
  const mockReports = [
    {
      id: "RPT-2024-001",
      plotId: "P-2024-001",
      cropType: "Maize & Indigenous Trees",
      plantingDate: "2024-01-10",
      submissionDate: "2024-01-25",
      condition: "excellent",
      growthStage: "vegetative"
    },
    {
      id: "RPT-2024-002",
      plotId: "P-2024-001",
      cropType: "Beans & Coffee Seedlings",
      plantingDate: "2024-01-15",
      submissionDate: "2024-01-30",
      condition: "good",
      growthStage: "flowering"
    },
    {
      id: "RPT-2024-003",
      plotId: "P-2024-001",
      cropType: "Napier Grass & Eucalyptus",
      plantingDate: "2024-02-01",
      submissionDate: "2024-02-15",
      condition: "fair",
      growthStage: "establishment"
    }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API call
    setTimeout(() => {
      toast({
        title: "Crop Report Submitted",
        description: "Your crop report has been successfully submitted.",
      });
      
      // Reset form
      setReportData({
        plotId: "",
        cropType: "",
        plantingDate: "",
        areaPlanted: "",
        growthStage: "",
        condition: "",
        notes: "",
        challenges: ""
      });
      
      setIsSubmitting(false);
    }, 2000);
  };

  const getConditionBadge = (condition: string) => {
    switch (condition) {
      case "excellent":
        return <Badge className="bg-green-100 text-green-800 border-green-200">Excellent</Badge>;
      case "good":
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200">Good</Badge>;
      case "fair":
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Fair</Badge>;
      case "poor":
        return <Badge className="bg-red-100 text-red-800 border-red-200">Poor</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  if (userRole !== "Community Member") {
    return (
      <div className="space-y-6">
        <Card className="border-emerald-200">
          <CardHeader>
            <CardTitle className="text-emerald-800 flex items-center">
              <TrendingUp className="w-5 h-5 mr-2" />
              Crop Reports Overview
            </CardTitle>
            <CardDescription>Monitor community crop reporting and performance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <Card className="border-green-200 bg-green-50">
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-green-800">89</div>
                  <p className="text-sm text-green-600">Total Reports</p>
                </CardContent>
              </Card>
              <Card className="border-blue-200 bg-blue-50">
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-blue-800">76%</div>
                  <p className="text-sm text-blue-600">Submission Rate</p>
                </CardContent>
              </Card>
              <Card className="border-amber-200 bg-amber-50">
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-amber-800">12</div>
                  <p className="text-sm text-amber-600">Overdue Reports</p>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-emerald-800">Recent Reports</h3>
              {mockReports.map((report) => (
                <div key={report.id} className="border border-emerald-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-emerald-800">{report.id}</h4>
                    {getConditionBadge(report.condition)}
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <Label className="text-emerald-700">Plot ID</Label>
                      <p className="text-emerald-800">{report.plotId}</p>
                    </div>
                    <div>
                      <Label className="text-emerald-700">Crop Type</Label>
                      <p className="text-emerald-800">{report.cropType}</p>
                    </div>
                    <div>
                      <Label className="text-emerald-700">Planting Date</Label>
                      <p className="text-emerald-800">{report.plantingDate}</p>
                    </div>
                    <div>
                      <Label className="text-emerald-700">Growth Stage</Label>
                      <p className="text-emerald-800 capitalize">{report.growthStage}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Crop Report Form */}
      <Card className="border-emerald-200">
        <CardHeader>
          <CardTitle className="text-emerald-800 flex items-center">
            <Sprout className="w-5 h-5 mr-2" />
            Submit Crop Report
          </CardTitle>
          <CardDescription>Report on your crop activities and plot conditions</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="plotId">Plot ID</Label>
                <Select value={reportData.plotId} onValueChange={(value) => setReportData({...reportData, plotId: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your plot" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="P-2024-001">P-2024-001 (North Block A)</SelectItem>
                    <SelectItem value="P-2024-002">P-2024-002 (South Block C)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="cropType">Crop/Tree Type</Label>
                <Input
                  id="cropType"
                  value={reportData.cropType}
                  onChange={(e) => setReportData({...reportData, cropType: e.target.value})}
                  placeholder="e.g., Maize, Beans, Indigenous Trees"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="plantingDate">Planting Date</Label>
                <Input
                  id="plantingDate"
                  type="date"
                  value={reportData.plantingDate}
                  onChange={(e) => setReportData({...reportData, plantingDate: e.target.value})}
                  required
                />
              </div>

              <div>
                <Label htmlFor="areaPlanted">Area Planted (hectares)</Label>
                <Input
                  id="areaPlanted"
                  type="number"
                  step="0.01"
                  value={reportData.areaPlanted}
                  onChange={(e) => setReportData({...reportData, areaPlanted: e.target.value})}
                  placeholder="0.25"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="growthStage">Growth Stage</Label>
                <Select value={reportData.growthStage} onValueChange={(value) => setReportData({...reportData, growthStage: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select growth stage" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="planting">Planting/Establishment</SelectItem>
                    <SelectItem value="germination">Germination</SelectItem>
                    <SelectItem value="vegetative">Vegetative Growth</SelectItem>
                    <SelectItem value="flowering">Flowering</SelectItem>
                    <SelectItem value="fruiting">Fruiting/Maturity</SelectItem>
                    <SelectItem value="harvesting">Harvesting</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="condition">Overall Condition</Label>
                <Select value={reportData.condition} onValueChange={(value) => setReportData({...reportData, condition: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Rate crop condition" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="excellent">Excellent</SelectItem>
                    <SelectItem value="good">Good</SelectItem>
                    <SelectItem value="fair">Fair</SelectItem>
                    <SelectItem value="poor">Poor</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="notes">Progress Notes</Label>
              <Textarea
                id="notes"
                value={reportData.notes}
                onChange={(e) => setReportData({...reportData, notes: e.target.value})}
                placeholder="Describe the current state of your crops, any observations, maintenance activities..."
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="challenges">Challenges Faced</Label>
              <Textarea
                id="challenges"
                value={reportData.challenges}
                onChange={(e) => setReportData({...reportData, challenges: e.target.value})}
                placeholder="Describe any pests, diseases, weather issues, or other challenges..."
                rows={3}
              />
            </div>

            <div className="border-2 border-dashed border-emerald-300 rounded-lg p-6 text-center">
              <Camera className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
              <p className="text-emerald-700 mb-2">Upload Photos (Optional)</p>
              <p className="text-sm text-emerald-600 mb-4">Add photos of your crops to help with monitoring</p>
              <Button type="button" variant="outline" className="border-emerald-200 text-emerald-700">
                Choose Files
              </Button>
            </div>

            <Button 
              type="submit" 
              className="w-full bg-emerald-600 hover:bg-emerald-700"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Submitting Report..." : "Submit Crop Report"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* My Reports History */}
      <Card className="border-emerald-200">
        <CardHeader>
          <CardTitle className="text-emerald-800 flex items-center">
            <Calendar className="w-5 h-5 mr-2" />
            My Report History
          </CardTitle>
          <CardDescription>View your previous crop reports and submissions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockReports.map((report) => (
              <div key={report.id} className="border border-emerald-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-emerald-800">{report.id}</h4>
                  {getConditionBadge(report.condition)}
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <Label className="text-emerald-700">Plot</Label>
                    <p className="text-emerald-800">{report.plotId}</p>
                  </div>
                  <div>
                    <Label className="text-emerald-700">Crop Type</Label>
                    <p className="text-emerald-800">{report.cropType}</p>
                  </div>
                  <div>
                    <Label className="text-emerald-700">Planted</Label>
                    <p className="text-emerald-800">{report.plantingDate}</p>
                  </div>
                  <div>
                    <Label className="text-emerald-700">Submitted</Label>
                    <p className="text-emerald-800">{report.submissionDate}</p>
                  </div>
                </div>
                <div className="mt-3">
                  <Label className="text-emerald-700">Growth Stage</Label>
                  <p className="text-emerald-800 capitalize">{report.growthStage}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CropReportForm;
