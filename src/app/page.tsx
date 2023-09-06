"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

export default function Home() {
  const [port, setPort] = useState<SerialPort | null>(null);

  const listen = async (
    reader:
      | ReadableStreamDefaultReader<string>
      | ReadableStreamDefaultReader<Uint8Array>
  ) => {
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
  const connect = async () => {
    const filters: SerialPortRequestOptions["filters"] = [];

    // Prompt user to select an Arduino Uno device.
    const port = await navigator.serial.requestPort({ filters });

    setPort(port);
    // await port.close();

    await port.open({ baudRate: 9600 });

    const textDecoder = new TextDecoderStream();
    const readableStreamClosed = port.readable?.pipeTo(textDecoder.writable);
    const reader = textDecoder.readable.getReader();

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

  return (
    <main className="flex gap-2 p-24">
      <button
        className="bg-orange-400 text-black font-bold rounded-lg px-3 py-2 disabled:opacity-50"
        onClick={connect}
        disabled={!!port}
      >
        Connect
      </button>
      <button
        className="bg-orange-400 text-black font-bold rounded-lg px-3 py-2  disabled:opacity-50"
        onClick={send}
        disabled={!port}
      >
        Send IT
      </button>
    </main>
  );
}
