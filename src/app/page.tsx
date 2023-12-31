"use client";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
// import Slider from "@/components/Slider";
import { PKG_END, PKG_START } from "@/lib/constants";
import { useEffect, useState } from "react";
import {
  PiPlugsConnectedDuotone,
  PiPlugsConnectedLight,
  PiPlugsLight,
} from "react-icons/pi";
import { BiSolidTimer, BiSolidCamera, BiRun } from "react-icons/bi";
import { IoIosSettings } from "react-icons/io";
import { FiPlay } from "react-icons/fi";
import { cn } from "@/lib/utils";
import RadioCard, { RadioItem } from "@/components/ui/radiocard";
import {
  HiForward,
  HiPlay,
  HiBackward,
  HiArrowPathRoundedSquare,
  HiOutlineArrowsRightLeft,
  HiMiniScale,
} from "react-icons/hi2";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import parse, { Message } from "@/lib/serial/parse";
import listen from "@/lib/serial/listen";
import send from "@/lib/serial/send";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import Logs, { LogItem } from "@/components/ui/logs";
import { serialize } from "@/lib/serial/serialize";
import { Switch } from "@/components/ui/switch";
import pTimeout from "p-timeout";
import { Loader2 } from "lucide-react";
import { Toggle } from "@/components/ui/toggle";
import SliderImage from "../../cad/renders/v4.png";
import Image from "next/image";
import {useDebouncedCallback} from "use-debounce"

const TEMPLATES: RadioItem[] = [
  {
    name: "Timelapse",
    value: "timelapse",
    description: "Capture amazing time-lapses effortlessly.",
    icon: <BiSolidTimer className="text-6xl" />,
    config: {
      start: 0,
      end: 100,
      speed: 2,
    },
  },
  {
    name: "Standard",
    value: "standard",
    description: "Craft stunning shots designed to captivate in any scenario.",
    icon: <BiSolidCamera className="text-6xl" />,
    config: {
      start: 0,
      end: 100,
      speed: 45,
    },
  },
  {
    name: "Action",
    value: "action",
    description:
      "Generate dynamic shots perfectly suited for action-packed scenes.",
    icon: <BiRun className="text-7xl" />,
    config: {
      start: 20,
      end: 80,
      speed: 100,
    },
  },
];

