"use server";

import { supabase } from "~/lib/supabaseClient";
import bcrypt from "bcryptjs";
import {
  createAccountSchema,
  type CreateAccountValues,
} from "~/schema/auth.schema";
import type { ActionResult } from "~/types/types";

/**
 * Creates a new user with email and password.
 */
export async function credentialsSignupAction(
  data: CreateAccountValues,
): Promise<ActionResult<{ email: string; password: string }>> {
  const parsed = createAccountSchema.safeParse(data);

  if (!parsed.success) {
    const fieldErrors: Record<string, string[]> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? "_form");
      fieldErrors[key] = fieldErrors[key] ?? [];
      fieldErrors[key]?.push(issue.message);
    }
    return {
      ok: false,
      error: {
        name: "ValidationError",
        message: "Invalid form data.",
        fields: fieldErrors,
      },
    };
  }

  const { name, email, password } = parsed.data;

  try {
    const { data: existingUser, error: fetchError } = await supabase
      .from("users")
      .select("id")
      .eq("email", email)
      .single();

    if (fetchError && fetchError.code !== "PGRST116") {
      throw fetchError;
    }

    if (existingUser) {
      return {
        ok: false,
        error: { name: "UserExists", message: "Email is already in use." },
      };
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const { error: insertError } = await supabase.from("users").insert({
      name,
      email,
      password: passwordHash,
    });

    if (insertError) throw insertError;

    return { ok: true, data: { email, password } };
  } catch (error) {
    console.error("Signup Action Error:", error);
    return {
      ok: false,
      error: { name: "ServerError", message: "An unexpected error occurred." },
    };
  }
}

/**
 * Updates a user's profile information.
 */
export async function updateProfileAction(
  userId: string,
  data: { name?: string; email?: string; image?: string },
): Promise<ActionResult<{ success: boolean }>> {
  try {
    const { error } = await supabase
      .from("users")
      .update(data)
      .eq("id", userId);

    if (error) throw error;

    return { ok: true, data: { success: true } };
  } catch (error) {
    console.error("Update Profile Error:", error);
    return {
      ok: false,
      error: { name: "ServerError", message: "Failed to update profile." },
    };
  }
}
