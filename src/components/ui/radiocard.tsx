import * as RadioGroup from "@radix-ui/react-radio-group";
import { it } from "node:test";
import {BiCheckCircle} from "react-icons/bi"

export interface RadioItem {
  name: string;
  value: string;
  description: string;
  icon: React.ReactNode;
  config: Config 
}

interface Config {
    start: number,
    end: number,
    speed: number,
    ease?: "in-out" | "linear" | "out"
}

interface Props {
  items: RadioItem[];
  setTemplate: (value: string) => void
  setSliderValue: (value:number[]) => void
}

function handleValueChange(value:string, setTemplate:(values: string) => void, setSliderValue: (value:number[]) => void, items:RadioItem[]) {
  setTemplate(value)
  items.map((item) => {
    if (item.value === value) {
      setSliderValue([item.config.start, item.config.end])
    }
  })
}

export default function RadioCard({ items, setTemplate, setSliderValue }: Props) {
  return (
    <RadioGroup.Root className="grid grid-cols-3 gap-4" onValueChange={(value:string) => {handleValueChange(value, setTemplate, setSliderValue, items)}}>
      {items.map((item) => {
        return (
          <RadioGroup.Item
            className="flex rounded-lg p-4 border gap-4 items-center hover:border-primary transition-all relative"
            value={item.value}
            key={item.value}
          >
            <RadioGroup.Indicator className="absolute top-0 right-0 m-3">
              <BiCheckCircle className="text-lg text-secondary-foreground"/>
            </RadioGroup.Indicator>
            {item.icon}
            <div className="text-left">
              <h2 className="font-bold">{item.name}</h2>
              <p className="text-sm text-muted-foreground">
                {item.description}
              </p>
            </div>
          </RadioGroup.Item>
        );
      })}
    </RadioGroup.Root>
  );
}
