import React from "react";

import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "~/components/ui/input-otp";

import { useWordsStore } from "~/store/words.store";

function WordInput() {
  const { currentWord, answer = "", setAnswer } = useWordsStore();
  const wordLenght = currentWord?.length ?? 0;

  const handleAnswer = (value: string) => {
    setAnswer(value);
  };

  if (wordLenght === 0) {
    return null;
  }

  return (
    <InputOTP onChange={handleAnswer} value={answer} maxLength={wordLenght}>
      <InputOTPGroup className="cartoonish-btn gap-1 text-black">
        {currentWord?.split("").map((char, index) => (
          <InputOTPSlot
            className="h-10 w-12 appearance-none border-b-2 border-black from-green-500 to-blue-700 text-3xl shadow-none outline-none focus:outline-none"
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
}

export default WordInput;
