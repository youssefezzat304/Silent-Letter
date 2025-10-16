import { useState } from "react";
import { createClient } from "~/lib/supabase/client";

interface UploadResult {
  result: boolean;
  error: string | null;
  publicUrl?: string;
}

export function useProfileImage() {
  const [uploading, setUploading] = useState(false);
  const supabase = createClient();

  const uploadProfileImage = async (
    file: File,
    userId: string,
  ): Promise<UploadResult> => {
    const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
    const ALLOWED_TYPES = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/gif",
    ];
    const ALLOWED_EXTENSIONS = ["jpg", "jpeg", "png", "webp", "gif"];

    if (file.size > MAX_FILE_SIZE) {
      return {
        result: false,
        error: `File size exceeds ${MAX_FILE_SIZE / 1024 / 1024} MB limit.`,
      };
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return {
        result: false,
        error: "Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed.",
      };
    }

    const fileExt = file.name.split(".").pop()?.toLowerCase();
    if (!fileExt || !ALLOWED_EXTENSIONS.includes(fileExt)) {
      return { result: false, error: "Invalid file extension." };
    }

    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `${userId}/${fileName}`;

    setUploading(true);

    try {
      const { data: userData, error: authError } =
        await supabase.auth.getUser();
      if (authError || !userData?.user) {
        console.error("User verification failed:", authError ?? "no user");
        return { result: false, error: "Unauthorized" };
      }

      const { data: existingFiles, error: listError } = await supabase.storage
        .from("avatars")
        .list(userId);

      if (listError) {
        console.error("Error listing existing files:", listError);
      } else if (existingFiles && existingFiles.length > 0) {
        const filesToDelete = existingFiles.map((f) => `${userId}/${f.name}`);
        const { error: deleteError } = await supabase.storage
          .from("avatars")
          .remove(filesToDelete);
        if (deleteError) {
          console.error("Error deleting old avatar files:", deleteError);
        }
      }

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, {
          contentType: file.type,
          upsert: true,
          cacheControl: "3600",
        });

      if (uploadError) {
        console.error("Upload error:", uploadError);
        return { result: false, error: uploadError.message ?? "Upload failed" };
      }

      const { data: publicUrlData } = supabase.storage
        .from("avatars")
        .getPublicUrl(filePath);
      const publicUrl = publicUrlData?.publicUrl ?? null;

      if (!publicUrl) {
        try {
          await supabase.storage.from("avatars").remove([filePath]);
        } catch (e) {
          console.error("Cleanup failed after missing public URL:", e);
        }
        return {
          result: false,
          error: "Failed to obtain public URL for uploaded file",
        };
      }

      return { result: true, error: null, publicUrl };
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.error("Unexpected error in uploadProfileImage:", err.message);
        return { result: false, error: err.message };
      } else {
        console.error(
          "Unexpected non-error thrown in uploadProfileImage:",
          String(err),
        );
        return { result: false, error: "Unknown error occurred" };
      }
    } finally {
      setUploading(false);
    }
  };

  return {
    uploadProfileImage,
    uploading,
  };
}
