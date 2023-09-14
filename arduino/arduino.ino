const byte MAXIMUM_INPUT_LENGTH = 15;
const char PKG_START = '<';
const char PKG_END = '>';

String input = "";

void setup() {
  Serial.begin(9600);
}

void loop() {
  input = "";
  bool startMarkerFound = false; // Flag to track whether the start marker is found

  // Wait for the start marker
  while (Serial.available()) {
    char currentChar = Serial.read();
    if (currentChar == PKG_START) {
      startMarkerFound = true;
      break;
    }
  }

  // Continue reading if the start marker is found
  if (startMarkerFound) {
    // Read the input until the end marker or maximum length is reached
    char currentInput;
    unsigned long startTime = millis();
    while (millis() - startTime < 1000) { // Timeout after 1 second
      if (Serial.available()) {
        currentInput = Serial.read();
        if (currentInput == PKG_END || input.length() >= MAXIMUM_INPUT_LENGTH) {
          break; // Exit the loop when the end marker is found or max length reached
        }
        input += currentInput;
      }
    }

    // Print the received input
    Serial.println("<" + input + ">"); // Send an acknowledgement
  }
}
