import { AiOutlineInfoCircle } from "react-icons/ai";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";

function Info({
  message,
  side,
}: {
  message: string;
  side?: "top" | "bottom" | "left" | "right";
}) {
  return (
    <Popover>
      <PopoverTrigger className="cursor-pointer">
        <AiOutlineInfoCircle className="h-6 w-6 font-bold text-stone-500" />
      </PopoverTrigger>
      <PopoverContent className="cartoonish-menubar" side={side}>{message}</PopoverContent>
    </Popover>
  );
}

export default Info;
