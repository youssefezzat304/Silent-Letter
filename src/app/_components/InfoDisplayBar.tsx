"use client";
import React from "react";
import { useWordsSettingsStore } from "~/store/wordsSettings.store";
import { LANGUAGE_OPTIONS } from "./LanguageSelection";
import { useWordsStore } from "~/store/words.store";

function Levels({
  levels,
  selectedLevels,
}: {
  levels: string[];
  selectedLevels: string[];
}) {
  return (
    <div title="Levels" aria-label="Levels" className="flex gap-2">
      {levels.map((level) => {
        let color;
        let off = true;

        if (selectedLevels.includes(level)) {
          off = false;
        }

        if (level.startsWith("A")) {
          color = "bg-yellow-500";
        } else if (level.startsWith("B")) {
          color = "bg-blue-500";
        } else if (level.startsWith("C")) {
          color = "bg-green-500";
        }
        return (
          <div
            title={level}
            key={level}
            aria-label={level}
            className={`h-3 w-3 rounded-full ${off ? "bg-stone-300" : color} `}
          ></div>
        );
      })}
    </div>
  );
}

function InfoDisplayBar() {
  const levels = ["A1", "A2", "B1", "B2", "C1", "C2"];
  const language = useWordsSettingsStore((s) => s.language);
  const selectedLevels = useWordsSettingsStore((s) => s.selectedLevels);
  const currentWordLevel = useWordsStore((s) => s.currentWordLevel);
  const delayTimer = useWordsSettingsStore((s) => s.delayTimer);

  return (
    <div className="flex items-center justify-center gap-8 border-t border-stone-300 bg-stone-50 p-2 dark:bg-zinc-800 dark:border-stone-700">
      <div className="text-stone-500" title="Language" aria-label="Language">
        {LANGUAGE_OPTIONS.find((l) => l.value === language)?.label}
      </div>
      <Levels levels={levels} selectedLevels={selectedLevels} />

      <div title="Delay timer" className="text-stone-500">
        {delayTimer} sec
      </div>

      <div title="Current word level" className="text-stone-500">
        {currentWordLevel}
      </div>

      <div title="version" className="self-end text-stone-500">
        v.0.0.1 (beta)
      </div>
    </div>
  );
}

export default InfoDisplayBar;
