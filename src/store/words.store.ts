/*
This store should be responsible for displaying the current word, and playing it's corresponding audio.
wordsSettings is the single source of truth for selectedLevels.
*/

import { create } from "zustand";
import a1Data from "public/audio_files/en-us/index/A1_en_us_index.json";
import type { WordEntryInterface } from "~/types/types";
import { useWordsSettingsStore } from "./wordsSettings.store";

type WordsState = {
  loadedWords: Record<string, WordEntryInterface[]>;
  words: string[];
  currentWord: string | undefined;
  currentWordLevel: string | undefined;
  answeredWords: number[];
  currentAudio: string | undefined;
  isPlaying: boolean;
  answer: string;
  inFlightLoads: Set<string>;

  setAnswer: (answer: string) => void;
  setSelectedLevels: (levels: string[]) => Promise<void>;
  addLevel: (level: string) => Promise<void>;
  removeLevel: (level: string) => void;
  loadLevelsFromSettings: (levels: string[]) => Promise<void>;
  pickRandom: () =>
    | { word: string; index: number; id: string; file: string }
    | undefined;
  playAudio: () => void;
  stopAudio: () => void;
};

export const useWordsStore = create<WordsState>((set, get) => {
  let audio: HTMLAudioElement | null = null;

  return {
    loadedWords: {
      A1: a1Data.entries,
    },
    words: a1Data.entries.map((w) => w.word),
    currentWord: undefined,
    currentWordLevel: undefined,
    answeredWords: [],
    currentAudio: undefined,
    isPlaying: false,
    answer: "",
    inFlightLoads: new Set(),

    setAnswer: (answer) => {
      set({ answer });
    },

    setSelectedLevels: async (levels) => {
      useWordsSettingsStore.getState().setSelectedLevels(levels);
      await get().loadLevelsFromSettings(levels);
    },

    loadLevelsFromSettings: async (levels) => {
      const currentLoaded = get().loadedWords;
      const currentInFlight = get().inFlightLoads;

      const toLoad = levels.filter(
        (level) => !currentLoaded[level] && !currentInFlight.has(level),
      );

      if (toLoad.length === 0) {
        const updatedWords = levels.flatMap(
          (level) => currentLoaded[level]?.map((w) => w.word) ?? [],
        );
        set({ words: updatedWords });
        return;
      }

      set((state) => ({
        inFlightLoads: new Set([...state.inFlightLoads, ...toLoad]),
      }));

      try {
        const loadedPromises = toLoad.map(async (level) => {
          const importLevel = (await import(
            `public/audio_files/en-us/index/${level}_en_us_index.json`,
            { with: { type: "json" } }
          )) as {
            entries: WordEntryInterface[];
            index: Record<string, number>;
          };
          return { level, words: importLevel.entries };
        });

        const newlyLoaded = await Promise.all(loadedPromises);

        const latestState = get();
        const updatedLoaded = {
          ...latestState.loadedWords,
          ...Object.fromEntries(
            newlyLoaded.map(({ level, words }) => [level, words]),
          ),
        };

        const currentSelectedLevels =
          useWordsSettingsStore.getState().selectedLevels;
        const updatedWords = currentSelectedLevels.flatMap(
          (level) => updatedLoaded[level]?.map((w) => w.word) ?? [],
        );

        set((state) => ({
          loadedWords: updatedLoaded,
          words: updatedWords,
          inFlightLoads: new Set(
            [...state.inFlightLoads].filter((l) => !toLoad.includes(l)),
          ),
        }));
      } catch (error) {
        console.error("Failed to load levels:", error);
        set((state) => ({
          inFlightLoads: new Set(
            [...state.inFlightLoads].filter((l) => !toLoad.includes(l)),
          ),
        }));
      }
    },

    addLevel: async (level) => {
      const currentLevels = useWordsSettingsStore.getState().selectedLevels;
      if (!currentLevels.includes(level)) {
        const nextLevels = [...currentLevels, level];
        await get().setSelectedLevels(nextLevels);
      }
    },

    removeLevel: (level) => {
      const currentLevels = useWordsSettingsStore.getState().selectedLevels;
      const nextLevels = currentLevels.filter((l) => l !== level);

      useWordsSettingsStore.getState().setSelectedLevels(nextLevels);

      const nextWords = nextLevels.flatMap(
        (l) => get().loadedWords[l]?.map((w) => w.word) ?? [],
      );
      set({ words: nextWords });
    },

    pickRandom: () => {
      const selectedLevels = useWordsSettingsStore.getState().selectedLevels;
      const entries = selectedLevels.flatMap(
        (level) => get().loadedWords[level] ?? [],
      );

      if (!entries || entries.length === 0) return undefined;

      const randomEntry = entries[Math.floor(Math.random() * entries.length)];
      if (!randomEntry) return undefined;

      const result = {
        word: randomEntry.word,
        level: randomEntry.level,
        index: randomEntry.index,
        id: randomEntry.id,
        file: randomEntry.file,
      };

      set({
        currentWord: result.word,
        currentWordLevel: result.level,
        currentAudio: result.file,
        isPlaying: false,
      });

      return result;
    },

    playAudio: () => {
      const audioFile = get().currentAudio;
      if (audioFile) {
        if (audio) {
          audio.pause();
          audio = null;
        }
        audio = new Audio(audioFile);
        audio.play().catch((e) => console.error("Audio playback error:", e));
        set({ isPlaying: true });
        audio.onended = () => set({ isPlaying: false });
      }
    },

    stopAudio: () => {
      if (audio) {
        audio.pause();
        audio = null;
        set({ isPlaying: false });
      }
    },
  };
});

useWordsSettingsStore.subscribe((state) => {
  useWordsStore
    .getState()
    .loadLevelsFromSettings(state.selectedLevels)
    .catch(console.error);
});

const initializeStore = async () => {
  const initialLevels = useWordsSettingsStore.getState().selectedLevels;
  await useWordsStore.getState().loadLevelsFromSettings(initialLevels);
};

initializeStore().catch(console.error);
