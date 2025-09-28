import { useState, useEffect } from "react";
import { Button } from "~/components/ui/button";

const LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"];

type Props = {
  selectedLevels: string[];
  onChange: (levels: string[]) => void;
};

export default function CERFLevels({ selectedLevels, onChange }: Props) {
  const [localSelectedLevels, setLocalSelectedLevels] =
    useState<string[]>(selectedLevels);

  useEffect(() => {
    setLocalSelectedLevels(selectedLevels);
  }, [selectedLevels]);

  const handleClick = (lvl: string) => {
    const newLevels = localSelectedLevels.includes(lvl)
      ? localSelectedLevels.filter((l) => l !== lvl)
      : [...localSelectedLevels, lvl];

    setLocalSelectedLevels(newLevels);

    onChange(newLevels);
  };

  return (
    <div className="grid grid-cols-6">
      {LEVELS.map((lvl) => (
        <Button
          key={lvl}
          type="button"
          onClick={() => handleClick(lvl)}
          data-state={localSelectedLevels.includes(lvl) ? "on" : "off"}
          aria-label={`Toggle ${lvl}`}
          className="cartoonish-btn hover:bg-opacity-80 bg-white text-black transition-colors duration-150 hover:bg-white data-[state=on]:bg-green-400 data-[state=on]:text-white"
        >
          {lvl}
        </Button>
      ))}
    </div>
  );
}
