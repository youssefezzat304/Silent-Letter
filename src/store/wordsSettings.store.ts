// stores/wordsSettings.store.ts
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { WordLanguagesCodes } from "~/types/types";

export type SFXState = { correct: boolean; wrong: boolean };
export type SetSFXState = { soundEffect: keyof SFXState; value: boolean };

type WordsSettingsState = {
  selectedLevels: string[];
  delayTimer: number;
  language: WordLanguagesCodes;
  soundEffects: SFXState;

  setSelectedLevels: (levels: string[]) => void;
  setDelayTimer: (timer: number) => void;
  setLanguage: (language: WordLanguagesCodes) => void;
  setSoundEffects: ({ soundEffect, value }: SetSFXState) => void;
};

const STORAGE_KEY = "words-preferences";

const safeStorage = () =>
  typeof window !== "undefined"
    ? createJSONStorage(() => localStorage)
    : createJSONStorage(() => ({
        getItem: () => null,
        setItem: () => null,
        removeItem: () => null,
      }));

export const useWordsSettingsStore = create<WordsSettingsState>()(
  persist(
    (set) => ({
      selectedLevels: ["A1"],
      delayTimer: 2,
      language: "en-us",
      soundEffects: { correct: true, wrong: true },

      setSelectedLevels: (levels) => set({ selectedLevels: levels }),
      setDelayTimer: (timer) => set({ delayTimer: timer }),
      setLanguage: (language) => set({ language }),
      setSoundEffects: ({ soundEffect, value }: SetSFXState) =>
        set((state) => ({
          soundEffects: { ...state.soundEffects, [soundEffect]: value },
        })),
    }),
    {
      name: STORAGE_KEY,
      storage: safeStorage(),
      version: 1,
      migrate: (persistedState) => {
        return persistedState ?? undefined;
      },
    },
  ),
);
