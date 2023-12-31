import { Message } from "./parse";
import { serialize } from "./serialize";

const send = async (
  port: SerialPort,
  message: Message,
  onSend?: (message: string) => void
) => {
  const encoder = new TextEncoder();

  // Modify your message to include the start and end markers

  const data = encoder.encode(serialize(message));

  const writer = port?.writable?.getWriter();

  if (!writer) return;

  await writer.write(data);

  if (onSend) onSend(serialize(message));

  writer.releaseLock();
};

export default send;
