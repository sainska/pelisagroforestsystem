
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { MapPin, FileText, Clock, CheckCircle, XCircle } from "lucide-react";

interface PlotApplicationFormProps {
  userRole: string;
}

const PlotApplicationForm = ({ userRole }: PlotApplicationFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const [applicationData, setApplicationData] = useState({
    preferredSize: "",
    reason: "",
    preferredLocation: "",
    previousExperience: "",
    proposedCrops: ""
  });

  // Mock data for existing applications
  const mockApplications = [
    {
      id: "APP-2024-001",
      size: "0.5 hectares",
      location: "North Block A",
      status: "approved",
      submissionDate: "2024-01-15",
      reviewDate: "2024-01-18",
      reviewer: "Officer Kimani"
    },
    {
      id: "APP-2024-002",
      size: "0.3 hectares",
      location: "South Block C",
      status: "pending",
      submissionDate: "2024-01-20",
      reviewDate: null,
      reviewer: null
    },
    {
      id: "APP-2024-003",
      size: "0.8 hectares",
      location: "East Block B",
      status: "rejected",
      submissionDate: "2024-01-10",
      reviewDate: "2024-01-12",
      reviewer: "Officer Mutua",
      reason: "Requested size exceeds allocation limit"
    }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API call
    setTimeout(() => {
      toast({
        title: "Application Submitted",
        description: "Your plot application has been submitted for review.",
      });
      
      // Reset form
      setApplicationData({
        preferredSize: "",
        reason: "",
        preferredLocation: "",
        previousExperience: "",
        proposedCrops: ""
      });
      
      setIsSubmitting(false);
    }, 2000);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-green-100 text-green-800 border-green-200">Approved</Badge>;
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Pending Review</Badge>;
      case "rejected":
        return <Badge className="bg-red-100 text-red-800 border-red-200">Rejected</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case "pending":
        return <Clock className="w-5 h-5 text-yellow-600" />;
      case "rejected":
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return <FileText className="w-5 h-5 text-gray-600" />;
    }
  };

  if (userRole !== "Community Member") {
    return (
      <div className="space-y-6">
        <Card className="border-emerald-200">
          <CardHeader>
            <CardTitle className="text-emerald-800 flex items-center">
              <FileText className="w-5 h-5 mr-2" />
              Plot Applications Management
            </CardTitle>
            <CardDescription>Review and manage community plot applications</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockApplications.filter(app => app.status === "pending").map((application) => (
                <div key={application.id} className="border border-emerald-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-emerald-800">{application.id}</h3>
                    {getStatusBadge(application.status)}
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <Label className="text-emerald-700">Requested Size</Label>
                      <p className="text-emerald-800">{application.size}</p>
                    </div>
                    <div>
                      <Label className="text-emerald-700">Preferred Location</Label>
                      <p className="text-emerald-800">{application.location}</p>
                    </div>
                    <div>
                      <Label className="text-emerald-700">Submission Date</Label>
                      <p className="text-emerald-800">{application.submissionDate}</p>
                    </div>
                  </div>
                  {userRole === "NNECFA Official" && (
                    <div className="flex gap-2 mt-4">
                      <Button size="sm" className="bg-green-600 hover:bg-green-700">
                        Approve
                      </Button>
                      <Button size="sm" variant="outline" className="border-red-200 text-red-700 hover:bg-red-50">
                        Reject
                      </Button>
                    </div>
                  )}
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
      {/* Application Form */}
      <Card className="border-emerald-200">
        <CardHeader>
          <CardTitle className="text-emerald-800 flex items-center">
            <MapPin className="w-5 h-5 mr-2" />
            Apply for Forest Plot
          </CardTitle>
          <CardDescription>Submit an application for forest plot allocation under the PELIS program</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="preferredSize">Preferred Plot Size</Label>
                <Select value={applicationData.preferredSize} onValueChange={(value) => setApplicationData({...applicationData, preferredSize: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select plot size" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0.25">0.25 hectares</SelectItem>
                    <SelectItem value="0.5">0.5 hectares</SelectItem>
                    <SelectItem value="0.75">0.75 hectares</SelectItem>
                    <SelectItem value="1.0">1.0 hectare</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="preferredLocation">Preferred Location</Label>
                <Select value={applicationData.preferredLocation} onValueChange={(value) => setApplicationData({...applicationData, preferredLocation: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select preferred area" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="north-a">North Block A</SelectItem>
                    <SelectItem value="north-b">North Block B</SelectItem>
                    <SelectItem value="south-a">South Block A</SelectItem>
                    <SelectItem value="south-c">South Block C</SelectItem>
                    <SelectItem value="east-b">East Block B</SelectItem>
                    <SelectItem value="west-a">West Block A</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="reason">Reason for Application</Label>
              <Textarea
                id="reason"
                value={applicationData.reason}
                onChange={(e) => setApplicationData({...applicationData, reason: e.target.value})}
                placeholder="Explain why you are applying for this plot and how you plan to use it..."
                required
              />
            </div>

            <div>
              <Label htmlFor="proposedCrops">Proposed Crops/Trees</Label>
              <Textarea
                id="proposedCrops"
                value={applicationData.proposedCrops}
                onChange={(e) => setApplicationData({...applicationData, proposedCrops: e.target.value})}
                placeholder="List the crops and trees you plan to plant (e.g., maize, beans, indigenous trees)..."
                required
              />
            </div>

            <div>
              <Label htmlFor="previousExperience">Previous Farming Experience</Label>
              <Textarea
                id="previousExperience"
                value={applicationData.previousExperience}
                onChange={(e) => setApplicationData({...applicationData, previousExperience: e.target.value})}
                placeholder="Describe your previous experience with farming or agroforestry..."
              />
            </div>

            <Button 
              type="submit" 
              className="w-full bg-emerald-600 hover:bg-emerald-700"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Submitting Application..." : "Submit Application"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* My Applications */}
      <Card className="border-emerald-200">
        <CardHeader>
          <CardTitle className="text-emerald-800">My Applications</CardTitle>
          <CardDescription>Track the status of your plot applications</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockApplications.map((application) => (
              <div key={application.id} className="border border-emerald-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(application.status)}
                    <h3 className="font-semibold text-emerald-800">{application.id}</h3>
                  </div>
                  {getStatusBadge(application.status)}
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <Label className="text-emerald-700">Size</Label>
                    <p className="text-emerald-800">{application.size}</p>
                  </div>
                  <div>
                    <Label className="text-emerald-700">Location</Label>
                    <p className="text-emerald-800">{application.location}</p>
                  </div>
                  <div>
                    <Label className="text-emerald-700">Submitted</Label>
                    <p className="text-emerald-800">{application.submissionDate}</p>
                  </div>
                  <div>
                    <Label className="text-emerald-700">Reviewed</Label>
                    <p className="text-emerald-800">{application.reviewDate || "Pending"}</p>
                  </div>
                </div>

                {application.status === "rejected" && application.reason && (
                  <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-md">
                    <Label className="text-red-700 font-medium">Rejection Reason:</Label>
                    <p className="text-red-800 text-sm mt-1">{application.reason}</p>
                  </div>
                )}

                {application.status === "approved" && (
                  <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-md">
                    <p className="text-green-800 text-sm">
                      <strong>Congratulations!</strong> Your application has been approved. 
                      You will receive plot coordinates and further instructions via SMS/email.
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PlotApplicationForm;
