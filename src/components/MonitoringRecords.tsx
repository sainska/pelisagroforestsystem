
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { FileText, AlertTriangle, CheckCircle, Calendar, MapPin, Users } from "lucide-react";

interface MonitoringRecordsProps {
  userRole: string;
}

const MonitoringRecords = ({ userRole }: MonitoringRecordsProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const [monitoringData, setMonitoringData] = useState({
    plotId: "",
    visitDate: "",
    complianceLevel: "",
    treeCount: "",
    cropCondition: "",
    findings: "",
    recommendations: "",
    violationsFound: "",
    followUpRequired: ""
  });

  // Mock data for monitoring records
  const mockRecords = [
    {
      id: "MON-2024-001",
      plotId: "P-2024-001",
      farmer: "John Wanjiku",
      visitDate: "2024-01-20",
      officer: "Officer Kimani",
      complianceLevel: "excellent",
      treeCount: 45,
      violationsFound: false,
      status: "completed"
    },
    {
      id: "MON-2024-002",
      plotId: "P-2024-002",
      farmer: "Mary Chepkoech",
      visitDate: "2024-01-22",
      officer: "Officer Mutua",
      complianceLevel: "good",
      treeCount: 38,
      violationsFound: false,
      status: "completed"
    },
    {
      id: "MON-2024-003",
      plotId: "P-2024-003",
      farmer: "James Kiprop",
      visitDate: "2024-01-25",
      officer: "Officer Kimani",
      complianceLevel: "poor",
      treeCount: 12,
      violationsFound: true,
      status: "follow-up-required"
    }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API call
    setTimeout(() => {
      toast({
        title: "Monitoring Record Saved",
        description: "The monitoring visit has been recorded successfully.",
      });
      
      // Reset form
      setMonitoringData({
        plotId: "",
        visitDate: "",
        complianceLevel: "",
        treeCount: "",
        cropCondition: "",
        findings: "",
        recommendations: "",
        violationsFound: "",
        followUpRequired: ""
      });
      
      setIsSubmitting(false);
    }, 2000);
  };

  const getComplianceBadge = (level: string) => {
    switch (level) {
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-100 text-green-800 border-green-200">Completed</Badge>;
      case "follow-up-required":
        return <Badge className="bg-orange-100 text-orange-800 border-orange-200">Follow-up Required</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  if (userRole === "Community Member") {
    return (
      <div className="space-y-6">
        <Card className="border-emerald-200">
          <CardHeader>
            <CardTitle className="text-emerald-800 flex items-center">
              <FileText className="w-5 h-5 mr-2" />
              My Monitoring Records
            </CardTitle>
            <CardDescription>View monitoring visits and compliance status for your plots</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockRecords.filter(record => record.farmer === "John Wanjiku").map((record) => (
                <div key={record.id} className="border border-emerald-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-emerald-800">{record.id}</h4>
                    <div className="flex gap-2">
                      {getComplianceBadge(record.complianceLevel)}
                      {record.violationsFound && (
                        <Badge className="bg-red-100 text-red-800 border-red-200">
                          <AlertTriangle className="w-3 h-3 mr-1" />
                          Violation
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <Label className="text-emerald-700">Plot ID</Label>
                      <p className="text-emerald-800">{record.plotId}</p>
                    </div>
                    <div>
                      <Label className="text-emerald-700">Visit Date</Label>
                      <p className="text-emerald-800">{record.visitDate}</p>
                    </div>
                    <div>
                      <Label className="text-emerald-700">Officer</Label>
                      <p className="text-emerald-800">{record.officer}</p>
                    </div>
                    <div>
                      <Label className="text-emerald-700">Tree Count</Label>
                      <p className="text-emerald-800">{record.treeCount} trees</p>
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
      {/* Monitoring Form for Officers */}
      <Card className="border-emerald-200">
        <CardHeader>
          <CardTitle className="text-emerald-800 flex items-center">
            <FileText className="w-5 h-5 mr-2" />
            Record Monitoring Visit
          </CardTitle>
          <CardDescription>Document plot inspection and compliance assessment</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="plotId">Plot ID</Label>
                <Select value={monitoringData.plotId} onValueChange={(value) => setMonitoringData({...monitoringData, plotId: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select plot to monitor" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="P-2024-001">P-2024-001 (John Wanjiku)</SelectItem>
                    <SelectItem value="P-2024-002">P-2024-002 (Mary Chepkoech)</SelectItem>
                    <SelectItem value="P-2024-003">P-2024-003 (James Kiprop)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="visitDate">Visit Date</Label>
                <Input
                  id="visitDate"
                  type="date"
                  value={monitoringData.visitDate}
                  onChange={(e) => setMonitoringData({...monitoringData, visitDate: e.target.value})}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="complianceLevel">Compliance Level</Label>
                <Select value={monitoringData.complianceLevel} onValueChange={(value) => setMonitoringData({...monitoringData, complianceLevel: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Rate compliance" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="excellent">Excellent</SelectItem>
                    <SelectItem value="good">Good</SelectItem>
                    <SelectItem value="fair">Fair</SelectItem>
                    <SelectItem value="poor">Poor</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="treeCount">Tree Count</Label>
                <Input
                  id="treeCount"
                  type="number"
                  value={monitoringData.treeCount}
                  onChange={(e) => setMonitoringData({...monitoringData, treeCount: e.target.value})}
                  placeholder="Number of trees planted"
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="cropCondition">Crop Condition Assessment</Label>
              <Select value={monitoringData.cropCondition} onValueChange={(value) => setMonitoringData({...monitoringData, cropCondition: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Assess crop condition" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="excellent">Excellent</SelectItem>
                  <SelectItem value="good">Good</SelectItem>
                  <SelectItem value="fair">Fair</SelectItem>
                  <SelectItem value="poor">Poor</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="findings">Inspection Findings</Label>
              <Textarea
                id="findings"
                value={monitoringData.findings}
                onChange={(e) => setMonitoringData({...monitoringData, findings: e.target.value})}
                placeholder="Detail your observations about the plot condition, crop health, tree growth..."
                rows={3}
                required
              />
            </div>

            <div>
              <Label htmlFor="violationsFound">Violations Found</Label>
              <Select value={monitoringData.violationsFound} onValueChange={(value) => setMonitoringData({...monitoringData, violationsFound: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Any violations detected?" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No violations</SelectItem>
                  <SelectItem value="minor">Minor violations</SelectItem>
                  <SelectItem value="major">Major violations</SelectItem>
                  <SelectItem value="critical">Critical violations</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="recommendations">Recommendations</Label>
              <Textarea
                id="recommendations"
                value={monitoringData.recommendations}
                onChange={(e) => setMonitoringData({...monitoringData, recommendations: e.target.value})}
                placeholder="Provide recommendations for improvement or maintenance..."
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="followUpRequired">Follow-up Required</Label>
              <Select value={monitoringData.followUpRequired} onValueChange={(value) => setMonitoringData({...monitoringData, followUpRequired: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Is follow-up needed?" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="no">No follow-up needed</SelectItem>
                  <SelectItem value="1-week">Within 1 week</SelectItem>
                  <SelectItem value="2-weeks">Within 2 weeks</SelectItem>
                  <SelectItem value="1-month">Within 1 month</SelectItem>
                  <SelectItem value="urgent">Urgent follow-up</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button 
              type="submit" 
              className="w-full bg-emerald-600 hover:bg-emerald-700"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Saving Record..." : "Save Monitoring Record"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Monitoring Records Overview */}
      <Card className="border-emerald-200">
        <CardHeader>
          <CardTitle className="text-emerald-800 flex items-center">
            <Calendar className="w-5 h-5 mr-2" />
            Recent Monitoring Records
          </CardTitle>
          <CardDescription>Overview of recent plot monitoring activities</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card className="border-green-200 bg-green-50">
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-green-800">67</div>
                <p className="text-sm text-green-600">Total Visits</p>
              </CardContent>
            </Card>
            <Card className="border-blue-200 bg-blue-50">
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-blue-800">89%</div>
                <p className="text-sm text-blue-600">Compliance Rate</p>
              </CardContent>
            </Card>
            <Card className="border-red-200 bg-red-50">
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-red-800">3</div>
                <p className="text-sm text-red-600">Violations Found</p>
              </CardContent>
            </Card>
            <Card className="border-orange-200 bg-orange-50">
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-orange-800">8</div>
                <p className="text-sm text-orange-600">Follow-ups Due</p>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            {mockRecords.map((record) => (
              <div key={record.id} className="border border-emerald-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-emerald-800">{record.id}</h4>
                  <div className="flex gap-2">
                    {getComplianceBadge(record.complianceLevel)}
                    {getStatusBadge(record.status)}
                    {record.violationsFound && (
                      <Badge className="bg-red-100 text-red-800 border-red-200">
                        <AlertTriangle className="w-3 h-3 mr-1" />
                        Violation
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                  <div>
                    <Label className="text-emerald-700">Plot</Label>
                    <p className="text-emerald-800">{record.plotId}</p>
                  </div>
                  <div>
                    <Label className="text-emerald-700">Farmer</Label>
                    <p className="text-emerald-800">{record.farmer}</p>
                  </div>
                  <div>
                    <Label className="text-emerald-700">Visit Date</Label>
                    <p className="text-emerald-800">{record.visitDate}</p>
                  </div>
                  <div>
                    <Label className="text-emerald-700">Officer</Label>
                    <p className="text-emerald-800">{record.officer}</p>
                  </div>
                  <div>
                    <Label className="text-emerald-700">Trees</Label>
                    <p className="text-emerald-800">{record.treeCount}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MonitoringRecords;
