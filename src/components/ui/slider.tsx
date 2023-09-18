"use client";

import * as React from "react";
import * as SliderPrimitive from "@radix-ui/react-slider";

import { cn } from "@/lib/utils";

const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>
>(({ className, ...props }, ref) => (
  <SliderPrimitive.Root
    ref={ref}
    className={cn(
      `relative flex w-full touch-none select-none items-center ${props.orientation=="vertical" ? "flex flex-col w-20 h-96" : ""}`,
      className
    )}
    {...props}
  >
    <SliderPrimitive.Track className={`relative h-2 w-full grow overflow-hidden rounded-full bg-secondary ${props.orientation=="vertical" ? "w-3":""}`}>
      <SliderPrimitive.Range className={cn(`absolute h-full bg-primary ${props.orientation=="vertical" ? "w-full":""}`)}/>
    </SliderPrimitive.Track>
    {props.defaultValue?.map((value, i) => {
      return (
        <SliderPrimitive.Thumb
          aria-orientation={props.orientation == "vertical" ? "vertical" : "horizontal"}
          key={i}
          className="block h-5 w-5 rounded-full border-2 border-primary bg-background ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
        >
          <span className="text-xs inset-0 absolute flex justify-center items-center text-primary font-bold">
            {i + 1}
          </span>
        </SliderPrimitive.Thumb>
      );
    })}
  </SliderPrimitive.Root>
));
Slider.displayName = SliderPrimitive.Root.displayName;

export { Slider };
