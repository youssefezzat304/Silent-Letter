import { createClient } from "~/lib/supabase/server";
import { db } from "~/server/db";
import { checkRateLimit } from "~/lib/rate-limiter";
import { getIpAddress } from "~/lib/server-utils";

export async function signUp(email: string, password: string, name: string) {
  const ip = await getIpAddress();
  console.log(ip);
  const { isLimited, error: limitError } = checkRateLimit(ip, 5, 60 * 60);

  if (isLimited) {
    console.warn(`Rate limit hit for signUp from IP: ${ip}`);
    return {
      result: null,
      authError: {
        name: "RateLimitError",
        message: limitError ?? "Too many requests",
      },
    };
  }

  const supabase = await createClient();
  const { data, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { name } },
  });

  if (authError || !data.user) {
    return { result: null, authError };
  }

  const result = await db.profile.create({
    data: {
      id: data.user.id,
      name: name.trim(),
    },
  });

  return { result, authError: null };
}

export async function signIn(email: string, password: string) {
  const ip = await getIpAddress();
  const { isLimited, error: limitError } = checkRateLimit(ip, 10, 15 * 60);

  if (isLimited) {
    console.warn(`Rate limit hit for signIn from IP: ${ip}`);
    return {
      name: "RateLimitError",
      message: limitError ?? "Too many login attempts",
    };
  }
  
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

    return { success: true };
  } catch (error) {
    console.error("Update profile error:", error);
    return { error: "Failed to update profile" };
  }
}
