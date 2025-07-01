"use client";

import type React from "react";

import { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Camera, Loader2, User } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useMediaQuery } from "../admin/referral-management-page";

export function ProfileCompletionModal() {
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

  // Update the formData state to include all required fields and handle the location object correctly
  const [formData, setFormData] = useState<Partial<UserProfile>>({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    gender: user?.gender || undefined,
    country: user?.country || "",
    stateOfOrigin: user?.stateOfOrigin || "",
    phone: user?.phone || "",
    address: user?.address || "",
    // Use city from either direct property or location object
    city: user?.city || "",
    // Add next of kin information
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
        // Use city from either direct property or location object
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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

  // Update the handleSubmit function to handle both location structures
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    if (!formData.firstName || !formData.lastName) {
      toast.error("First name and last name are required");
      return;
    }

    setIsSubmitting(true);

    try {
      // Create a copy of the form data
      const profileData = { ...formData };

      // Handle profile image upload if there's a new image
      if (imageFile) {
        profileData.avatar = profileImage || undefined;
      }

      // Handle validID upload if there's a new file
      if (validIDFile) {
        // In a real implementation, you would upload the file to your server
        // and get back a URL to store in the user profile
        profileData.validID = validIDPreview || undefined;
      }

      console.log("new profile data", profileData);

      const success = await updateProfile(profileData);

      if (success) {
        toast.success("Profile updated successfully");
        setOpen(false);
      } else {
        toast.error("Failed to update profile");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("An error occurred while updating your profile");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Update the form content to include all fields
  const content = (
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
            <Label htmlFor="username" className="text-muted-foreground">
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
            <Label htmlFor="email" className="text-muted-foreground">
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
              <Label htmlFor="agentRank" className="text-muted-foreground">
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
        <h3 className="text-lg font-medium">Personal Information</h3>
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
              onValueChange={(value) => handleSelectChange("gender", value)}
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
      </div>

      {/* Next of Kin Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Next of Kin Information</h3>
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
            <Label htmlFor="nextOfKinPhone">Next of Kin Phone</Label>
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
          <Label htmlFor="nextOfKinAddress">Next of Kin Address</Label>
          <Input
            id="nextOfKinAddress"
            name="nextOfKinAddress"
            placeholder="Enter next of kin address"
            value={formData.nextOfKinAddress}
            onChange={handleInputChange}
          />
        </div>
      </div>

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Updating...
          </>
        ) : (
          "Complete Profile"
        )}
      </Button>
    </form>
  );

  // Use Dialog for desktop and Drawer for mobile
  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={handleOpenChange} modal={true}>
        <DialogContent
          className="sm:max-w-[600px] max-h-[70vh] overflow-y-auto"
          onEscapeKeyDown={(e) => isProfileIncomplete && e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle>Complete Your Profile</DialogTitle>
            <DialogDescription>
              Please provide your information to complete your profile. This is
              required to continue using the platform.
            </DialogDescription>
          </DialogHeader>
          {content}
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={open} onOpenChange={handleOpenChange} modal={true}>
      <DrawerContent
        className="max-h-[80vh]"
        onEscapeKeyDown={(e) => isProfileIncomplete && e.preventDefault()}
      >
        <DrawerHeader className="text-left">
          <DrawerTitle>Complete Your Profile</DrawerTitle>
          <DrawerDescription>
            Please provide your information to complete your profile. This is
            required to continue using the platform.
          </DrawerDescription>
        </DrawerHeader>
        <div className="px-4 pb-8 overflow-y-auto">{content}</div>
      </DrawerContent>
    </Drawer>
  );
}
