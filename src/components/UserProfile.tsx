
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";

const UserProfile = () => {
  const { profile, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: profile?.name || "",
    phone: profile?.phone || "",
    location: profile?.location || "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await updateProfile({
        name: formData.name,
        phone: formData.phone,
        location: formData.location,
      });
      
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating profile:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: profile?.name || "",
      phone: profile?.phone || "",
      location: profile?.location || "",
    });
    setIsEditing(false);
  };

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <h2 className="text-2xl font-bold text-emerald-800">Profile Settings</h2>

      <Card className="border-emerald-200">
        <CardHeader>
          <CardTitle className="text-emerald-800">Your Account Information</CardTitle>
          <CardDescription>Manage your personal details and preferences</CardDescription>
        </CardHeader>
        <CardContent>
          {isEditing ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium">Name</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  required
                  className="w-full"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">Email</Label>
                <Input
                  id="email"
                  value={profile?.email || ""}
                  disabled
                  className="bg-gray-100 w-full"
                />
                <p className="text-xs text-emerald-600">
                  Email cannot be changed
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-sm font-medium">Phone Number</Label>
                <Input
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  placeholder="Enter phone number (optional)"
                  className="w-full"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="location" className="text-sm font-medium">Location</Label>
                <Input
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  placeholder="Enter your location (optional)"
                  className="w-full"
                />
              </div>
              
              <div className="space-y-2">
                <Label className="text-sm font-medium">National ID</Label>
                <Input
                  value={profile?.national_id || ""}
                  disabled
                  className="bg-gray-100 w-full"
                />
                <p className="text-xs text-emerald-600">
                  National ID cannot be changed
                </p>
              </div>
              
              <div className="space-y-2">
                <Label className="text-sm font-medium">Role</Label>
                <Input
                  value={profile?.role || ""}
                  disabled
                  className="bg-gray-100 w-full"
                />
                <p className="text-xs text-emerald-600">
                  Role cannot be changed
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <Button
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-700 flex-1"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Saving..." : "Save Changes"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancel}
                  disabled={isSubmitting}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-emerald-700">Name</Label>
                  <p className="text-emerald-800 break-words">{profile?.name || "Not provided"}</p>
                </div>
                
                <div>
                  <Label className="text-sm font-medium text-emerald-700">Email</Label>
                  <p className="text-emerald-800 break-words">{profile?.email || "Not provided"}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-emerald-700">Phone Number</Label>
                  <p className="text-emerald-800 break-words">{profile?.phone || "Not provided"}</p>
                </div>
                
                <div>
                  <Label className="text-sm font-medium text-emerald-700">Location</Label>
                  <p className="text-emerald-800 break-words">{profile?.location || "Not provided"}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-emerald-700">National ID</Label>
                  <p className="text-emerald-800 break-words">{profile?.national_id || "Not provided"}</p>
                </div>
                
                <div>
                  <Label className="text-sm font-medium text-emerald-700">Role</Label>
                  <p className="text-emerald-800 break-words">{profile?.role || "Not assigned"}</p>
                </div>
              </div>
              
              <Button
                onClick={() => setIsEditing(true)}
                className="bg-emerald-600 hover:bg-emerald-700 w-full sm:w-auto mt-4"
              >
                Edit Profile
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default UserProfile;
