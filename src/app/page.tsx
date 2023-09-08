"use client";

import SetButton from "@/components/SetButton";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
// import Slider from "@/components/Slider";
import { PKG_END, PKG_START } from "@/lib/constants";
import Image from "next/image";
import { useEffect, useState } from "react";
import { GrConnect } from "react-icons/gr";
import { PiPlugsConnectedDuotone } from "react-icons/pi";
import { FiPlay } from "react-icons/fi";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";

export default function Home() {
  const [port, setPort] = useState<SerialPort | null>(null);
  const [message, setMessage] = useState<string>("");
  const [connected, setConnected] = useState<boolean>(false);
  const [sliderValue, setSliderValue] = useState<number[]>([10, 100]);

  const listen = async (reader: ReadableStreamDefaultReader<Uint8Array>) => {
    let message = "";
    let startMarkerFound = false;

    while (true) {
      const { value, done } = await reader.read();
      if (done) {
        // Allow the serial port to be closed later.
        reader.releaseLock();
        break;
      }

      // Convert the received Uint8Array to a string
      const stringValue = new TextDecoder().decode(value);

      // Process each character in the received data
      for (let i = 0; i < stringValue.length; i++) {
        const currentChar = stringValue[i];

        if (currentChar === PKG_START) {
          // Start marker found, reset the message
          message = "";
          startMarkerFound = true;
        } else if (currentChar === PKG_END && startMarkerFound) {
          // End marker found, process the message
          console.log("Received message:", message);
          startMarkerFound = false;
        } else if (startMarkerFound) {
          // Append the character to the message
          message += currentChar;
        }

        setMessage(message);
      }
    }
  };

  const connect = async () => {
    const filters: SerialPortRequestOptions["filters"] = [];

    // Prompt user to select an Arduino Uno device.
    const port = await navigator.serial.requestPort({ filters });
    setConnected(true);

    setPort(port);
    // await port.close();

    await port.open({ baudRate: 9600 });

    const reader = port.readable?.getReader();

    if (reader) listen(reader);
  };

  const send = async () => {
    const encoder = new TextEncoder();

    // Modify your message to include the start and end markers
    const message = "<Hello>";
    const data = encoder.encode(message);

    const writer = port?.writable?.getWriter();

    if (!writer) return;

    await writer.write(data);

    console.log(`Sent: ${message}`);

    writer.releaseLock();
  };

  const disconnect = async () => {
    await port?.close();
    setPort(null);
    setConnected(false);
  }

  useEffect(() => {
    navigator.serial.addEventListener("connect", (e) => {
      console.log(e);
    });
    navigator.serial.addEventListener("disconnect", (e) => {
      console.log(e);
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

  console.log(sliderValue);
  return (
    <main className="flex gap-2 p-4 sm:p-24">
      <div className="space-y-5 sm:w-96 w-full">
        <div>
          <div className="flex items-center gap-1 p-2 w-fit rounded-xl">
            <div
              className={cn(
                "w-2 h-2 rounded-full",
                port ? "bg-green-400" : "bg-neutral-300"
              )}
            ></div>
            <span className="text-muted-foreground text-sm">
              {port ? "Connected" : "Disconnected"}
            </span>
          </div>
          <Button onClick={connect} disabled={!!port} variant={"secondary"}>
            {connected ? <PiPlugsConnectedDuotone /> : <GrConnect />}
          </Button>
        </div>
        <Card className="flex flex-col items-center justify-center p-5 sm:p-8 w-full">
          <div className="flex flex-col items-center space-y-6 w-full">
            {/* <Slider sliderValue={sliderValue} setSliderValue={setSliderValue} /> */}
            <Slider
              onValueChange={(v) => setSliderValue(v)}
              value={sliderValue}
              defaultValue={[10, 20]}
              min={0}
              max={100}
              className="w-full"
            />
            <div className="flex space-x-6">
              {/* <SetButton buttonValue="Set StartPoint" />
              <SetButton buttonValue="Set EndPoint" /> */}
              <Button onClick={send}>
                <FiPlay className="fill-white" />
              </Button>
            </div>
          </div>
        </Card>
        {message}
      </div>
    </main>
  );
}
