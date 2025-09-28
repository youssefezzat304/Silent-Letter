import { useState, useEffect } from "react";
import { Input } from "~/components/ui/input";
import Info from "../Info";

interface DelayTimerInputProps {
  storeValue: number;
  onChange: (value: number) => void;
}

function DelayTimerInput({ storeValue, onChange }: DelayTimerInputProps) {
  const [inputValue, setInputValue] = useState(storeValue.toString());

  useEffect(() => {
    setInputValue(storeValue.toString());
  }, [storeValue]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    setInputValue(rawValue);

    if (rawValue !== "") {
      const numValue = parseInt(rawValue, 10);
      if (!isNaN(numValue)) {
        const clampedValue = Math.min(Math.max(numValue, 2), 10);
        onChange(clampedValue);
      }
    }
  };

  const handleBlur = () => {
    const numValue = parseInt(inputValue, 10);
    if (isNaN(numValue) || inputValue === "") {
      setInputValue(storeValue.toString());
      onChange(storeValue);
    } else {
      const clampedValue = Math.min(Math.max(numValue, 2), 10);
      setInputValue(clampedValue.toString());
      onChange(clampedValue);
    }
  };

  return (
    <div className="flex items-center gap-3">
      <label className="self-start text-lg font-bold text-nowrap">
        Delay timer :
      </label>
      <Input
        className="cartoonish-selection no-spin w-15 translate-y-0"
        type="number"
        min={2}
        max={10}
        value={inputValue}
        onChange={handleInputChange}
        onBlur={handleBlur}
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
}

export default DelayTimerInput;

