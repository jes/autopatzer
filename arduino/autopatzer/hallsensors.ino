/* Hall sensor code for autopatzer
 *  
 * James Stanley 2020
 */

const int pieceSettleMs = 50; // don't report a square changed until it has settled for N ms

bool squareOccupied[64];
bool realSquareOccupied[64];
unsigned long lastChange[64];

// map sensor locations to actual squares (0=a1, 7=a8, 8=b1, 56=h1, 63=h8)
int squareMap[64] = {
  36, 29, 18, 43, 59, 12, 49,  4,
  32, 31, 21, 45, 61, 15, 52,  0,
  34, 26, 20, 42, 56,  9, 54,  2,
  38, 24, 16, 44, 60, 11, 50,  5,
  35, 27, 17, 40, 58, 10, 53,  7,
  37, 30, 19, 47, 63, 13, 55,  6,
  39, 28, 23, 46, 62,  8, 51,  3,
  33, 25, 22, 41, 57, 14, 48,  1,
};

// we set a different threshold for each square
int analogThreshold[64] = {
//  1    2    3    4    5    6    7    8
  715, 745, 695, 705, 690, 650, 690, 730, // a
  715, 680, 715, 735, 675, 725, 675, 730, // b
  740, 705, 695, 655, 680, 710, 730, 715, // c
  720, 690, 740, 720, 700, 690, 640, 715, // d
  710, 755, 670, 695, 640, 710, 715, 750, // e
  700, 745, 675, 705, 725, 690, 715, 705, // f
  660, 700, 630, 645, 710, 725, 720, 725, // g
  725, 675, 690, 680, 720, 675, 680, 710, // h
};

int bit1pin, bit2pin, bit3pin;

void initHallSensors(int bit1, int bit2, int bit3) {
  bit1pin = bit1;
  bit2pin = bit2;
  bit3pin = bit3;
  pinMode(bit1, OUTPUT);
  pinMode(bit2, OUTPUT);
  pinMode(bit3, OUTPUT);

  scanHallSensors();
  for (int i = 0; i < 64; i++)
    realSquareOccupied[i] = squareOccupied[i];
}

void waitHallSensors(int ms) {
  unsigned long start = millis();

  while (millis() < start+ms) {
    updateHallSensors();
  }
}

void updateHallSensors() {
  scanHallSensors();
  for (int i = 0; i < 64; i++) {
    if (millis() - lastChange[i] > pieceSettleMs && squareOccupied[i] != realSquareOccupied[i]) {
      realSquareOccupied[i] = squareOccupied[i];
      if (realSquareOccupied[i] ) {
        Serial.print("piecedown "); Serial.println(square2Name(i));
      } else {
        Serial.print("pieceup "); Serial.println(square2Name(i));
      }
    }
  }
}

void scanHallSensors() {
  for (int i = 0; i < 8; i++) {
    digitalWrite(bit1pin, i&1);
    digitalWrite(bit2pin, i&2);
    digitalWrite(bit3pin, i&4);
    // XXX: do we need to wait between writing to the bit pins and reading from the analogue pins?
    for (int j = 0; j < 8; j++) {
      updateSteppers(); // HACK: don't let scanHallSensors() block stepper motor operation
      int sqr = squareMap[i*8+j];
      int val = analogRead(j);
      bool occ = val > (analogThreshold[sqr] + 35);
      if (squareOccupied[sqr] != occ) {
        squareOccupied[sqr] = occ;
        lastChange[sqr] = millis();
      }
    }
  }
}

void analogScanHallSensors() {
  int maxRead[64];
  for (int i = 0; i < 64; i++)
    maxRead[i] = 0;
  for (int n = 0; n < 100; n++) {
  for (int i = 0; i < 8; i++) {
    digitalWrite(bit1pin, i&1);
    digitalWrite(bit2pin, i&2);
    digitalWrite(bit3pin, i&4);
    // XXX: do we need to wait between writing to the bit pins and reading from the analogue pins?
    for (int j = 0; j < 8; j++) {
      int sqr = squareMap[i*8+j];
      int val = analogRead(j);
      if (val > maxRead[sqr])
        maxRead[sqr] = val;
    }
  }
  delay(10);
  }

  for (int i = 0; i < 64; i++) {
    Serial.print(i); Serial.print(" = "); Serial.print(maxRead[i]); Serial.print("; ");
    if (i % 8 == 7)
      Serial.print("\n");
  }
}

// XXX: returns pointer to static buffer
char *square2Name(int square) {
  static char s[3];
  
  if (square < 0 || square > 63) {
    s[0] = 'x'; s[1] = 'x'; s[2] = 0;
    return s;
  }

  s[0] = (square/8) + 'a';
  s[1] = (square%8) + '1';
  s[2] = 0;
  return s;
}
