"use server";

import { supabase } from "~/lib/supabaseClient";

// Constants for validation
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const ALLOWED_EXTENSIONS = ["jpg", "jpeg", "png", "webp", "gif"];

export async function uploadImageToSupabase(
  file: File,
  userId: string,
): Promise<{ url: string | null; error: string | null }> {
  try {
    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return { url: null, error: "File size exceeds 5MB limit" };
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return {
        url: null,
        error: "Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed",
      };
    }

    // Verify user authorization
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("id")
      .eq("id", userId)
      .single();

    if (userError || !user) {
      console.error("User verification failed:", userError);
      return { url: null, error: "Unauthorized" };
    }

    // Alternative: If using Supabase Auth, you could do:
    // const { data: { user: authUser } } = await supabase.auth.getUser();
    // if (!authUser || authUser.id !== userId) {
    //   return { url: null, error: "Unauthorized" };
    // }

    // List and delete existing avatar files
    const { data: existingFiles, error: listError } = await supabase.storage
      .from("avatars")
      .list(userId);

    if (listError) {
      console.error("Error listing existing files:", listError);
      // Continue anyway - old files won't be deleted but upload can proceed
    }

    if (existingFiles && existingFiles.length > 0) {
      const filesToDelete = existingFiles.map(
        (file) => `${userId}/${file.name}`,
      );

      const { error: deleteError } = await supabase.storage
        .from("avatars")
        .remove(filesToDelete);

      if (deleteError) {
        console.error("Error deleting old files:", deleteError);
        // Continue anyway - old files remain but new upload can proceed
      }
    }

    // Prepare file for upload
    const fileExt = file.name.split(".").pop()?.toLowerCase();

    // Validate extension
    if (!fileExt || !ALLOWED_EXTENSIONS.includes(fileExt)) {
      return { url: null, error: "Invalid file extension" };
    }

    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `${userId}/${fileName}`;

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload file to Supabase storage
    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: true,
        cacheControl: "3600",
      });

    if (uploadError) {
      console.error("Upload error:", uploadError);
      return { url: null, error: uploadError.message };
    }

    // Get public URL
    const { data } = supabase.storage.from("avatars").getPublicUrl(filePath);

    // Optionally update user profile with new avatar URL
    const { error: updateError } = await supabase
      .from("users")
      .update({
        avatar_url: data.publicUrl,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId);

    if (updateError) {
      console.error(
        "Failed to update user profile with avatar URL:",
        updateError,
      );
      // Still return the URL even if profile update fails
    }

    return { url: data.publicUrl, error: null };
  } catch (error) {
    console.error("Unexpected error in uploadImageToSupabase:", error);
    return {
      url: null,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

// Optional: Add a function to delete avatar
export async function deleteAvatarFromSupabase(
  userId: string,
): Promise<{ success: boolean; error: string | null }> {
  try {
    // Verify user authorization
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("id")
      .eq("id", userId)
      .single();

    if (userError || !user) {
      return { success: false, error: "Unauthorized" };
    }

    // List all files in user's folder
    const { data: existingFiles, error: listError } = await supabase.storage
      .from("avatars")
      .list(userId);

    if (listError) {
      return { success: false, error: listError.message };
    }

    if (existingFiles && existingFiles.length > 0) {
      const filesToDelete = existingFiles.map(
        (file) => `${userId}/${file.name}`,
      );

      const { error: deleteError } = await supabase.storage
        .from("avatars")
        .remove(filesToDelete);

      if (deleteError) {
        return { success: false, error: deleteError.message };
      }
    }

    // Clear avatar URL from user profile
    const { error: updateError } = await supabase
      .from("users")
      .update({
        avatar_url: null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId);

    if (updateError) {
      console.error("Failed to clear avatar URL from profile:", updateError);
    }

    return { success: true, error: null };
  } catch (error) {
    console.error("Unexpected error in deleteAvatarFromSupabase:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}
