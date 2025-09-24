/*
This store should be responsible for displaying the current word, and playing it's crossponding audio.
*/

import { create } from "zustand";
import a1Data from "public/audio_files/en-us/index/A1_en_us_index.json";
import type { WordEntryInterface } from "~/types/types";
import { useWordsSettingsStore } from "./wordsSettings.store";

type WordsState = {
  selectedLevels: string[];
  loadedWords: Record<string, WordEntryInterface[]>;
  words: string[];
  currentWord: string | undefined;
  currentWordLevel: string | undefined;
  answeredWords: number[];
  currentAudio: string | undefined;
  isPlaying: boolean;
  answer: string;
  setAnswer: (answer: string) => void;
  setSelectedLevels: (levels: string[]) => Promise<void>;
  addLevel: (level: string) => Promise<void>;
  removeLevel: (level: string) => void;
  pickRandom: () =>
    | { word: string; index: number; id: string; file: string }
    | undefined;
  playAudio: () => void;
  stopAudio: () => void;
};

export const useWordsStore = create<WordsState>((set, get) => {
  let audio: HTMLAudioElement | null = null;

  return {
    selectedLevels: ["A1"],
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

    setAnswer: (answer) => {
      set({ answer });
    },

    setSelectedLevels: async (levels) => {
      const currentLoaded = get().loadedWords;
      const toLoad = levels.filter((level) => !currentLoaded[level]);

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
      const updatedLoaded = {
        ...currentLoaded,
        ...Object.fromEntries(
          newlyLoaded.map(({ level, words }) => [level, words]),
        ),
      };

      const updatedWords = levels.flatMap(
        (level) => updatedLoaded[level]?.map((w) => w.word) ?? [],
      );

      set({
        selectedLevels: levels,
        loadedWords: updatedLoaded,
        words: updatedWords,
      });
    },

    addLevel: async (level) => {
      const currentLevels = get().selectedLevels;
      if (!currentLevels.includes(level)) {
        const nextLevels = [...currentLevels, level];
        await get().setSelectedLevels(nextLevels);
      }
    },

    removeLevel: (level) => {
      const currentLevels = get().selectedLevels;
      const nextLevels = currentLevels.filter((l) => l !== level);
      const nextWords = nextLevels.flatMap(
        (l) => get().loadedWords[l]?.map((w) => w.word) ?? [],
      );
      set({
        selectedLevels: nextLevels,
        words: nextWords,
      });
    },

    pickRandom: () => {
      const entries = get().selectedLevels.flatMap(
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
  useWordsStore.getState().setSelectedLevels(state.selectedLevels).catch(console.error);
});
