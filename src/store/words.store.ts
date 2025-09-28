/*
This store should be responsible for displaying the current word, and playing it's corresponding audio.
wordsSettings is the single source of truth for selectedLevels.
Better architecture with language-keyed cache.
*/

import { create } from "zustand";
import a1Data from "public/audio_files/en-US/index/A1_en_us_index.json";
import type { WordEntryInterface, WordLanguagesCodes } from "~/types/types";
import { useWordsSettingsStore } from "./wordsSettings.store";

type LanguageCache = Record<string, WordEntryInterface[]>;
type WordsCache = Record<WordLanguagesCodes, LanguageCache>;

type WordsState = {
  wordsCache: WordsCache;
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
  loadLevelsFromSettings: (levels: string[]) => Promise<void>;
  getCurrentLanguageCache: () => LanguageCache;
  pickRandom: () =>
    | { word: string; index: number; id: string; file: string }
    | undefined;
  playAudio: () => void;
  stopAudio: () => void;
};

const LANGUAGE_CONFIG = {
  "en-us": {
    folder: "en-us",
    suffix: "_en_us_index.json",
    audioFolder: "en-us",
  },
  "de-de": {
    folder: "de-de",
    suffix: "_de_de_index.json",
    audioFolder: "de-de",
  },
} as const;

export const useWordsStore = create<WordsState>((set, get) => {
  let audio: HTMLAudioElement | null = null;

  return {
    wordsCache: {
      "en-us": {
        A1: a1Data.entries,
      },
      "de-de": {},
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

    getCurrentLanguageCache: () => {
      const currentLanguage = useWordsSettingsStore.getState().language;
      return get().wordsCache[currentLanguage] || {};
    },

    setSelectedLevels: async (levels) => {
      useWordsSettingsStore.getState().setSelectedLevels(levels);
      await get().loadLevelsFromSettings(levels);
    },

    loadLevelsFromSettings: async (levels) => {
      const currentLanguage = useWordsSettingsStore.getState().language;
      const languageCache = get().getCurrentLanguageCache();
      const currentInFlight = get().inFlightLoads;

      const toLoad = levels.filter(
        (level) => !languageCache[level] && !currentInFlight.has(level),
      );

      if (toLoad.length === 0) {
        const updatedWords = levels.flatMap(
          (level) => languageCache[level]?.map((w) => w.word) ?? [],
        );
        set({ words: updatedWords });
        return;
      }

      set((state) => ({
        inFlightLoads: new Set([...state.inFlightLoads, ...toLoad]),
      }));

      try {
        const loadedPromises = toLoad.map(async (level) => {
          const config = LANGUAGE_CONFIG[currentLanguage];
          if (!config) {
            throw new Error(`Unsupported language: ${currentLanguage}`);
          }

          const importLevel = (await import(
            `public/audio_files/${config.folder}/index/${level}${config.suffix}`,
            { with: { type: "json" } }
          )) as {
            entries: WordEntryInterface[];
            index: Record<string, number>;
          };

          const correctedEntries = importLevel.entries.map((entry) => {
            const filename = entry.file.split("/").pop() ?? "";
            const path = `/audio_files/${config.audioFolder}/${level}/${filename}`;

            return {
              ...entry,
              file: path,
            };
          });

          return { level, words: correctedEntries };
        });

        const newlyLoaded = await Promise.all(loadedPromises);

        set((state) => {
          const updatedCache = { ...state.wordsCache };
          if (!updatedCache[currentLanguage]) {
            updatedCache[currentLanguage] = {};
          }

          updatedCache[currentLanguage] = {
            ...updatedCache[currentLanguage],
            ...Object.fromEntries(
              newlyLoaded.map(({ level, words }) => [level, words]),
            ),
          };

          const updatedWords = levels.flatMap(
            (level) =>
              updatedCache[currentLanguage][level]?.map((w) => w.word) ?? [],
          );

          return {
            wordsCache: updatedCache,
            words: updatedWords,
            inFlightLoads: new Set(
              [...state.inFlightLoads].filter((l) => !toLoad.includes(l)),
            ),
          };
        });
      } catch (error) {
        console.error("Failed to load levels:", error);
        set((state) => ({
          inFlightLoads: new Set(
            [...state.inFlightLoads].filter((l) => !toLoad.includes(l)),
          ),
        }));
      }
    },

    pickRandom: () => {
      const selectedLevels = useWordsSettingsStore.getState().selectedLevels;
      const languageCache = get().getCurrentLanguageCache();

      const entries = selectedLevels.flatMap(
        (level) => languageCache[level] ?? [],
      );

      if (!entries || entries.length === 0) return undefined;

      let randomEntry = entries[Math.floor(Math.random() * entries.length)];

      if (!randomEntry) return (randomEntry = entries[0]);

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

useWordsSettingsStore.subscribe((state, prevState) => {
  const wordsStore = useWordsStore.getState();

  if (
    !prevState ||
    state.selectedLevels !== prevState.selectedLevels ||
    state.language !== prevState.language
  ) {
    wordsStore
      .loadLevelsFromSettings(state.selectedLevels)
      .then(() => {
        wordsStore.currentWord = wordsStore.pickRandom()?.word;
      })
      .catch(console.error);
  }
});

const initializeStore = async () => {
  const initialLevels = useWordsSettingsStore.getState().selectedLevels;
  await useWordsStore.getState().loadLevelsFromSettings(initialLevels);
};

initializeStore().catch(console.error);
