"use client";
import React from "react";

import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "~/components/ui/drawer";

import CERFLevels from "./CERFLevels";
import LanguageSelection from "./LanguageSelection";
import { Input } from "~/components/ui/input";
import {
  useWordsSettingsStore,
  type SetSFXState,
  type SFXState,
} from "~/store/wordsSettings.store";
import { useWordsStore } from "~/store/words.store";
import Info from "./Info";
import Switch from "./Switch";

const DelayTimerInput = ({
  delayTimer,
  handleDelayTimerChange,
}: {
  delayTimer: number;
  handleDelayTimerChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) => {
  return (
    <div className="flex items-center justify-center gap-3">
      <span className="text-2xl font-bold text-nowrap">Delay timer :</span>

      <Input
        defaultValue={delayTimer / 1000}
        className="cartoonish-selection no-spin w-15 translate-y-0"
        type="number"
        onChange={handleDelayTimerChange}
        min={0}
        max={10}
      />
      <div className="flex items-center gap-2 self-end">
        <span className="text-xl text-nowrap text-stone-500">sec</span>
        <Info
          side="right"
          message="After skipping, there will be a timer for up to 10 seconds."
        />
      </div>
    </div>
  );
};

const SFX = ({
  soundEffects,
  setSoundEffects,
}: {
  soundEffects: SFXState;
  setSoundEffects: ({ soundEffect, value }: SetSFXState) => void;
}) => {
  return (
    <div className="flex flex-col">
      <span className="self-start text-2xl font-bold">SFX:</span>
      <div className="grid grid-cols-2 gap-3">
        <div className="flex items-center gap-2">
          <span className="font-bold">Correct answer: </span>
          <Switch
            value={soundEffects.correct}
            onChange={(e) =>
              setSoundEffects({
                soundEffect: "correct",
                value: e.target.checked,
              })
            }
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="font-bold">Wrong answer: </span>
          <Switch
            value={soundEffects.wrong}
            onChange={(e) =>
              setSoundEffects({ soundEffect: "wrong", value: e.target.checked })
            }
          />
        </div>
      </div>
    </div>
  );
};

function WordsSettings() {
  const delayTimer = useWordsSettingsStore((s) => s.delayTimer);
  const selectedLevels = useWordsSettingsStore((s) => s.selectedLevels);
  const setSelectedLevels = useWordsStore((s) => s.setSelectedLevels);
  const soundEffects = useWordsSettingsStore((s) => s.soundEffects);
  const setSoundEffects = useWordsSettingsStore((s) => s.setSoundEffects);

  const handleDelayTimerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value);
    if (value > 10 || value < 0) {
      return;
    }

    if (value) {
      const timer = value * 1000;
      useWordsSettingsStore.setState({ delayTimer: timer });
    }
  };

  return (
    <Drawer>
      <DrawerTrigger className="cartoonish-btn from-red-500 to-gray-700 text-white">
        settings
      </DrawerTrigger>

      <DrawerContent className="items-center">
        <DrawerHeader>
          <DrawerTitle className="mb-4 text-2xl font-bold">
            Settings
          </DrawerTitle>
          <div className="flex flex-col items-start gap-5">
            <LanguageSelection />

            <div className="flex flex-col items-center justify-center gap-2 md:flex-row">
              <span className="text-2xl font-bold text-nowrap md:mr-3">
                Levels :
              </span>
              <CERFLevels
                selectedLevels={selectedLevels}
                onChange={setSelectedLevels}
              />
            </div>

            <DelayTimerInput
              delayTimer={delayTimer}
              handleDelayTimerChange={handleDelayTimerChange}
            />
            <SFX
              soundEffects={soundEffects}
              setSoundEffects={setSoundEffects}
            />
          </div>
        </DrawerHeader>
        <DrawerFooter>
          <DrawerClose className="cartoonish-btn w-40 self-center from-red-500 to-gray-700 text-white">
            close
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}

export default WordsSettings;
