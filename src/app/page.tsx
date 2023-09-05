"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

export default function Home() {
  const [port, setPort] = useState<SerialPort | null>(null);
  const listen = async (reader: ReadableStreamDefaultReader<string>) => {
    while (true) {
      const { value, done } = await reader.read();
      if (done) {
        // Allow the serial port to be closed later.
        reader.releaseLock();
        break;
      }
      // value is a Uint8Array.
      console.log(value);
    }
  };
  const getDevices = async () => {
    const filters: SerialPortRequestOptions["filters"] = [];

    // Prompt user to select an Arduino Uno device.
    const port = await navigator.serial.requestPort({ filters });

    setPort(port);

    const { usbProductId, usbVendorId } = port.getInfo();

    // await port.close();

    await port.open({ baudRate: 9600 });

    const textDecoder = new TextDecoderStream();
    const readableStreamClosed = port.readable?.pipeTo(textDecoder.writable);
    const reader = textDecoder.readable.getReader();

    if (reader) listen(reader);

    const encoder = new TextEncoder();

    // Send "Hello, World!" to the serial port
    const message = "Hello, World!";
    const data = encoder.encode(message);

    const writer = port.writable?.getWriter();

    if (!writer) return;

    await writer.write(data);

    console.log(`Sent: ${message}`);

    // Close the port when you're done
    // await port.close();

    console.log(usbProductId, usbVendorId);
  };

  const send = async () => {
    const encoder = new TextEncoder();

    // Send "Hello, World!" to the serial port
    const message = "Hello, World!";
    const data = encoder.encode(message);

    const writer = port?.writable?.getWriter();

    if (!writer) return;

    await writer.write(data);

    console.log(`Sent: ${message}`);
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

  return (
    <main className="flex gap-2 p-24">
      <button
        className="bg-orange-400 text-black font-bold rounded-lg px-3 py-2"
        onClick={getDevices}
      >
        Connect
      </button>
      <button
        className="bg-orange-400 text-black font-bold rounded-lg px-3 py-2"
        onClick={send}
      >
        Send IT
      </button>
    </main>
  );
}
