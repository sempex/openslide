void setup()
{
  // initialize serial communication at 9600 bits per second:
  Serial.begin(9600);
}

// the loop routine runs over and over again forever:
void loop()
{
  if (Serial.available() > 0)
  {
    // read the incoming byte:
    int incomingByte = Serial.read();
    // say what you got:
    char byteString[10];

    // Convert the incoming byte to a string
    snprintf(byteString, sizeof(byteString), "%d", incomingByte);

    // say what you got as a string:
    Serial.print("I received: ");
    Serial.println(byteString);
  }

  delay(1); // delay in between reads for stability
}