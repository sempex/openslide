import * as RadioGroup from "@radix-ui/react-radio-group";
import {BiSolidTimer} from "react-icons/bi"

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

interface RadioList {
  items: RadioItem[];
}

export default function RadioCard({ items }: RadioList) {
  return (
    <RadioGroup.Root className="grid grid-cols-3 gap-4">
      {items.map((item) => {
        return (
          <RadioGroup.Item
            className="flex rounded-lg p-4 border gap-4 items-center hover:border-primary transition-all relative"
            value={item.value}
          >
            <RadioGroup.Indicator className="w-4 h-4 bg-red-300 absolute top-0 right-0 m-3"/>
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
