"use server";

import { createClient } from "~/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { db } from "~/server/db";

export async function signUp(email: string, password: string, name: string) {
  const supabase = await createClient();
  const { data, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { name } },
  });

  if (authError || !data.user) {
    return { result: null, authError };
  }

  const result = await db.profile.create(
    {
      data: {
        id: data.user.id,
        name: name.trim(),
      },
    },
  );

  return { result, authError: null };
}

export async function signIn(email: string, password: string) {
  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  return error;
}

export async function updateProfile(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  const name = formData.get("name") as string;
  const image = formData.get("image") as string;

  try {
    await db.profile.update({
      where: { id: user.id },
      data: { name, image },
    });

    revalidatePath("/", "layout");
    return { success: true };
  } catch (error) {
    console.error("Update profile error:", error);
    return { error: "Failed to update profile" };
  }
}
