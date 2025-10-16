"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createClient } from "~/lib/supabase/client";
import CustomToast from "~/app/_components/ui/CustomToast";
import type { CreateAccountValues } from "~/schema/auth.schema";
import { signUp } from "~/app/api/actions/auth";
import { signIn } from "~/app/api/actions/auth";

export const useAuth = () => {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const login = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    return error;
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: "/",
        },
      });

      if (error) throw error;
    } catch (error) {
      console.error("Google Sign In failed", error);
      toast.custom(() => (
        <CustomToast text="Google Sign-In failed." type="error" />
      ));
      setGoogleLoading(false);
    }
  };

  const handleSignup = async (data: CreateAccountValues) => {
    setLoading(true);
    const { name, email, password, confirmPassword } = data;

    if (password !== confirmPassword) {
      toast.custom(() => (
        <CustomToast text="Passwords do not match." type="error" />
      ));
      return;
    }

    try {
      const { authError } = await signUp(email, password, name);

      if (authError) {
        toast.custom(() => (
          <CustomToast text={authError.message} type="error" />
        ));
        return;
      }

      const loginError = await login(email, password);

      if (loginError) {
        toast.custom(() => (
          <CustomToast text={loginError.message} type="error" />
        ));
        return;
      }

      toast.custom(() => (
        <CustomToast text="Account created successfully!" type="success" />
      ));

      router.replace("/");
    } catch (error) {
      console.error("Signup failed", error);
      toast.custom(() => (
        <CustomToast
          text="An unexpected error occurred during signup."
          type="error"
        />
      ));
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (data: { email: string; password: string }) => {
    setLoading(true);
    try {
      const signInError = await signIn(data.email, data.password);

      const loginError = await login(data.email, data.password);

      if (signInError || loginError) {
        const error = signInError ?? loginError;
        toast.custom(() => <CustomToast text={error!.message} type="error" />);
        return;
      }

      toast.custom(() => (
        <CustomToast text="Login successful!" type="success" />
      ));

      router.push("/");
    } catch (error) {
      console.error("Login failed", error);
      toast.custom(() => (
        <CustomToast
          text="An unexpected error occurred during login."
          type="error"
        />
      ));
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signOut();

      if (error) {
        toast.custom(() => <CustomToast text={error.message} type="error" />);
        return;
      }

      toast.custom(() => (
        <CustomToast text="Signed out successfully." type="success" />
      ));
    } catch {
      toast.custom(() => <CustomToast text="Signout failed." type="error" />);
    } finally {
      setLoading(false);
    }
  };

  return {
    handleGoogleSignIn,
    handleSignup,
    handleLogin,
    handleSignOut,
    loading,
    googleLoading,
  };
};
