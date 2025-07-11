"use client";

import type React from "react";
import { useState, useEffect, useRef } from "react";
import { User, Save } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AnimatedCard } from "@/components/ui/animated-card";
import { AnimatedButton } from "@/components/ui/animated-button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import FadeIn from "@/components/animations/fade-in";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/contexts/auth-context";
import { toast } from "sonner";
import type { UserProfile } from "@/contexts/auth-context";
import { Camera, Loader2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useMediaQuery } from "../admin/referral-management-page";

export default function AccountSettingsForm() {
  const { user, updateProfile } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Add a new ref for the validID file input
  const validIDFileInputRef = useRef<HTMLInputElement>(null);

  // Add state for validID file and preview
  const [validIDFile, setValidIDFile] = useState<File | null>(null);
  const [validIDPreview, setValidIDPreview] = useState<string | null>(null);

  // Update the formData state to include all required fields including address
  const [formData, setFormData] = useState<Partial<UserProfile>>({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    gender: user?.gender || undefined,
    country: user?.country || "",
    stateOfOrigin: user?.stateOfOrigin || "",
    phone: user?.phone || "",
    address: user?.address || "", // Add address field
    city: user?.city || "",
    nextOfKinName: user?.nextOfKinName || "",
    nextOfKinAddress: user?.nextOfKinAddress || "",
    nextOfKinPhone: user?.nextOfKinPhone || "",
    validID: user?.validID || "",
  });

  const isDesktop = useMediaQuery("(min-width: 768px)");
  const [open, setOpen] = useState(false);

  // Check if profile is incomplete
  const isProfileIncomplete = !user?.firstName || !user?.lastName;

  // Add a handler for validID file selection
  const handleValidIDClick = () => {
    validIDFileInputRef.current?.click();
  };

  const handleValidIDChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("ID image size should be less than 5MB");
        return;
      }

      // Check file type
      if (!file.type.startsWith("image/")) {
        toast.error("Please upload an image file for your ID");
        return;
      }

      setValidIDFile(file);
      // Create a preview URL
      const reader = new FileReader();
      reader.onload = (event) => {
        setValidIDPreview(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Update the useEffect to handle both location structures
  useEffect(() => {
    // Open modal if profile is incomplete
    if (isProfileIncomplete) {
      setOpen(true);
    }

    // Update form data when user changes
    if (user) {
      setFormData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        gender: user.gender || undefined,
        country: user.country || "",
        stateOfOrigin: user.stateOfOrigin || "",
        phone: user.phone || "",
        address: user.address || "", // Add address field
        city: user.city || "",
        nextOfKinName: user?.nextOfKinName || "",
        nextOfKinAddress: user?.nextOfKinAddress || "",
        nextOfKinPhone: user?.nextOfKinPhone || "",
        validID: user?.validID || "",
      });

      // Set profile image if available
      if (user.avatar) {
        setProfileImage(user.avatar);
      } else if (user.profileImage) {
        setProfileImage(user.profileImage);
      }

      // Set validID preview if available
      if (user.validID) {
        setValidIDPreview(user.validID);
      }
    }
  }, [user, isProfileIncomplete]);

  // Prevent closing the modal if profile is incomplete
  const handleOpenChange = (newOpen: boolean) => {
    if (isProfileIncomplete && !newOpen) {
      // Don't allow closing if profile is incomplete
      toast.error("Please complete your profile information");
      return;
    }
    setOpen(newOpen);
  };

  // Updated to handle both input and textarea
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size should be less than 5MB");
        return;
      }

      // Check file type
      if (!file.type.startsWith("image/")) {
        toast.error("Please upload an image file");
        return;
      }

      setImageFile(file);
      // Create a preview URL
      const reader = new FileReader();
      reader.onload = (event) => {
        setProfileImage(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Updated handleSubmit function to properly handle file uploads and only submit filled fields
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    if (!formData.firstName || !formData.lastName) {
      toast.error("First name and last name are required");
      return;
    }

    setIsSubmitting(true);

    try {
      // Check if we have files to upload
      const hasFiles = imageFile || validIDFile;

      if (hasFiles) {
        // Create FormData for multipart/form-data submission
        const submitFormData = new FormData();

        // Add only filled text fields to FormData
        Object.entries(formData).forEach(([key, value]) => {
          if (
            value !== undefined &&
            value !== null &&
            value !== "" &&
            value.toString().trim() !== ""
          ) {
            submitFormData.append(key, value.toString().trim());
          }
        });

        // Add files to FormData if they exist
        if (imageFile) {
          submitFormData.append("profileImage", imageFile);
        }

        if (validIDFile) {
          submitFormData.append("validID", validIDFile);
        }

        // Only proceed if we have data to submit
        const hasData = Array.from(submitFormData.keys()).length > 0;

        if (!hasData) {
          toast.error(
            "Please fill in at least some information to update your profile"
          );
          return;
        }

        console.log("Submitting form data with files:");
        // Log FormData contents for debugging
        for (const [key, value] of submitFormData.entries()) {
          if (value instanceof File) {
            console.log(`${key}: File - ${value.name} (${value.size} bytes)`);
          } else {
            console.log(`${key}: ${value}`);
          }
        }

        // Call updateProfile with FormData
        const success = await updateProfile(submitFormData);

        if (success) {
          toast.success("Profile updated successfully");
          // Reset file states
          setImageFile(null);
          setValidIDFile(null);
        } else {
          toast.error("Failed to update profile");
        }
      } else {
        // No files, send regular object with only filled fields
        const filteredFormData: Partial<UserProfile> = {};

        Object.entries(formData).forEach(([key, value]) => {
          if (
            value !== undefined &&
            value !== null &&
            value !== "" &&
            value.toString().trim() !== ""
          ) {
            filteredFormData[key as keyof UserProfile] = value
              .toString()
              .trim() as any;
          }
        });

        // Only proceed if we have data to submit
        if (Object.keys(filteredFormData).length === 0) {
          toast.error(
            "Please fill in at least some information to update your profile"
          );
          return;
        }

        console.log("Submitting profile data without files:", filteredFormData);

        const success = await updateProfile(filteredFormData);

        if (success) {
          toast.success("Profile updated successfully");
        } else {
          toast.error("Failed to update profile");
        }
      }
    } catch (error: any) {
      console.error("Error updating profile:", error);

      // Handle specific error types
      if (error.response?.status === 401) {
        toast.error("Session expired. Please log in again.");
      } else if (error.response?.status === 400) {
        toast.error(error.response.data.message || "Invalid data provided");
      } else if (error.response?.status === 413) {
        toast.error("File size too large. Please choose smaller files.");
      } else {
        toast.error("An error occurred while updating your profile");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="space-y-6">
        <FadeIn>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Account Settings
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Manage your account information and preferences
              </p>
            </div>
          </div>
        </FadeIn>

        <FadeIn delay={0.1}>
          <div className="mb-4">
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink href="/dashboard/settings">
                    Settings
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>Account</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </FadeIn>

        <FadeIn delay={0.2}>
          <Tabs defaultValue="profile">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="profile">Profile Information</TabsTrigger>
              <TabsTrigger value="preferences">Preferences</TabsTrigger>
            </TabsList>

            <TabsContent value="profile">
              <AnimatedCard className="p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Profile Image Section */}
                  <div className="flex flex-col items-center space-y-4">
                    <div
                      className="relative cursor-pointer group"
                      onClick={handleImageClick}
                    >
                      <Avatar className="h-24 w-24 border-2 border-primary/20 object-cover">
                        <AvatarImage
                          src={profileImage || undefined}
                          alt={user?.userName || "User"}
                          className="object-cover"
                        />
                        <AvatarFallback className="bg-primary/10 text-primary">
                          <User className="h-12 w-12" />
                        </AvatarFallback>
                      </Avatar>
                      <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                        <Camera className="h-8 w-8 text-white" />
                      </div>
                    </div>
                    <input
                      type="file"
                      ref={fileInputRef}
                      className="hidden"
                      accept="image/*"
                      onChange={handleImageChange}
                    />
                    <p className="text-sm text-muted-foreground">
                      Click to upload profile picture
                    </p>
                  </div>

                  {/* User Information (Read-only) */}
                  <div className="space-y-4 p-4 rounded-lg bg-muted/50">
                    <h3 className="text-sm font-medium text-muted-foreground">
                      Account Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label
                          htmlFor="username"
                          className="text-muted-foreground"
                        >
                          Username
                        </Label>
                        <Input
                          id="username"
                          value={user?.userName || ""}
                          readOnly
                          className="bg-background/50 cursor-not-allowed"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label
                          htmlFor="email"
                          className="text-muted-foreground"
                        >
                          Email
                        </Label>
                        <Input
                          id="email"
                          value={user?.email || ""}
                          readOnly
                          className="bg-background/50 cursor-not-allowed"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="role" className="text-muted-foreground">
                          Role
                        </Label>
                        <Input
                          id="role"
                          value={user?.role || ""}
                          readOnly
                          className="bg-background/50 cursor-not-allowed capitalize"
                        />
                      </div>
                      {user?.role === "agent" && (
                        <div className="space-y-2">
                          <Label
                            htmlFor="agentRank"
                            className="text-muted-foreground"
                          >
                            Agent Rank
                          </Label>
                          <Input
                            id="agentRank"
                            value={user?.agentRank || ""}
                            readOnly
                            className="bg-background/50 cursor-not-allowed"
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Personal Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">
                      Personal Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">
                          First Name <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="firstName"
                          name="firstName"
                          placeholder="Enter your first name"
                          value={formData.firstName}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">
                          Last Name <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="lastName"
                          name="lastName"
                          placeholder="Enter your last name"
                          value={formData.lastName}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="gender">Gender</Label>
                        <Select
                          value={formData.gender}
                          onValueChange={(value) =>
                            handleSelectChange("gender", value)
                          }
                        >
                          <SelectTrigger id="gender">
                            <SelectValue placeholder="Select gender" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Male">Male</SelectItem>
                            <SelectItem value="Female">Female</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input
                          id="phone"
                          name="phone"
                          placeholder="Enter your phone number"
                          value={formData.phone}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="country">Country</Label>
                        <Input
                          id="country"
                          name="country"
                          placeholder="Enter your country"
                          value={formData.country}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="stateOfOrigin">State of Origin</Label>
                        <Input
                          id="stateOfOrigin"
                          name="stateOfOrigin"
                          placeholder="Enter your state of origin"
                          value={formData.stateOfOrigin}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="city">City</Label>
                        <Input
                          id="city"
                          name="city"
                          placeholder="Enter your city"
                          value={formData.city}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="validID">Valid ID</Label>
                        <div className="mt-1 flex flex-col items-center space-y-2">
                          <div
                            onClick={handleValidIDClick}
                            className="relative flex items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg cursor-pointer hover:border-primary/50 transition-colors"
                          >
                            {validIDPreview ? (
                              <div className="relative w-full h-full">
                                <img
                                  src={validIDPreview || "/placeholder.svg"}
                                  alt="ID Preview"
                                  className="w-full h-full object-contain rounded-lg"
                                />
                                <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 flex items-center justify-center transition-opacity rounded-lg">
                                  <Camera className="h-8 w-8 text-white" />
                                </div>
                              </div>
                            ) : (
                              <div className="text-center">
                                <Camera className="mx-auto h-8 w-8 text-muted-foreground" />
                                <span className="mt-2 block text-sm text-muted-foreground">
                                  Click to upload your ID
                                </span>
                              </div>
                            )}
                          </div>
                          <input
                            type="file"
                            ref={validIDFileInputRef}
                            className="hidden"
                            accept="image/*"
                            onChange={handleValidIDChange}
                          />
                          <p className="text-xs text-muted-foreground">
                            Upload a clear image of your government-issued ID
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Address Field - Added here */}
                    <div className="space-y-2">
                      <Label htmlFor="address">Address</Label>
                      <Textarea
                        id="address"
                        name="address"
                        placeholder="Enter your full address"
                        value={formData.address}
                        onChange={handleInputChange}
                        rows={3}
                        className="resize-none"
                      />
                    </div>
                  </div>

                  {/* Next of Kin Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">
                      Next of Kin Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="nextOfKinName">Next of Kin Name</Label>
                        <Input
                          id="nextOfKinName"
                          name="nextOfKinName"
                          placeholder="Enter next of kin name"
                          value={formData.nextOfKinName}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="nextOfKinPhone">
                          Next of Kin Phone
                        </Label>
                        <Input
                          id="nextOfKinPhone"
                          name="nextOfKinPhone"
                          placeholder="Enter next of kin phone"
                          value={formData.nextOfKinPhone}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="nextOfKinAddress">
                        Next of Kin Address
                      </Label>
                      <Textarea
                        id="nextOfKinAddress"
                        name="nextOfKinAddress"
                        placeholder="Enter next of kin address"
                        value={formData.nextOfKinAddress}
                        onChange={handleInputChange}
                        rows={3}
                        className="resize-none"
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      "Update Profile"
                    )}
                  </Button>
                </form>
              </AnimatedCard>
            </TabsContent>

            <TabsContent value="preferences">
              <AnimatedCard className="p-6">
                <div className="space-y-4">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Notification Preferences
                  </h2>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                          Email Notifications
                        </h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Receive email notifications for important updates
                        </p>
                      </div>
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="emailNotifications"
                          defaultChecked
                          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                          Marketing Emails
                        </h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Receive marketing emails about new properties and
                          offers
                        </p>
                      </div>
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="marketingEmails"
                          defaultChecked
                          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                      Language & Region
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="language">Language</Label>
                        <select
                          id="language"
                          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                          defaultValue="en"
                        >
                          <option value="en">English</option>
                          <option value="fr">French</option>
                          <option value="es">Spanish</option>
                          <option value="de">German</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="timezone">Timezone</Label>
                        <select
                          id="timezone"
                          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                          defaultValue="WAT"
                        >
                          <option value="WAT">West Africa Time (WAT)</option>
                          <option value="GMT">Greenwich Mean Time (GMT)</option>
                          <option value="EST">
                            Eastern Standard Time (EST)
                          </option>
                          <option value="PST">
                            Pacific Standard Time (PST)
                          </option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end pt-4">
                    <AnimatedButton
                      type="button"
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      <Save className="mr-2 h-4 w-4" /> Save Preferences
                    </AnimatedButton>
                  </div>
                </div>
              </AnimatedCard>
            </TabsContent>
          </Tabs>
        </FadeIn>
      </div>
    </>
  );
}
