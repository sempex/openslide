"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

export default function Home() {
  const [port, setPort] = useState<SerialPort | null>(null);
  const [message, setMessage] = useState<string>("");

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

        if (currentChar === "<") {
          // Start marker found, reset the message
          message = "";
          startMarkerFound = true;
        } else if (currentChar === ">" && startMarkerFound) {
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

      {message}
    </main>
  );
}
