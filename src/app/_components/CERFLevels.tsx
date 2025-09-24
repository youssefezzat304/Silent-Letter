import { Button } from "~/components/ui/button";

const LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"];

type Props = {
  selectedLevels: string[];
  onChange: (levels: string[]) => void;
};

export default function CERFLevels({ selectedLevels, onChange }: Props) {
  const handleClick = (lvl: string) => {
    const newLevels = selectedLevels.includes(lvl)
      ? selectedLevels.filter((l) => l !== lvl)
      : [...selectedLevels, lvl];
    onChange(newLevels);
  };

  return (
    <div className="grid grid-cols-3 gap-2 md:grid-cols-6">
      {LEVELS.map((lvl) => (
        <Button
          key={lvl}
          onClick={() => handleClick(lvl)}
          data-state={selectedLevels.includes(lvl) ? "on" : "off"}
          aria-label={`Toggle ${lvl}`}
          className="cartoonish-btn bg-white text-black hover:bg-white data-[state=on]:bg-green-500 data-[state=on]:text-white"
        >
          {lvl}
        </Button>
      ))}
    </div>
  );
}
