"use client";

import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { FcGoogle } from "react-icons/fc";
import { useEffect, useState } from "react";
import { googleSignInAction } from "./actions";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

function AuthPage() {
  const { status } = useSession();
  const router = useRouter();

  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    try {
      await googleSignInAction();
    } catch (error) {
      console.error("Google sign-in error:", error);
    } finally {
      setIsGoogleLoading(false);
    }
  };

  useEffect(() => {
    if (status === "authenticated") {
      router.replace("/");
    }
  }, [status, router]);

  if (status === "loading") {
    return <div>Loading...</div>;
  }

  if (status === "authenticated") return null;

  return (
    <div className="flex h-screen w-full items-center justify-center">
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

          <TabsContent
            className="cartoonish-card self-center md:w-2xl"
            value="Login"
          >
            <Card>
              <CardHeader></CardHeader>
              <CardContent className="grid gap-6">
                <div className="grid gap-3">
                  <Label htmlFor="tabs-demo-name">Email</Label>
                  <Input
                    id="tabs-demo-name"
                    placeholder="example@example.com"
                  />
                </div>
                <div className="grid gap-3">
                  <Label htmlFor="tabs-demo-username">Password</Label>
                  <Input id="tabs-demo-username" placeholder="0123456789" />
                </div>
              </CardContent>
              <CardFooter className="flex flex-col gap-2">
                <Button className="cartoonish-btn w-full">Login</Button>
                <Button
                  className="cartoonish-btn w-full bg-white from-green-200 to-blue-200 text-black"
                  onClick={handleGoogleSignIn}
                  disabled={isGoogleLoading}
                >
                  <FcGoogle />
                  {isGoogleLoading ? "Signing in..." : "Continue with Google"}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent
            className="cartoonish-card self-center md:w-2xl"
            value="Signup"
          >
            <Card>
              <CardHeader>
                <CardTitle>Password</CardTitle>
                <CardDescription>
                  Change your password here. After saving, you&apos;ll be logged
                  out.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-6">
                <div className="grid gap-3">
                  <Label htmlFor="tabs-demo-current">Current password</Label>
                  <Input id="tabs-demo-current" type="password" />
                </div>
                <div className="grid gap-3">
                  <Label htmlFor="tabs-demo-new">New password</Label>
                  <Input id="tabs-demo-new" type="password" />
                </div>
              </CardContent>
              <CardFooter>
                <Button>Save password</Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export default AuthPage;
