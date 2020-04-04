/* Electromagnet code for autopatzer
 *  
 * James Stanley 2020
 */

const int maxMagnetIdleMs = 20000; // don't let magnet stay on while idle for more than N ms
bool magnetState = false;

void initMagnet() {
  pinMode(9, OUTPUT);
}

void updateMagnet() {
  if (magnetState && millis() - lastMovement > maxMagnetIdleMs && millis() - magnetActivated > maxMagnetIdleMs) {
    Serial.println("error: magnet on while idle, forcibly releasing");
    releaseMagnet();
  }
}
 
void grabMagnet() {
  magnetActivated = millis();
  magnetState = true;
  digitalWrite(9, HIGH);
}
void releaseMagnet() {
  magnetState = false;
  digitalWrite(9, LOW);
}
