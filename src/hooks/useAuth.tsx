"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn, signOut } from "next-auth/react";
import { toast } from "sonner";
import { credentialsSignupAction } from "~/app/auth/actions";
import CustomToast from "~/app/_components/ui/CustomToast";
import type { CreateAccountValues } from "~/schema/auth.schema";

export const useAuth = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    try {
      await signIn("google", { redirectTo: "/" });
    } catch (error) {
      console.error("Google Sign In failed", error);
      toast.custom(() => (
        <CustomToast text="Google Sign-In failed." type="error" />
      ));
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleSignup = async (data: CreateAccountValues) => {
    setLoading(true);
    try {
      console.log("data", data);
      const response = await credentialsSignupAction(data);
      console.log("response", response);

      if (!response.ok) {
        const errorMessage =
          response.error.message || "An unknown error occurred.";
        toast.custom(() => <CustomToast text={errorMessage} type="error" />);
        return;
      }

      const signInResponse = await signIn("credentials", {
        email: response.data?.email,
        password: response.data?.password,
        redirect: false,
      });

      if (signInResponse?.error) {
        toast.custom(() => (
          <CustomToast
            text="Signup successful, but login failed. Please log in manually."
            type="error"
          />
        ));
        return;
      }

      toast.custom(() => (
        <CustomToast text="Account created successfully!" type="success" />
      ));
      router.push("/");
      router.refresh();
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
      const response = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (response?.error) {
        toast.custom(() => (
          <CustomToast text="Invalid email or password." type="error" />
        ));
        return;
      }

      toast.custom(() => (
        <CustomToast text="Login successful!" type="success" />
      ));
      router.push("/");
      router.refresh();
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
      await signOut({ redirect: false });
      toast.custom(() => (
        <CustomToast text="Signed out successfully." type="success" />
      ));
      router.push("/");
      router.refresh();
    } catch (error) {
      console.error("Signout failed", error);
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
