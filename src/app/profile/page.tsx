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
  const { uploadProfileImage, uploading: imageUploading } = useProfileImage();
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const onSubmit = async (data: ProfileValues) => {
    if (!user?.id) {
      toast.custom(() => (
        <CustomToast text="User session not found" type="error" />
      ));
      return;
    }

    try {
      let imageUpdated = false;

      if (selectedFile) {
        const { result, error, publicUrl } = await uploadProfileImage(
          selectedFile,
          user.id,
        );

        if (error || !result || !publicUrl) {
          toast.custom(() => (
            <CustomToast
              text={`Failed to upload image: ${error}`}
              type="error"
            />
          ));
          return;
        }

        const { result: dbResult, error: dbError } =
          await updateProfileImageUrl(user.id, publicUrl);

        if (dbError || !dbResult) {
          toast.custom(() => (
            <CustomToast
              text={`Failed to save image: ${dbError}`}
              type="error"
            />
          ));
          return;
        }

        imageUpdated = true;
      }

      const emailChanged = data.email !== user.email;
      const nameChanged = data.name !== (profile?.name ?? "");

      if (emailChanged || nameChanged) {
        const { error } = await updateProfileInfo(
          user.id,
          data,
          user.email ?? "",
          profile?.name ?? "",
        );

        if (error) {
          toast.custom(() => <CustomToast text={error} type="error" />);
          return;
        }
      }

      if (imageUpdated || emailChanged || nameChanged) {
        toast.custom(() => (
          <CustomToast text="Profile updated successfully!" type="success" />
        ));
      }

      const updatedProfile = await getProfile();
      setProfile(updatedProfile);

      const {
        data: { user: refreshedUser },
      } = await supabase.auth.getUser();

      if (refreshedUser) {
        setUser(refreshedUser);
      }

      profileForm.reset({
        email: refreshedUser?.email ?? user.email ?? "",
        name: updatedProfile?.name ?? "",
        image: updatedProfile?.image ?? undefined,
      });

      setPreviewImage(null);
      setSelectedFile(null);
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.custom(() => (
        <CustomToast
          text={
            error instanceof Error
              ? error.message
              : "An unexpected error occurred"
          }
          type="error"
        />
      ));
    } finally {
      setIsSubmitting(false);
    }
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
      <form
        className="flex w-full items-center justify-center"
        onSubmit={profileForm.handleSubmit(onSubmit)}
      >
        <Card className="cartoonish-card mx-5 w-full px-4">
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
          />

          <Button
            type="button"
            className="cartoonish-btn w-52 self-center from-gray-500 to-gray-800"
            onClick={handleChangeImageClick}
            disabled={uploading}
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
                  disabled={uploading}
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
                  disabled={uploading}
                />
                <InputError form={profileForm} name="email" />
              </FormItem>
            )}
          />

          <div className="flex flex-col gap-2 self-center">
            <Button
              type="submit"
              className="cartoonish-btn w-52 from-blue-500 to-blue-800"
              disabled={uploading}
            >
              {uploading ? "Updating..." : "Submit Changes"}
            </Button>
            <Button
              type="button"
              className="cartoonish-btn w-52 from-red-700 to-red-950"
              onClick={handleSignOut}
              disabled={uploading}
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
