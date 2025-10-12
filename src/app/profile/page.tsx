"use client";

import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import { Form, FormField, FormItem } from "~/components/ui/form";
import { useSession } from "next-auth/react";
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
import { uploadImageToSupabase } from "./actions";
import { updateProfileAction } from "~/app/auth/actions";
import { toast } from "sonner";
import CustomToast from "../_components/ui/CustomToast";

function ProfilePage() {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const profileForm = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: session?.user?.name ?? "",
      email: session?.user?.email ?? "",
      image: session?.user?.image ?? undefined,
    },
  });

  const { handleSignOut } = useAuth();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/");
    }
  }, [status, router]);

  useEffect(() => {
    if (session?.user) {
      profileForm.reset({
        name: session.user.name ?? "",
        email: session.user.email ?? "",
        image: session.user.image ?? undefined,
      });
    }
  }, [session, profileForm]);

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
    if (!session?.user?.id) {
      toast.custom(() => (
        <CustomToast text="User session not found" type="error" />
      ));
      return;
    }

    setUploading(true);

    try {
      let imageUrl = session.user.image ?? undefined;

      if (selectedFile) {
        const { url, error } = await uploadImageToSupabase(
          selectedFile,
          session.user.id,
        );

        if (error || !url) {
          toast.custom(() => (
            <CustomToast
              text={`Failed to upload image: ${error}`}
              type="error"
            />
          ));
          return;
        }

        imageUrl = url;
      }

      const result = await updateProfileAction(session.user.id, {
        name: data.name,
        email: data.email,
        image: imageUrl,
      });

      if (!result.ok) {
        toast.custom(() => (
          <CustomToast
            text={result.error.message || "Failed to update profile"}
            type="error"
          />
        ));
        return;
      }

      await update({
        ...session,
        user: {
          ...session.user,
          name: data.name,
          email: data.email,
          image: imageUrl,
        },
      });

      toast.custom(() => (
        <CustomToast text="Profile updated successfully!" type="success" />
      ));

      setPreviewImage(null);
      setSelectedFile(null);

      router.refresh();
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
      setUploading(false);
    }
  };

  if (status === "loading") {
    return <Loading />;
  }

  if (status === "unauthenticated") {
    return null;
  }

  const displayImage = previewImage ?? session?.user?.image?.toString() ?? "";

  return (
    <Form {...profileForm}>
      <form
        className="flex w-full items-center justify-center"
        onSubmit={profileForm.handleSubmit(onSubmit)}
      >
        <Card className="cartoonish-card mx-5 w-full px-4">
          <Profile
            imageSrc={displayImage}
            fallback={session?.user?.name?.[0] ?? "C"}
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
