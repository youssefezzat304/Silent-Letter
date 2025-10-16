"use client";

import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarTrigger,
} from "~/components/ui/menubar";
import { DarkModeToggle } from "../DarkModeToggle";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { MdLogout } from "react-icons/md";
import { useAuth } from "~/hooks/useAuth";
import { useEffect, useState } from "react";
import { getProfile } from "~/app/api/actions/profile";
import type { Profile as ProfileType } from "@prisma/client";
import { useGetUser } from "~/hooks/useGetUser";

const LoginSignup = () => {
  return (
    <div className="cursor-pointer font-bold uppercase">
      <Link href="/auth">
        <div className="transform rounded-md bg-zinc-950 px-3 py-1.5 text-sm text-white transition-all active:scale-95 dark:bg-zinc-300 dark:text-black">
          Login
        </div>
      </Link>
    </div>
  );
};

export const Profile = ({
  imageSrc,
  fallback,
  className,
  fallbackClassName,
}: {
  imageSrc: string;
  fallback: string;
  className?: string;
  fallbackClassName?: string;
}) => {
  return (
    <Avatar className={`cartoonish justify-center ${className}`}>
      <AvatarImage src={imageSrc} className="object-cover" />
      <AvatarFallback className={fallbackClassName}>{fallback}</AvatarFallback>
    </Avatar>
  );
};

export function NavBar() {
  const { user, setUser, supabase } = useGetUser();
  const { handleSignOut } = useAuth();

  const [profileInfo, setProfileInfo] = useState<ProfileType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getUser = async () => {
      try {
        const data = await getProfile();
        setProfileInfo(data);
      } catch (error) {
        console.error("Failed to get user:", error);
      } finally {
        setLoading(false);
      }
    };

    void getUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase, setUser]);

  return (
    <Menubar className="cartoonish-menubar m-2 h-12 max-w-fit min-w-fit gap-3 md:gap-5 dark:bg-zinc-800">
      <MenubarMenu>
        <DarkModeToggle />
      </MenubarMenu>
      <MenubarMenu>
        <MenubarTrigger className="cursor-pointer font-bold uppercase">
          <Link href="/">Home</Link>
        </MenubarTrigger>
      </MenubarMenu>
      <MenubarMenu>
        <MenubarTrigger className="cursor-pointer font-bold uppercase">
          Support
        </MenubarTrigger>
        <MenubarContent className="cartoonish-l gap-1 px-2 py-2">
          <Link href="/support/contribute">
            <MenubarItem className="cursor-pointer">Contribute</MenubarItem>
          </Link>
          <MenubarSeparator />
          <Link href="/support/feedback">
            <MenubarItem className="cursor-pointer">Feedback</MenubarItem>
          </Link>
          <MenubarSeparator />
          <Link href="/support/report">
            <MenubarItem className="cursor-pointer">Report</MenubarItem>
          </Link>
        </MenubarContent>
      </MenubarMenu>
      <MenubarMenu>
        <MenubarTrigger className="cursor-pointer font-bold uppercase">
          About
        </MenubarTrigger>
      </MenubarMenu>
      <MenubarMenu>
        {loading ? (
          <div>Loading...</div>
        ) : user ? (
          <MenubarMenu>
            <MenubarTrigger className="cursor-pointer font-bold uppercase">
              <Profile
                imageSrc={profileInfo?.image ?? ""}
                fallback={profileInfo?.name?.[0] ?? "C"}
              />
            </MenubarTrigger>
            <MenubarContent
              className="cartoonish-l gap-1 px-2 py-2"
              align="end"
            >
              <Link href="/profile">
                <MenubarItem className="cursor-pointer">Profile</MenubarItem>
              </Link>
              <MenubarSeparator />
              <MenubarItem
                onClick={handleSignOut}
                className="cursor-pointer justify-between text-red-500"
              >
                Logout <MdLogout className="text-red-500" />
              </MenubarItem>
            </MenubarContent>
          </MenubarMenu>
        ) : (
          <LoginSignup />
        )}
      </MenubarMenu>
    </Menubar>
  );
}
