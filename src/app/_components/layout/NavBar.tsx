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
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { MdLogout } from "react-icons/md";
import { useAuth } from "~/hooks/useAuth";

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
      <AvatarImage src={imageSrc} />
      <AvatarFallback className={fallbackClassName}>{fallback}</AvatarFallback>
    </Avatar>
  );
};

export function NavBar() {
  const { data: session, status } = useSession();
  const handleSignOut = useAuth().handleSignOut;

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
      <MenubarMenu key={status || session}>
        {status === "loading" ? (
          <div>Loading...</div>
        ) : status === "authenticated" ? (
          <MenubarMenu>
            <MenubarTrigger className="cursor-pointer font-bold uppercase">
              <Profile
                imageSrc={session?.user?.image?.toString() ?? ""}
                fallback={session.user.name![0] ?? "C"}
              />

              <MenubarContent
                className="cartoonish-l gap-1 px-2 py-2"
                align="end"
              >
                <Link href="/profile">
                  <MenubarItem className="cursor-pointer">Profile</MenubarItem>
                  <MenubarSeparator />
                </Link>
                <MenubarItem
                  onClick={handleSignOut}
                  className="cursor-pointer justify-between text-red-500"
                >
                  Logout <MdLogout className="text-red-500" />
                </MenubarItem>
              </MenubarContent>
            </MenubarTrigger>
          </MenubarMenu>
        ) : (
          <LoginSignup />
        )}
      </MenubarMenu>
    </Menubar>
  );
}
