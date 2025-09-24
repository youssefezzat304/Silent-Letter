import React from "react";
import { Input } from "~/components/ui/input";

type Size = "small" | "medium";

interface SwitchProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size" | "value"> {
  size?: Size;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  value?: boolean;
  label?: string;
}

const SIZE_MAP: Record<
  Size,
  {
    track: string;
    thumb: string;
    translateClass: string;
  }
> = {
  small: {
    track: "h-6 w-12",
    thumb: "after:h-4 after:w-4",
    translateClass: "peer-checked:after:translate-x-5",
  },
  medium: {
    track: "h-10 w-20",
    thumb: "after:h-8 after:w-8",
    translateClass: "peer-checked:after:translate-x-10",
  },
};

export default function Switch({
  size = "small",
  className = "",
  label,
  id,
  value,
  onChange,
  ...inputProps
}: SwitchProps) {
  const sizeConfig = SIZE_MAP[size];

  const trackBase = [
    "rounded-full border-2 border-black bg-white shadow-[4px_4px_0px_#000] peer-checked:bg-green-500 peer-focus:outline-none",
    "after:absolute after:top-1 after:left-1 after:rounded-full after:border-2 after:border-black after:bg-white after:shadow-[2px_2px_0px_#000] after:transition-all after:content-['']",
    sizeConfig.track,
    sizeConfig.thumb,
    sizeConfig.translateClass,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <label
      htmlFor={id}
      className="relative inline-flex cursor-pointer items-center gap-2 select-none"
    >
      {label && <span className="text-sm">{label}</span>}

      <Input
        id={id}
        type="checkbox"
        className="peer sr-only"
        aria-checked={inputProps.checked}
        checked={value}
        onChange={onChange}
        {...inputProps}
      />

      <div className={trackBase} />
    </label>
  );
}
