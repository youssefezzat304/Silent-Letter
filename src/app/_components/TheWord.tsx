"use client";
import React, { useEffect, useState } from "react";
import { Button } from "~/components/ui/button";
import { useWordsStore } from "~/store/words.store";
import WordInput from "./WordInput";

import { AiFillSound } from "react-icons/ai";
import { GiFastForwardButton } from "react-icons/gi";
import { FaPlay } from "react-icons/fa6";
import { useWordsSettingsStore } from "~/store/wordsSettings.store";

export default function TheWord() {
  const {
    words,
    answer,
    currentWord,
    currentAudio,
    isPlaying,
    setAnswer,
    pickRandom,
    playAudio,
  } = useWordsStore();

  const soundEffects = useWordsSettingsStore((s) => s.soundEffects);
  const delayTimer = useWordsSettingsStore((s) => s.delayTimer);

  const correctAnswerSound = new Audio("/website_sounds/correct-sound.wav");
  const wrongAnswerSound = new Audio("/website_sounds/wrong-sound.mp3");


  const [hasInteracted, setHasInteracted] = useState(false);
  const [start, setStart] = useState(true);

  const checkAnswer = () => {
    if (!answer || answer !== currentWord) {
      if (soundEffects.wrong) {
        void wrongAnswerSound.play();
      }
      return false;
    }
    if (soundEffects.correct) {
      void correctAnswerSound.play();
    }
    setTimeout(() => {
      setAnswer("");
      pickRandom();
      setHasInteracted(true);
      return true;
    }, 500);
  };

  const handleSkip = (delay = delayTimer) => {
    playAudio();
    setAnswer(currentWord ?? "");
    setTimeout(() => {
      setAnswer("");
      pickRandom();
      setHasInteracted(true);
    }, delay);
  };

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    checkAnswer();
  };

  useEffect(() => {
    if (words.length > 0 && !currentWord) {
      pickRandom();
    }
  }, [words, currentWord, pickRandom]);

  useEffect(() => {
    if (hasInteracted && currentAudio && !isPlaying) {
      playAudio();
      setHasInteracted(false);
    }
  }, [hasInteracted, currentAudio, isPlaying, playAudio]);

  return (
    <form onSubmit={handleSubmit} className="flex flex-col items-center gap-5">
      <div className="text-stone-500">
        Listen to the word, and type what you hear.
      </div>

      <div className="flex items-center gap-3">
        <div className="text-4xl">
          {currentWord ? <WordInput /> : "Loading..."}
        </div>
      </div>

      <div className="flex gap-4">
        <Button
          title="Skip"
          className="cartoonish-btn from-purple-500 to-yellow-700"
          onClick={() => handleSkip()}
          type="button"
          disabled={words.length === 0}
        >
          Skip <GiFastForwardButton />
        </Button>

        <Button
          title="Submit"
          type="submit"
          className="cartoonish-btn from-green-500 to-blue-700"
          disabled={answer.length !== currentWord?.length}
        >
          Submit
        </Button>
        {start ? (
          <Button
            title="start"
            className="cartoonish-btn from-green-500 to-blue-700"
            type="button"
            onClick={() => {
              setStart(false);
              playAudio();
            }}
            disabled={!currentAudio || isPlaying}
          >
            Start <FaPlay />
          </Button>
        ) : (
          <Button
            title="replay"
            className="cartoonish-btn from-green-500 to-blue-700"
            type="button"
            onClick={() => {
              playAudio();
            }}
            disabled={!currentAudio || isPlaying}
          >
            <AiFillSound />
          </Button>
        )}
      </div>
    </form>
  );
}
