"use server";

import { signIn, signOut } from "~/server/auth";
import { redirect } from "next/navigation";

export async function googleSignInAction() {
  await signIn("google", { redirectTo: "/" });
}

export async function credentialsSignInAction(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: "/",
    });
  } catch {
    redirect("/auth?error=CredentialsSignin");
  }
}

export async function signOutAction() {
  await signOut({ redirectTo: "/auth" });
}
