"use client";
import React from "react";
import { useWordsSettingsStore } from "~/store/wordsSettings.store";
import { useWordsStore } from "~/store/words.store";
import { LANGUAGE_OPTIONS } from "~/metadata";

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
    <>
      <p className="flex w-full items-center justify-center self-center py-1 text-sm text-stone-500">
        Please report any wrong spelling or pronunciation from&nbsp;
        <a
          className="text-blue-500 underline hover:text-blue-300"
          href="/support/report"
        >
          here.
        </a>
      </p>
      <div className="md:text-md flex items-center justify-between gap-1.5 border-t border-stone-300 bg-stone-50 p-2 text-sm md:justify-center md:gap-8 dark:border-stone-700 dark:bg-zinc-900">
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
          v.0.0.0 (beta)
        </div>
      </div>
    </>
  );
}

export default InfoDisplayBar;
