"use client";

import { Button } from "~/components/ui/button";
import { Card, CardContent, CardFooter } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "~/components/ui/tabs";
import { FcGoogle } from "react-icons/fc";
import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { Form, FormField, FormItem } from "~/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  createAccountSchema,
  loginSchema,
  type CreateAccountValues,
  type LoginValues,
} from "~/schema/auth.schema";
import Loading from "../loading";
import InputError from "../_components/ui/InputError";
import { useAuth } from "~/hooks/useAuth";
import { createClient } from "~/lib/supabase/client";
import { toast } from "sonner";
import CustomToast from "../_components/ui/CustomToast";
import { login } from "../api/actions/auth";

function AuthPage() {
  const [isPending, startTransition] = useTransition();
  const supabase = createClient();
  const router = useRouter();
  const { handleGoogleSignIn, handleSignup, googleLoading, handleLogin } =
    useAuth();

  const [isCheckingSession, setIsCheckingSession] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        router.replace("/");
      } else {
        setIsCheckingSession(false);
      }
    };
    void checkSession();
  }, [router, supabase.auth]);

  const signupForm = useForm<CreateAccountValues>({
    resolver: zodResolver(createAccountSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const loginForm = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const handleLoginSubmit = (values: LoginValues) => {
    startTransition(async () => {
      await handleLogin(values);
    });
  };

  const handleSignupSubmit = (values: CreateAccountValues) => {
    startTransition(async () => {
      await handleSignup(values);
    });
  };

  if (isCheckingSession) {
    return <Loading />;
  }

  return (
    <div className="absolute top-[15%] flex w-full items-center justify-center">
      <div className="max-w-sm flex-col gap-6 self-center">
        <Tabs defaultValue="Login">
          <TabsList className="cartoonish-card self-center md:w-lg">
            <TabsTrigger
              className="text-md cursor-pointer uppercase"
              value="Login"
            >
              login
            </TabsTrigger>
            <TabsTrigger
              className="text-md cursor-pointer uppercase"
              value="Signup"
            >
              signup
            </TabsTrigger>
          </TabsList>
          {/* ################## Login ##################### */}
          <TabsContent
            className="cartoonish-card self-center md:w-2xl"
            value="Login"
          >
            <Card>
              <Form {...loginForm}>
                <form onSubmit={loginForm.handleSubmit(handleLoginSubmit)}>
                  <CardContent className="grid gap-2">
                    <FormField
                      {...loginForm}
                      name="email"
                      control={loginForm.control}
                      render={({ field }) => (
                        <FormItem className="grid gap-3">
                          <Label htmlFor="email">Email</Label>
                          <Input
                            id="email"
                            placeholder="example@example.com"
                            {...field}
                          />
                          <InputError form={loginForm} name="email" />
                        </FormItem>
                      )}
                    />
                    <FormField
                      {...loginForm}
                      name="password"
                      control={loginForm.control}
                      render={({ field }) => (
                        <FormItem className="grid gap-3">
                          <Label htmlFor="password">Password</Label>
                          <Input
                            id="password"
                            placeholder="0123456789"
                            type="password"
                            {...field}
                          />
                          <InputError form={loginForm} name="password" />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                  <CardFooter className="mt-2 flex flex-col gap-2">
                    <Button
                      type="submit"
                      disabled={isPending}
                      className="cartoonish-btn w-full"
                    >
                      {isPending ? "Logging in..." : "Login"}
                    </Button>
                    <Button
                      className="cartoonish-btn w-full bg-white from-green-200 to-blue-200 text-black"
                      onClick={handleGoogleSignIn}
                      disabled={isPending || googleLoading}
                      type="button"
                    >
                      <FcGoogle />
                      {googleLoading
                        ? "Redirecting..."
                        : "Continue with Google"}
                    </Button>
                  </CardFooter>
                </form>
              </Form>
            </Card>
          </TabsContent>

          {/* ################## Signup ##################### */}
          <TabsContent
            className="cartoonish-card self-center md:w-2xl"
            value="Signup"
          >
            <Card>
              <Form {...signupForm}>
                <form onSubmit={signupForm.handleSubmit(handleSignupSubmit)}>
                  <CardContent className="grid gap-2">
                    <FormField
                      control={signupForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem className="grid gap-3">
                          <Label htmlFor="display-name">Display name</Label>
                          <Input
                            id="display-name"
                            placeholder="John Doe"
                            {...field}
                          />
                          <InputError form={signupForm} name="name" />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={signupForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem className="grid gap-3">
                          <Label htmlFor="email">Email</Label>
                          <Input
                            id="email"
                            type="email"
                            placeholder="john.doe@example.com"
                            {...field}
                          />
                          <InputError form={signupForm} name="email" />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={signupForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem className="grid gap-3">
                          <Label htmlFor="password">Password</Label>
                          <Input
                            id="password"
                            type="password"
                            placeholder="0123456789"
                            {...field}
                          />
                          <InputError form={signupForm} name="password" />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={signupForm.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem className="grid gap-3">
                          <Label htmlFor="confirmPassword">
                            Confirm password
                          </Label>
                          <Input
                            id="confirmPassword"
                            type="password"
                            placeholder="0123456789"
                            {...field}
                          />
                          <InputError
                            form={signupForm}
                            name="confirmPassword"
                          />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                  <CardFooter>
                    <Button
                      type="submit"
                      className="cartoonish-btn mt-2 w-full"
                      disabled={isPending}
                    >
                      {isPending ? "Creating Account..." : "Create Account"}
                    </Button>
                  </CardFooter>
                </form>
              </Form>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export default AuthPage;
