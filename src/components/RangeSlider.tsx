import * as Slider from '@radix-ui/react-slider';

interface RangeSliderProps {
  min: number;
  max: number;
  step: number;
  value: [number, number];
  onChange: (value: [number, number]) => void;
  formatValue?: (value: number) => string;
}

export function RangeSlider({ min, max, step, value, onChange, formatValue }: RangeSliderProps) {
  return (
    <form className="w-full px-4">
      <div className="flex justify-between mb-2 text-sm text-gray-600">
        <span>{formatValue ? formatValue(value[0]) : value[0]}</span>
        <span>{formatValue ? formatValue(value[1]) : value[1]}</span>
      </div>
      <Slider.Root
        className="relative flex items-center select-none touch-none w-full h-5"
        value={value}
        onValueChange={onChange}
        min={min}
        max={max}
        step={step}
      >
        <Slider.Track className="bg-gray-200 relative grow rounded-full h-[3px]">
          <Slider.Range className="absolute bg-[#E4002B] rounded-full h-full" />
        </Slider.Track>
        <Slider.Thumb
          className="block w-5 h-5 bg-white rounded-full shadow-lg border-2 border-[#E4002B] hover:bg-[#E4002B]/5 focus:outline-none focus:ring-2 focus:ring-[#E4002B] focus:ring-offset-2"
          aria-label="Min value"
        />
        <Slider.Thumb
          className="block w-5 h-5 bg-white rounded-full shadow-lg border-2 border-[#E4002B] hover:bg-[#E4002B]/5 focus:outline-none focus:ring-2 focus:ring-[#E4002B] focus:ring-offset-2"
          aria-label="Max value"
        />
      </Slider.Root>
    </form>
  );
}