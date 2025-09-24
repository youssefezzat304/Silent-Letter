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
import { useWordsSettingsStore } from "~/store/wordsSettings.store";
import type { WordLanguagesCodes } from "~/types/types";

export const LANGUAGE_OPTIONS: { value: WordLanguagesCodes; label: string }[] = [
  { value: "en-us", label: "English (US)" },
];

function LanguageSelection() {
  const wordslanguage = useWordsSettingsStore((s) => s.wordslanguage);
  const setWordslanguage = useWordsSettingsStore((s) => s.setLanguage);

  return (
    <Select
      value={wordslanguage ?? undefined}
      onValueChange={(val) => setWordslanguage(val as WordLanguagesCodes)}
    >
      <SelectTrigger
        className="cartoonish-selection self-center w-[180px] translate-y-0"
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
