"use server";

import { createClient } from "~/lib/supabase/server";
import { db } from "~/server/db";
import type { Profile } from "@prisma/client";
import type { SupabaseGetUserResp } from "~/types/types";
import type { ProfileValues } from "~/schema/auth.schema";

export async function getProfile(): Promise<Profile | null> {
  const supabase = await createClient();

  const resp = (await supabase.auth.getUser()) as SupabaseGetUserResp;

  const authError = resp.error;
  if (authError) {
    console.error("Supabase getUser error:", authError.message ?? authError);
    return null;
  }

  const user = resp.data?.user ?? null;
  if (!user) return null;

  try {
    const profile = await db.profile.findUnique({
      where: { id: user.id },
    });
    return profile;
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error("Error fetching profile:", err.message);
    } else {
      console.error("Error fetching profile:", String(err));
    }
    return null;
  }
}

export async function createProfile(): Promise<Profile | null> {
  const supabase = await createClient();

  const resp = (await supabase.auth.getUser()) as SupabaseGetUserResp;

  const authError = resp.error;
  if (authError) {
    console.error("Supabase getUser error:", authError.message ?? authError);
    return null;
  }

  const user = resp.data?.user ?? null;
  if (!user) return null;

  try {
    const existingProfile = await db.profile.findUnique({
      where: { id: user.id },
    });

    if (existingProfile) {
      return existingProfile;
    }

    const newProfile = await db.profile.create({
      data: {
        id: user.id,
        name: user.user_metadata.name || "Unknown",
        image: user.user_metadata.avatar_url || null,
      },
    });
    return newProfile;
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error("Error handling profile:", err.message);
    } else {
      console.error("Error handling profile:", String(err));
    }
    return null;
  }
}

export async function updateProfileImageUrl(
  userId: string,
  imageUrl: string,
): Promise<{ result: boolean; error: string | null }> {
  const supabase = await createClient();

  try {
    const { data: userData, error: authError } = await supabase.auth.getUser();
    if (authError || !userData?.user || userData.user.id !== userId) {
      console.error("User verification failed:", authError ?? "unauthorized");
      return { result: false, error: "Unauthorized" };
    }

    const { error: updateSupabaseUserError } = await supabase
      .from("users")
      .update({
        avatar_url: imageUrl,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId);

    if (updateSupabaseUserError) {
      console.error(
        "Failed to update supabase users table:",
        updateSupabaseUserError,
      );
    }

    await db.profile.update({
      where: { id: userId },
      data: {
        image: imageUrl,
        updatedAt: new Date().toISOString(),
      },
    });

    return { result: true, error: null };
  } catch (err: unknown) {
    console.error("Failed to update profile image URL:", err);
    const message = err instanceof Error ? err.message : String(err);
    return { result: false, error: `DB update failed: ${message}` };
  }
}

export async function updateProfileInfo(
  userId: string,
  data: ProfileValues,
  currentEmail: string,
  currentName: string | null,
) {
  const supabase = await createClient();
  const { email, name } = data;

  try {
    const { data: userData, error: authError } = await supabase.auth.getUser();

    if (authError || !userData?.user) {
      console.error("User verification failed:", authError);
      return { result: null, error: "Unauthorized" };
    }

    const emailChanged = email !== currentEmail;
    const nameChanged = name !== currentName;

    if (!emailChanged && !nameChanged) {
      return { result: null, error: "No changes detected" };
    }

    if (emailChanged) {
      const { error: updateEmailError } = await supabase.auth.updateUser({
        email,
      });

      if (updateEmailError) {
        console.error("Failed to update email:", updateEmailError);
        return {
          result: null,
          error: `Failed to update email: ${updateEmailError.message}`,
        };
      }
    }

    if (nameChanged) {
      try {
        await db.profile.update({
          where: { id: userId },
          data: {
            name,
            updatedAt: new Date().toISOString(),
          },
        });
      } catch (dbErr: unknown) {
        console.error("Failed to update profile name:", dbErr);

        const errorMessage =
          dbErr instanceof Error ? dbErr.message : String(dbErr);

        if (emailChanged) {
          return {
            result: null,
            error: `Email updated but failed to update name: ${errorMessage}`,
          };
        }

        return {
          result: null,
          error: `Failed to update name: ${errorMessage}`,
        };
      }
    }

    const updatedProfile = await db.profile.findUnique({
      where: { id: userId },
    });

    if (!updatedProfile) {
      return { result: null, error: "Failed to fetch updated profile" };
    }

    return { result: updatedProfile, error: null };
  } catch (error) {
    console.error("Unexpected error in updateProfileInfo:", error);
    return {
      result: null,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}