export default function Home() {
  const [port, setPort] = useState<SerialPort | null>(null);
  const [message, setMessage] = useState<string>("");
  const [connected, setConnected] = useState<boolean>(false);
  const [position, setPosition] = useState<number[]>([0, 100]);
  const [direction, setDirection] = useState<"ltr" | "rtl">("ltr");
  const [device, setDevice] = useState<Message>();
  const [speed, setSpeed] = useState<number[]>([50]);
  const [template, setTemplate] = useState<string>("");
  const [showLogs, setShowLogs] = useState<boolean>(false);
  const [logs, setLogs] = useState<LogItem[]>([]);
  const [loop, setLoop] = useState(false);
  const [loadingConnect, setLoadingConnect] = useState<boolean>(false);

  const connect = async () => {
    const filters: SerialPortRequestOptions["filters"] = [];

    // Prompt user to select an Arduino Uno device.
    const port = await navigator.serial.requestPort({ filters });
    // await port.close();
    setLoadingConnect(true);
    setPort(port);

    await port.open({ baudRate: 9600 });
    const reader = port.readable?.getReader();

    if (!reader) return;

    try {
      // const connected = await pTimeout(
      //   listen(reader, {
      //     returnOn: "CONN",
      //   }),
      //   {
      //     milliseconds: 5000,
      //   }
      // );
      // console.log(connected?.data);
      setLoadingConnect(false);
      setConnected(true);
      // setDevice();kc^
    } catch {
      console.log("no connection");
      setPort(null);
      setLoadingConnect(false);
      return;
    }

    listen(reader, {
      onMessage: (message) => {
        console.log(message);
        handleAddLogs(serialize(message), "received");
      },
    });
  };

  const handleSend = async (message: Message, prt?: SerialPort) => {
    const currentPort = prt ? prt : port;
    if (!currentPort) return;
    const { type, data } = message;
    // Modify your message to include the start and end markers
    send(
      currentPort,
      {
        type: type,
        data: data,
      },
      (message) => handleAddLogs(message, "sent")
    );
  };
  const handleMoveRight = () => {
    const newPos = { start: position[0] + 2, end: position[1] };
    setPosition([newPos.start, newPos.end]);
    handleSend({
      type: "MOVER",
      data: {"distance": 2},
    });
  };

  const handleMoveLeft = () => {
    const newPos = { start: position[0] - 2, end: position[1] };
    setPosition([newPos.start, newPos.end]);
    handleSend({
      type: "MOVEL",
      data: {"distance": 2},
    });
  };

  const handleSwap = () => {
    setPosition([position[1], position[0]]);
    setDirection((d) => (d === "ltr" ? "rtl" : "ltr"));
  };

  const disconnect = async () => {
    await port?.close();
    setPort(null);
    setConnected(false);
  };

  const calibrate = () => {
    handleSend({
      type: "CALIBRATE",
      data: {
        calibrate: true,
      },
    });
  };

  const debounced = useDebouncedCallback( (speed:number) =>
    handleSend({type: "SPEED", data: {speed}}),
    300
  )



  const handleAddLogs = (message: string, type: "sent" | "received") => {
    setLogs((logs) => [
      ...logs,
      {
        message: message,
        time: new Date(),
        type: type,
      },
    ]);
  };

  useEffect(() => {
    navigator.serial.addEventListener("connect", (e) => {
      console.log(e);
    });
    navigator.serial.addEventListener("disconnect", (e) => {
      console.log("oh nei", e);
      setPort(null);
      setConnected(false);
    });

    return () => {
      navigator.serial.removeEventListener("connect", (e) => {
        console.log(e);
      });
      navigator.serial.removeEventListener("disconnect", (e) => {
        console.log(e);
      });
    };
  });

  function handleTemplateChange(value: string) {
    setTemplate(value);
    const template = TEMPLATES.find((item) => value == item.value);
    if (!template) return;
    setPosition([template?.config.start, template?.config.end]);
    setSpeed([template?.config.speed]);
  }

  return (
    <main className="p-4 sm:p-24 w-full h-screen">
      <div className="w-full text-center">
        <h1 className="font-bold text-xl">OpenSlide V1</h1>
        <p className="text-muted-foreground text-xs">
          {device?.data?.name || ""} {device?.data?.v || ""}
        </p>
      </div>
      <div className="mb-5 flex justify-between items-end">
        <div>
          <div className="flex items-center gap-1 p-2 w-fit rounded-xl">
            <div
              className={cn(
                "w-2 h-2 rounded-full",
                connected ? "bg-green-400" : "bg-neutral-300"
              )}
            ></div>
            <span className="text-muted-foreground text-sm">
              {connected ? "Connected" : "Disconnected"}
            </span>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={connect}
              disabled={connected}
              variant={"secondary"}
              className="drop-shadow-md"
            >
              {loadingConnect ? (
                <Loader2 className="animate-spin w-3 h-3" />
              ) : connected ? (
                <PiPlugsConnectedLight className="text-white text-xl stroke-2" />
              ) : (
                <PiPlugsLight className="text-white text-xl stroke-2" />
              )}
            </Button>
            <Button className="drop-shadow-md" onClick={calibrate}>
              <HiMiniScale className="mr-2 text-xl" />
              Calibrate
            </Button>
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="secondary">
              <IoIosSettings />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Settings</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setShowLogs((l) => !l)}>
              {showLogs ? "Hide" : "Show"} Logs
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="grid grid-cols-3 gap-4 w-full">
        <Card
          className={cn(
            "flex flex-col items-center justify-center p-5 sm:p-8",
            !showLogs ? "col-span-3" : "col-span-2"
          )}
        >
          <div className="flex items-center gap-20 w-full">
            <div className="flex flex-col items-center space-y-6 w-full">
              <CardHeader className="p-0 relative">
                {/* <CardDescription>controll slider position</CardDescription> */}
                <Image src={SliderImage} alt="Slider" />
                <div className="bg-gradient-to-t from-background absolute inset-0"></div>
              </CardHeader>
              <Slider
                onValueChange={(v) => setPosition(v)}
                value={position}
                min={0}
                defaultValue={[0, 100]}
                max={100}
                className="w-5/6"
              />
              <div className="flex space-x-6">
                <Toggle onClick={() => setLoop(!loop)}>
                  <HiArrowPathRoundedSquare
                    className={cn("text-xl", loop && "text-primary")}
                  />
                </Toggle>
                <Button onClick={handleMoveLeft}>
                  <HiBackward />
                </Button>
                <Button
                  onClick={() =>
                    handleSend({
                      type: "MOVE",
                      data: { start: position[0], end: position[1] },
                    })
                  }
                  className=""
                >
                  <HiPlay />
                </Button>
                <Button onClick={handleMoveRight}>
                  <HiForward />
                </Button>
                <Button
                  onClick={handleSwap}
                  variant="link"
                  className={"hover:bg-secondary"}
                >
                  <HiOutlineArrowsRightLeft
                    className={cn(
                      "text-lg transition-all duration-300",
                      direction === "ltr" ? "rotate-0" : "rotate-180"
                    )}
                  />
                </Button>
              </div>
            </div>
            <div className="flex items-center flex-col w-24">
              <div>{speed} cm/s</div>
              <Slider
                onValueChange={(v) => {
                  setSpeed(v)
                  debounced(v[0])
                }}
                orientation="vertical"
                value={speed}
                min={0}
                defaultValue={[0, 100]}
                max={100}
                className="h-56"
              />
              <span className="text-muted-foreground">Speed</span>
            </div>
          </div>
        </Card>
        {showLogs && (
          <Card className="p-2 col-span-1">
            <Logs logs={logs} />
          </Card>
        )}
        <div className="col-span-3">
          <p className="text-muted-foreground col-span-3 text-left text-xs font-semibold mb-2">
            Use our predefined templates to get startet quickly!
          </p>
          <RadioCard items={TEMPLATES} onChange={handleTemplateChange} />
        </div>
      </div>
    </main>
  );
}
