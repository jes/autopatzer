/* Hall sensor code for autopatzer
 *  
 * James Stanley 2020
 */

bool squareOccupied[64];

// map sensor locations to actual squares (0=a1, 7=h1, 8=a2, 56=a8, 63=h8)
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

int bit1pin, bit2pin, bit3pin;

void initHallSensors(int bit1, int bit2, int bit3) {
  bit1pin = bit1;
  bit2pin = bit2;
  bit3pin = bit3;
  pinMode(bit1, OUTPUT);
  pinMode(bit2, OUTPUT);
  pinMode(bit3, OUTPUT);
}

void scanHallSensors() {
  for (int i = 0; i < 8; i++) {
    digitalWrite(bit1pin, i&1);
    digitalWrite(bit2pin, i&2);
    digitalWrite(bit3pin, i&4);
    // XXX: do we need to wait between writing to the bit pins and reading from the analogue pins?
    for (int j = 0; j < 8; j++) {
      int val = analogRead(j);
      squareOccupied[squareMap[i*8+j]] = val > 800;
    }
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
