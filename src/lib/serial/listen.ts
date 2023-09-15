import { PKG_END, PKG_START } from "@/lib/constants";
import parse, { Message, MessageType } from "./parse";

const listen = async (
  reader: ReadableStreamDefaultReader<Uint8Array>,
  options: {
    onMessage?: (message: Message) => void;
    returnOn?: MessageType;
  }
) => {
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
        if (options.onMessage) options.onMessage(parse(message));
        if (options.returnOn && options.returnOn === parse(message).type) {
          return parse(message);
        }

        startMarkerFound = false;
      } else if (startMarkerFound) {
        // Append the character to the message
        message += currentChar;
      }
    }
  }
};

export default listen;
