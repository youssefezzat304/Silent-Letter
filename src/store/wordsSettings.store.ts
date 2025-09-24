/*
This store should be responsible for the words settings.
*/

import { create } from "zustand";
import type { WordLanguagesCodes } from "~/types/types";

export type SFXState = {
  correct: boolean;
  wrong: boolean;
};

export type SetSFXState = {
  soundEffect: keyof SFXState;
  value: boolean;
};

type WordsSettingsState = {
  selectedLevels: string[];
  delayTimer: number;
  wordslanguage: "en-us";
  soundEffects: SFXState;

  setSelectedLevels: (levels: string[]) => void;
  setDelayTimer: (timer: number) => void;
  setLanguage: (language: WordLanguagesCodes) => void;
  setSoundEffects: ({ soundEffect, value }: SetSFXState) => void;
};

export const useWordsSettingsStore = create<WordsSettingsState>((set) => ({
  selectedLevels: ["A1"],
  delayTimer: 2000,
  wordslanguage: "en-us",
  soundEffects: { correct: true, wrong: true },

  setSelectedLevels: (levels) => set({ selectedLevels: levels }),

  setDelayTimer: (timer) => {
    set({ delayTimer: timer });
  },
  setLanguage: (language) => {
    set({ wordslanguage: language });
  },
  setSoundEffects: ({ soundEffect, value }: SetSFXState) => {
    set((state) => ({
      soundEffects: { ...state.soundEffects, [soundEffect]: value },
    }));
  },
}));
