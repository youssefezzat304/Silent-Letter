"use client";

import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import { Form, FormField, FormItem } from "~/components/ui/form";
import { profileSchema, type ProfileValues } from "~/schema/auth.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useAuth } from "~/hooks/useAuth";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import InputError from "../_components/ui/InputError";
import { Profile } from "../_components/layout/NavBar";
import Loading from "../loading";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { createClient } from "~/lib/supabase/client";
import {
  getProfile,
  updateProfileInfo,
  updateProfileImageUrl,
} from "../api/actions/profile";
import { toast } from "sonner";
import CustomToast from "../_components/ui/CustomToast";
import type { Profile as ProfileType } from "@prisma/client";
import { useProfileImage } from "~/hooks/useProfileImage";
import { useGetUser } from "~/hooks/useGetUser";

function ProfilePage() {
  const supabase = createClient();
  const { user, setUser, loading } = useGetUser();
  const [profile, setProfile] = useState<ProfileType | null>(null);

  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const profileForm = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      email: "",
      name: "",
      image: undefined,
    },
  });

  const { handleSignOut } = useAuth();
  // Keep the hooks for UI consistency, even though they won't be fully used
  const { uploading: imageUploading } = useProfileImage();
  const [isSubmitting] = useState(false);
  const uploading = imageUploading || isSubmitting;

  useEffect(() => {
    const getUser = async () => {
      try {
        const fetchedProfile = await getProfile();
        if (!fetchedProfile) {
          console.warn("No profile found for user:", user?.id);
        }
        setProfile(fetchedProfile);
      } catch (err) {
        console.error("Unexpected error getting user:", err);
        setProfile(null);
      }
    };

    void getUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [supabase]);

  useEffect(() => {
    if (!loading && user === null) {
      router.replace("/");
    }
  }, [user, router, loading]);

  useEffect(() => {
    if (user) {
      profileForm.reset({
        email: user.email ?? "",
        name: profile?.name ?? "",
        image: profile?.image ?? undefined,
      });
    }
  }, [user, profile, profileForm]);

  // Keep handlers for UI consistency, though they are blocked
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleChangeImageClick = () => {
    fileInputRef.current?.click();
  };

  // Block onSubmit
  const onSubmit = async (data: ProfileValues) => {
    // Form submission is blocked, this won't be called
    console.warn("Profile page is disabled.");
  };

  if (loading) {
    return <Loading />;
  }

  if (!user) {
    return null;
  }

  const displayImage = previewImage ?? profile?.image?.toString() ?? "";

  return (
    <Form {...profileForm}>
      {/* Prevent form submission */}
      <form
        className="flex w-full items-center justify-center"
        onSubmit={(e) => {
          e.preventDefault();
          toast.custom(() => (
            <CustomToast text="This feature is coming soon!" type="info" />
          ));
        }}
      >
        {/* Add relative positioning to the card */}
        <Card className="cartoonish-card relative mx-5 w-full px-4">
          {/* --- DISABLED OVERLAY --- */}
          <div className="absolute inset-0 z-10 flex items-center justify-center rounded-lg bg-white/70 backdrop-blur-sm dark:bg-black/70">
            <span className="text-3xl font-bold text-gray-800 dark:text-gray-200">
              Coming Soon!
            </span>
          </div>
          {/* --- END DISABLED OVERLAY --- */}

          {/* Original UI elements, now under the overlay */}
          <Profile
            imageSrc={displayImage}
            fallback={profile?.name?.[0] ?? "C"}
            className="h-32 w-32 self-center md:h-48 md:w-48"
            fallbackClassName="text-[3rem]"
          />

          <Input
            type="file"
            accept="image/*"
            className="hidden"
            ref={fileInputRef}
            onChange={handleImageChange}
            disabled={true}
          />

          <Button
            type="button"
            className="cartoonish-btn w-52 self-center from-gray-500 to-gray-800"
            onClick={handleChangeImageClick}
            disabled={true}
          >
            Change image
          </Button>

          <FormField
            {...profileForm}
            name="name"
            control={profileForm.control}
            render={({ field }) => (
              <FormItem>
                <Label htmlFor="name">Name</Label>
                <Input
                  placeholder="Name"
                  alt="Name"
                  {...field}
                  disabled={true}
                />
                <InputError form={profileForm} name="name" />
              </FormItem>
            )}
          />

          <FormField
            {...profileForm}
            name="email"
            control={profileForm.control}
            render={({ field }) => (
              <FormItem>
                <Label htmlFor="email">Email</Label>
                <Input
                  placeholder="Email"
                  alt="Email"
                  {...field}
                  disabled={true}
                />
                <InputError form={profileForm} name="email" />
              </FormItem>
            )}
          />

          <div className="flex flex-col gap-2 self-center">
            <Button
              type="submit"
              className="cartoonish-btn w-52 from-blue-500 to-blue-800"
              disabled={true}
            >
              {uploading ? "Updating..." : "Submit Changes"}
            </Button>
            <Button
              type="button"
              className="cartoonish-btn w-52 from-red-700 to-red-950"
              onClick={handleSignOut}
            >
              Logout
            </Button>
          </div>
        </Card>
      </form>
    </Form>
  );
}

export default ProfilePage;
