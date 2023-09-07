interface SliderProps {
    sliderValue: string
    setSliderValue: (value:string ) => void
}

export default function Slider({sliderValue, setSliderValue}:SliderProps){
  return (
    <div className="w-full">
      <input
        type="range"
        className="transparent h-[4px] w-full cursor-pointer appearance-none border-transparent bg-[#2cbe6b] accent-white"
        id="customRange1"
        onChange={(e) => {setSliderValue(e.target.value)}}
        value={sliderValue}
      />
    </div>
  );
}
