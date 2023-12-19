import {
  PKG_COMM_DELIMITER,
  PKG_DATA_DELIMITER,
  PKG_KEY_VALUE_DELIMITER,
} from "../constants";

export interface Message {
  type: MessageType;
  data?: Record<string, any>;
}

export type MessageType =
  | (string & {})
  | "OK"
  | "CUR_POS"
  | "CONN"
  | "DISCONN"
  | "MOVE"
  | "CALIBRATE"
  | "SPEED"
  | "MOVEL"
  | "MOVER";

export default function parse(input: string): Message {
  const type = input.split(PKG_COMM_DELIMITER)[0];

  const raw = input.split(PKG_COMM_DELIMITER)[1];

  const data = raw?.split(PKG_DATA_DELIMITER).reduce((prev, curr) => {
    const [key, value] = curr.split(PKG_KEY_VALUE_DELIMITER);
    return { ...prev, [key]: value };
  }, {});

  return {
    type,
    data,
  };
}
