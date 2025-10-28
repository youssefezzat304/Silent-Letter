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
import CustomToast from "../_components/ui/CustomToast";
import { toast } from "sonner";
import Link from "next/link";

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
    toast.custom(() => (
      <CustomToast text="This feature is coming soon!" type="info" />
    ));
  };

  const handleSignupSubmit = (values: CreateAccountValues) => {
    toast.custom(() => (
      <CustomToast text="This feature is coming soon!" type="info" />
    ));
  };

  if (isCheckingSession) {
    return <Loading />;
  }

  return (
    <div className="absolute top-[15%] flex w-full items-center justify-center">
      <div className="relative max-w-sm flex-col gap-6 self-center">
        <div className="fixed inset-0 z-10 flex flex-col gap-4 w-screen items-center justify-center rounded-lg bg-white/70 backdrop-blur-[1px] dark:bg-black/70">
          <span className="text-3xl font-bold text-gray-800 dark:text-gray-200">
            Coming Soon!
          </span>
          
            <Link href="/"><Button className="cursor-pointer font-bold">Home</Button></Link>
          
        </div>

        <Tabs defaultValue="Login">
          <TabsList className="cartoonish-card self-center md:w-lg">
            <TabsTrigger
              className="text-md cursor-pointer uppercase"
              value="Login"
              disabled={true}
            >
              login
            </TabsTrigger>
            <TabsTrigger
              className="text-md cursor-pointer uppercase"
              value="Signup"
              disabled={true}
            >
              signup
            </TabsTrigger>
          </TabsList>

          <TabsContent
            className="cartoonish-card self-center md:w-2xl"
            value="Login"
          >
            <Card>
              <Form {...loginForm}>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleLoginSubmit(loginForm.getValues());
                  }}
                >
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
                            disabled={true}
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
                            disabled={true}
                          />
                          <InputError form={loginForm} name="password" />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                  <CardFooter className="mt-2 flex flex-col gap-2">
                    <Button
                      type="submit"
                      disabled={true}
                      className="cartoonish-btn w-full"
                    >
                      {isPending ? "Logging in..." : "Login"}
                    </Button>
                    <Button
                      className="cartoonish-btn w-full bg-white from-green-200 to-blue-200 text-black"
                      onClick={handleGoogleSignIn}
                      disabled={true}
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

          <TabsContent
            className="cartoonish-card self-center md:w-2xl"
            value="Signup"
          >
            <Card>
              <Form {...signupForm}>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSignupSubmit(signupForm.getValues());
                  }}
                >
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
                            disabled={true}
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
                            disabled={true}
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
                            disabled={true}
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
                            disabled={true}
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
                      disabled={true}
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
