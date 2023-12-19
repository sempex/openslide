#include <AccelStepper.h>

#define stepPin 5
#define dirPin 4
#define btnOne 14
#define btnTwo 13

const byte MAXIMUM_INPUT_LENGTH = 50;
const int  MAX_STEPS = 3000;
const char PKG_START = '<';
const char PKG_END = '>';
const char PKG_COMM_DELIMITER = ':';
const char PKG_DATA_DELIMITER = ',';
const char PKG_KEY_VALUE_DELIMITER = '=';

String input = "";

struct Message
{
  String type;
  String keys[10];   // Adjust the size according to your needs
  String values[10]; // Adjust the size according to your needs
  int dataCount;
};


int start = 0;
int end = 0;

AccelStepper stepper(AccelStepper::DRIVER, stepPin, dirPin);


void calibrate() {
  stepper.setMaxSpeed(400);
  stepper.setAcceleration(4000);
  stepper.moveTo(20000);
  while (digitalRead(btnOne) == HIGH) {
    stepper.run();
    yield();
  }

  stepper.setCurrentPosition(0);
  stepper.moveTo(-20000);
  while (digitalRead(btnTwo) == HIGH) {
    stepper.run();
    yield();
  }
  end = stepper.currentPosition();
  goTo(50);
  Serial.println("<OK:Endposition=set>");
  Serial.println("<OK:Startposition=set>");
  
}

void setup() {
  Serial.begin(9600);
  stepper.setMaxSpeed(750);
  stepper.setAcceleration(4000);
  pinMode(btnOne, INPUT);
  pinMode(btnTwo, INPUT);
}

void goTo(int persPos) {
  persPos = map(persPos, 0, 100, start - 100, end +100);
  
  stepper.stop();
  stepper.moveTo(persPos);
  
  while (stepper.distanceToGo() != 0) {
    stepper.run();  // Add a small delay to avoid busy-waiting
    yield();
  }
}

void emergencyOut(){
  if (digitalRead(btnTwo) == LOW || digitalRead(btnOne) == LOW) {
    stepper.stop();
    Serial.println("<ERROR:message=Unexpected endpoint hit!>");
  }  
}


void loop()
{
  input = "";
  bool startMarkerFound = false; // Flag to track whether the start marker is found

  // Wait for the start marker
  while (Serial.available())
  {
    char currentChar = Serial.read();
    if (currentChar == PKG_START)
    {
      startMarkerFound = true;
      break;
    }
  }

  // Continue reading if the start marker is found
  if (startMarkerFound)
  {
    // Read the input until the end marker or maximum length is reached
    char currentInput;
    unsigned long startTime = millis();
    while (millis() - startTime < 1000)
    { // Timeout after 1 second
      if (Serial.available())
      {
        currentInput = Serial.read();
        if (currentInput == PKG_END || input.length() >= MAXIMUM_INPUT_LENGTH)
        {
          break; // Exit the loop when the end marker is found or max length reached
        }
        input += currentInput;
      }
    }
    // Print the received input
    Message res = parse(input);
    Serial.println("<OK:pos=19>"); // Send an acknowledgement

    if (res.type == "CONN")
    {
      Serial.println("<CONN:v=1,name=OpenSlide>");
    }
    else if (res.type == "CALIBRATE") {
      calibrate();
      Serial.println("<OK:Calibrated>");
    }
    else if (res.type == "MOVE")
    {
      int start = res.values[0].toInt();
      int end = res.values[1].toInt();

      goTo(start);
      delay(1000);
      goTo(end);
      
      char buffer[30];
      
      sprintf(buffer, "<OK:will move=%d>", start);
      
      Serial.println(buffer);
    }
    else if (res.type == "GET")
    {
      Serial.println("<OK:pos=19>");
    }
    else if (res.type == "SPEED") {
      int speed = map(res.values[0].toInt(), 0, 100, 5, 3000);
      stepper.setMaxSpeed(speed);
      stepper.setAcceleration(speed * 4);
    }
    else if (res.type == "MOVEL")
    {
      int position = stepper.currentPosition();
      position = position + end * (res.values[0].toInt() / 10);
      goTo(position);

    }
    else if (res.type == "MOVER")
    {
      Serial.println("<OK:pos=19>");
    }
    else if (res.type == "DISC")
    {
      Serial.println("<OK:pos=19>");
    }
    else if (res.type == "PING")
    {
      Serial.println("<OK:pos=19>");
    }
    else if (res.type == "ERROR")
    {
      Serial.println("<OK:pos=19>");
    }
    else
    {
      Serial.println("<ERROR:pos=19>");
    }
  }
}

Message parse(const String &input)
{
  int delimiterPos = input.indexOf(PKG_COMM_DELIMITER);
  if (delimiterPos == -1)
  {
    return {}; // Invalid input
  }

  String type = input.substring(0, delimiterPos);
  String raw = input.substring(delimiterPos + 1);

  Message message;
  message.type = type;
  message.dataCount = 0;

  int startPos = 0;
  while (startPos != -1)
  {
    int keyValueDelimiterPos = raw.indexOf(PKG_KEY_VALUE_DELIMITER, startPos);
    if (keyValueDelimiterPos == -1)
    {
      break; // No more key-value pairs
    }

    String key = raw.substring(startPos, keyValueDelimiterPos);
    startPos = keyValueDelimiterPos + 1;

    int dataDelimiterPos = raw.indexOf(PKG_DATA_DELIMITER, startPos);
    String value = raw.substring(startPos, dataDelimiterPos == -1 ? raw.length() : dataDelimiterPos);
    startPos = (dataDelimiterPos == -1) ? -1 : dataDelimiterPos + 1;

    message.keys[message.dataCount] = key;
    message.values[message.dataCount] = value;
    message.dataCount++;

    if (message.dataCount >= 10)
    {
      break; // Maximum number of key-value pairs reached
    }
  }
  return message;
}
