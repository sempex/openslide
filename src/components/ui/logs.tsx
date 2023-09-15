import { cn } from "@/lib/utils";
import { HiArrowSmallLeft, HiArrowSmallRight } from "react-icons/hi2";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./tooltip";

export interface LogItem {
  time: Date;
  message: string;
  type: "sent" | "received";
}

export default function Logs({ logs }: { logs: LogItem[] }) {
  return (
    <div className="flex font-mono bg-black rounded-lg flex-col h-full overflow-y-auto max-h-56">
      {logs.map((log, i) => (
        <div
          key={i}
          className={cn("flex gap-2 items-center py-1 text-sm px-2")}
        >
          <span className="ml-2 text-xs opacity-60">
            {log.time.toLocaleTimeString()}
          </span>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <div>
                  {log.type == "received" ? (
                    <HiArrowSmallLeft />
                  ) : (
                    <HiArrowSmallRight />
                  )}
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Message {log.type === "received" ? "received from slider" : "sent to slider"}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <pre className="flex-1">{log.message}</pre>
        </div>
      ))}
    </div>
  );
}
