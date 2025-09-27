"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";

import { Button } from "~/components/ui/button";
import { useWordsStore } from "~/store/words.store";
import WordInput from "./WordInput";
import { useWordsSettingsStore } from "~/store/wordsSettings.store";

import { AiFillSound } from "react-icons/ai";
import { GiFastForwardButton } from "react-icons/gi";
import { FaPlay } from "react-icons/fa6";

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

  const correctAnswerSoundRef = useRef<HTMLAudioElement | null>(null);
  const wrongAnswerSoundRef = useRef<HTMLAudioElement | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);

  const [hasInteracted, setHasInteracted] = useState(false);
  const [start, setStart] = useState(true);

  const [answerResult, setAnswerResult] = useState<boolean | null>(null);
  const [disableSkip, setDisableSkip] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      correctAnswerSoundRef.current = new Audio(
        "/website_sounds/correct-sound.wav",
      );
      wrongAnswerSoundRef.current = new Audio(
        "/website_sounds/wrong-sound.mp3",
      );
    }
  }, []);

  const checkAnswer = () => {
    if (!answer || answer !== currentWord) {
      if (soundEffects.wrong && wrongAnswerSoundRef.current) {
        setAnswerResult(false);
        wrongAnswerSoundRef.current.play().catch(console.error);
        setTimeout(() => {
          setAnswerResult(null);
        }, 900);
      }
      return false;
    }
    if (soundEffects.correct && correctAnswerSoundRef.current) {
      setAnswerResult(true);
      correctAnswerSoundRef.current.play().catch(console.error);
    }
    setTimeout(() => {
      setAnswer("");
      setAnswerResult(null);
      pickRandom();
      setHasInteracted(true);
      return true;
    }, 500);
  };

  const handleSkip = useCallback(
    (delay = delayTimer) => {
      setDisableSkip(true);
      playAudio();
      setAnswer(currentWord ?? "");
      setTimeout(() => {
        setAnswer("");
        pickRandom();
        setDisableSkip(false);
        setHasInteracted(true);
        inputRef.current?.focus();
      }, delay);
    },
    [currentWord, delayTimer, playAudio, pickRandom, setAnswer],
  );

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
    if (hasInteracted && currentWord) {
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [currentWord, hasInteracted]);

  useEffect(() => {
    if (hasInteracted && currentAudio && !isPlaying) {
      playAudio();
      setHasInteracted(false);
    }
  }, [hasInteracted, currentAudio, isPlaying, playAudio]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.altKey && event.key.toLowerCase() === "s" && !disableSkip) {
        event.preventDefault();
        handleSkip();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [disableSkip, handleSkip]);

  return (
    <form onSubmit={handleSubmit} className="flex flex-col items-center gap-5">
      <div className="text-stone-500">
        Listen to the word, and type what you hear.
      </div>

      <div className="flex items-center gap-3">
        <div className="text-4xl">
          {currentWord ? (
            <WordInput ref={inputRef} answerResult={answerResult} />
          ) : (
            "Loading..."
          )}
        </div>
      </div>

      <div className="flex gap-4">
        <Button
          title="Skip (Alt + S)"
          className="cartoonish-btn from-purple-500 to-yellow-700"
          onClick={() => handleSkip()}
          type="button"
          disabled={words.length === 0 || disableSkip}
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
              inputRef.current?.focus();
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
              inputRef.current?.focus();
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
