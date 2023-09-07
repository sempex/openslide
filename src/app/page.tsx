"use client";

import SetButton from "@/components/SetButton";
import Slider from "@/components/Slider";
import { PKG_END, PKG_START } from "@/lib/constants";
import Image from "next/image";
import { useEffect, useState } from "react";
import { GrConnect } from "react-icons/gr";
import { PiPlugsConnectedDuotone } from "react-icons/pi";

export default function Home() {
  const [port, setPort] = useState<SerialPort | null>(null);
  const [message, setMessage] = useState<string>("");
  const [connected, setConnected] = useState<boolean>(false);

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

  const [sliderValue, setSliderValue] = useState<string>("");
  console.log(sliderValue);
  return (
    <main className="flex gap-2 p-24">
      <div className="space-y-10">
        <div className="space-x-3">
          <button
            className="bg-orange-400 text-black font-bold rounded-lg px-3 py-2 h-10 disabled:opacity-50"
            onClick={connect}
            disabled={!!port}
          >
            {connected ? <PiPlugsConnectedDuotone /> : <GrConnect />}
          </button>
          <button
            onClick={send}
            className="bg-orange-400 text-black font-bold rounded-lg px-3 py-2 h-10 disabled:opacity-50"
            disabled={!port}
          >
            Send IT
          </button>
        </div>
        <div className="flex flex-col items-center justify-center rounded-lg bg-[#363640] p-24">
          <div className="flex flex-col items-center space-y-6">
            <Slider sliderValue={sliderValue} setSliderValue={setSliderValue} />
            <div className="flex space-x-6">
              <SetButton buttonValue="Set StartPoint" />
              <SetButton buttonValue="Set EndPoint" />
            </div>
          </div>
        </div>

        {message}
      </div>
    </main>
  );
}
