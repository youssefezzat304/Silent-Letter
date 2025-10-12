"use client";

import { Button } from "~/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "~/components/ui/sheet";
import { useWordsSettingsStore } from "~/store/wordsSettings.store";
import Switch from "./Switch";
import LanguageSelection from "./LanguageSelection";
import CERFLevels from "./CERFLevels";

import z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem } from "~/components/ui/form";
import { useState } from "react";
import DelayTimerInput from "./ui/DelayTimerInput";

const preferenceSchema = z
  .object({
    language: z.literal("en-us").or(z.literal("de-de")),
    levels: z.array(z.string()),
    delayTimer: z.number().min(2).max(10),
    soundEffects: z.object({
      correct: z.boolean(),
      wrong: z.boolean(),
    }),
  })
  .required();

type PreferenceValues = z.infer<typeof preferenceSchema>;

function WordsPreference() {
  const {
    language,
    selectedLevels,
    delayTimer,
    soundEffects,
    setLanguage,
    setSelectedLevels,
    setDelayTimer,
    setSoundEffects,
  } = useWordsSettingsStore();

  const [open, setOpen] = useState(false);
  const [resetSignal, setResetSignal] = useState(0);

  const form = useForm<PreferenceValues>({
    resolver: zodResolver(preferenceSchema),
    defaultValues: {
      language: language,
      levels: selectedLevels,
      delayTimer: delayTimer,
      soundEffects: soundEffects,
    },
  });

  const resetFormToStore = () => {
    form.reset({
      language,
      levels: selectedLevels,
      delayTimer,
      soundEffects,
    });
  };

  const onSubmit = (data: PreferenceValues) => {
    if (data.language !== language) {
      setLanguage(data.language);
    }
    if (selectedLevels !== data.levels) {
      setSelectedLevels(data.levels);
    }

    setDelayTimer(data.delayTimer);

    setSoundEffects({
      soundEffect: "correct",
      value: data.soundEffects.correct,
    });
    setSoundEffects({
      soundEffect: "wrong",
      value: data.soundEffects.wrong,
    });

    setOpen(false);
  };

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      resetFormToStore();
      setResetSignal((s) => s + 1);
    }
  };

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetTrigger asChild>
        <Button className="cartoonish-btn from-red-500 to-gray-700 text-white dark:text-black">
          Settings
        </Button>
      </SheetTrigger>
      <SheetContent className="cartoonish-menubar w-[400px] sm:w-[540px]">
        <SheetHeader>
          <SheetTitle>Settings</SheetTitle>
          <SheetDescription>The words settings.</SheetDescription>
        </SheetHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col gap-4"
          >
            <FormField
              control={form.control}
              name="language"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <LanguageSelection
                      key={resetSignal}
                      value={language}
                      onChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="levels"
              render={({ field }) => (
                <FormItem className="flex items-center justify-start gap-4">
                  <label className="self-start text-lg font-bold text-nowrap">
                    Levels :
                  </label>
                  <FormControl>
                    <CERFLevels
                      selectedLevels={selectedLevels}
                      onChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="delayTimer"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <DelayTimerInput
                      storeValue={delayTimer}
                      onChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <div className="flex flex-col">
              <span className="self-start text-lg font-bold">SFX:</span>
              <div className="flex flex-col gap-2 pt-2">
                <FormField
                  control={form.control}
                  name="soundEffects.correct"
                  render={({ field }) => (
                    <FormItem className="cartoonish-card flex flex-row items-center justify-between rounded-lg p-2">
                      <div className="space-y-0.5">
                        <label>Correct answer</label>
                      </div>
                      <FormControl>
                        <Switch
                          storeValue={soundEffects.correct}
                          onChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="soundEffects.wrong"
                  render={({ field }) => (
                    <FormItem className="cartoonish-card flex flex-row items-center justify-between rounded-lg p-2">
                      <div className="space-y-0.5">
                        <label>Wrong answer</label>
                      </div>
                      <FormControl>
                        <Switch
                          storeValue={soundEffects.wrong}
                          onChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <SheetFooter>
              <Button
                type="submit"
                className="cartoonish-btn w-40 self-center from-blue-500 to-green-700 dark:text-black"
              >
                Save changes
              </Button>
              <SheetClose asChild>
                <Button
                  type="button"
                  className="cartoonish-btn w-40 self-center from-red-500 to-gray-700 dark:text-black"
                >
                  Close
                </Button>
              </SheetClose>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}

export default WordsPreference;
