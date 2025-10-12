import React, { forwardRef } from "react";

import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "~/components/ui/input-otp";

import { useWordsStore } from "~/store/words.store";

const WordInput = forwardRef<
  HTMLInputElement,
  { answerResult: boolean | null }
>(({ answerResult }, ref) => {
  const { currentWord, answer = "", setAnswer } = useWordsStore();
  const wordLenght = currentWord?.length ?? 0;

  const handleAnswer = (value: string) => {
    setAnswer(value);
  };

  if (wordLenght === 0) {
    return null;
  }

  return (
    <InputOTP
      ref={ref}
      onChange={handleAnswer}
      value={answer}
      maxLength={wordLenght}
    >
      <InputOTPGroup
        className={`cartoonish-in max-w-[330px] gap-1 bg-stone-100 text-black md:max-w-[600px] lg:max-w-[800px] ${
          answerResult === true
            ? "border-green-500! shadow-[4px_4px_0px_#00c951]!"
            : answerResult === false
              ? "border-red-500! shadow-[4px_4px_0px_#ff0000]!"
              : ""
        }`}
      >
        {currentWord?.split("").map((_, index) => (
          <InputOTPSlot
            className="h-10 w-12 border-b-2 border-black text-[15px] caret-black shadow-none md:text-2xl lg:text-3xl"
            key={index}
            index={index}
            style={{
              WebkitAppearance: "none",
              MozAppearance: "none",
              appearance: "none",
              background: "transparent",
              borderLeft: "none",
              borderRight: "none",
              borderTop: "none",
              boxShadow: "none",
            }}
          />
        ))}
      </InputOTPGroup>
    </InputOTP>
  );
});

WordInput.displayName = "WordInput";

export default WordInput;
