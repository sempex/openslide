import {
  PKG_COMM_DELIMITER,
  PKG_DATA_DELIMITER,
  PKG_END,
  PKG_KEY_VALUE_DELIMITER,
  PKG_START,
} from "../constants";
import { Message } from "./parse";

export function serialize(message: Message): string {
  const type = message.type;
  let dataString = "";

  if (message.data) {
    const dataEntries = Object.entries(message.data);
    dataString = dataEntries
      .map(([key, value]) => `${key}${PKG_KEY_VALUE_DELIMITER}${value}`)
      .join(PKG_DATA_DELIMITER);
  }

  return `${PKG_START}${type}${
    dataString.length > 0 ? PKG_COMM_DELIMITER : ""
  }${dataString}${PKG_END}`;
}
