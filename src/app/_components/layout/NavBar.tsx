import {
  Menubar,
  MenubarCheckboxItem,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarRadioGroup,
  MenubarRadioItem,
  MenubarSeparator,
  MenubarShortcut,
  MenubarSub,
  MenubarSubContent,
  MenubarSubTrigger,
  MenubarTrigger,
} from "~/components/ui/menubar";

export function NavBar() {
  return (
    <Menubar className="cartoonish-menubar absolute right-2 m-2 m-w-44">
      <MenubarMenu>
        <MenubarTrigger>About</MenubarTrigger>
      </MenubarMenu>
      <MenubarMenu>
        <MenubarTrigger>SignUp</MenubarTrigger>
      </MenubarMenu>
      <MenubarMenu>
        <MenubarTrigger>Login</MenubarTrigger>
      </MenubarMenu>
    </Menubar>
  );
}
