"use client";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import type { WordLanguagesCodes } from "~/types/types";
import { LANGUAGE_OPTIONS } from "~/metadata";


function LanguageSelection({
  onChange,
}: {
  value: WordLanguagesCodes;
  onChange: (value: WordLanguagesCodes) => void;
}) {
  return (
    <Select onValueChange={onChange}>
      <SelectTrigger
        className="cartoonish-selection w-[180px] translate-y-0 self-center"
        aria-label="Language"
      >
        <SelectValue placeholder="language" />
      </SelectTrigger>

      <SelectContent className="cartoonish-l w-[180px]">
        <SelectGroup>
          <SelectLabel>Language</SelectLabel>
          {LANGUAGE_OPTIONS.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}

export default LanguageSelection;
