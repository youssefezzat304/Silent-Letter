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

const LoginSignup = () => {
  return (
    <MenubarTrigger className="cursor-pointer font-bold uppercase">
      <Link href="/auth">Login</Link>
    </MenubarTrigger>
  );
};

const Profile = ({ imageSrc }: { imageSrc: string }) => {
  return (
    <Avatar className="cartoonish">
      <Link href="/profile">
        <AvatarImage src={imageSrc} />
        <AvatarFallback>CN</AvatarFallback>
      </Link>
    </Avatar>
  );
};

export function NavBar() {
  const { data: session, status } = useSession();

  return (
    <Menubar className="cartoonish-menubar m-w-44 absolute right-2 m-2 h-12 gap-5 dark:bg-zinc-800">
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
          <MenubarItem className="cursor-pointer">Contribute</MenubarItem>
          <MenubarSeparator />
          <MenubarItem className="cursor-pointer">Feedback</MenubarItem>
          <MenubarSeparator />
          <MenubarItem className="cursor-pointer">Report</MenubarItem>
        </MenubarContent>
      </MenubarMenu>
      <MenubarMenu>
        <MenubarTrigger className="cursor-pointer font-bold uppercase">
          About
        </MenubarTrigger>
      </MenubarMenu>
      <MenubarMenu>
        {status === "loading" ? (
          <div>Loading...</div>
        ) : status === "authenticated" ? (
          <Profile imageSrc={session?.user?.image?.toString() ?? ""} />
        ) : (
          <LoginSignup />
        )}
      </MenubarMenu>
    </Menubar>
  );
}
