/* Main control code for autopatzer
 *  
 *  James Stanley 2020
 */

#define BUFSZ 128

const int pieceSettleMs = 50; // don't report a square changed until it has settled for N ms
const int maxMagnetIdleMs = 20000; // don't let magnet stay on while idle for more than N ms

extern bool squareOccupied[64];
extern unsigned long lastChange[64];
bool realSquareOccupied[64];

int magnetState = 0;
int squareSize = 480; // steps per square
unsigned long magnetActivated;
unsigned long lastMovement;

void setup() {
  Serial.begin(9600); // XXX: faster?

  // stepper motors
  initSteppers(3, 4, 5, 6, 7, 8);
  homeSteppers();

  // hall sensors
  initHallSensors(0, 1, 2);
  scanHallSensors();
  for (int i = 0; i < 64; i++)
    realSquareOccupied[i] = squareOccupied[i];

  // electromagnet
  pinMode(9, OUTPUT);
  
  Serial.println("autopatzer ready");
}

// x = rank, y = file
void movePiece(int startx, int starty, int endx, int endy) {
  targetSteppers(startx*480, starty*480, 0);
  while (!finishedSteppers()) updateSteppers();
  grabMagnet();
  targetSteppers(endx*480, endy*480, 1);
  while (!finishedSteppers()) updateSteppers();
  releaseMagnet();
}

int loops = 0;
int ts = 0;

void grabMagnet() {
  magnetActivated = millis();
  magnetState = 1;
  digitalWrite(9, HIGH);
}
void releaseMagnet() {
  magnetState = 0;
  digitalWrite(9, LOW);
}

void loop() {
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
  
  updateSteppers();
  updateSerial();

  if (!finishedSteppers())
    lastMovement = millis();

  if (magnetState && millis() - lastMovement > maxMagnetIdleMs && millis() - magnetActivated > maxMagnetIdleMs) {
    Serial.println("error: magnet on while idle, forcibly releasing");
    releaseMagnet();
  }
}

void updateSerial() {
  static char buf[BUFSZ];
  static int p;
  
  while (Serial.available() > 0) {
    char c = Serial.read();
    if (c == '\r' || c== '\n' || p == BUFSZ-1) {
      buf[p++] = 0;
      serialCommand(buf);
      p = 0;
    } else {
      buf[p++] = c;
    }
  }
}

void serialCommand(char *buf) {
  char **params = split(buf);

  if (strcmp(params[0], "help") == 0) {
    Serial.print(
      "autopatzer commands:\r\n"
      "   help           - show help\r\n"
      "   goto X Y       - move motors to (X,Y)\r\n"
      "   wait           - wait for motors to stop\r\n"
      "   grab           - switch electromagnet on\r\n"
      "   release        - switch electromagnet off\r\n"
      "   scan           - scan hall effect sensors\r\n"
      "   home           - re-home the motors\r\n"
    );
      
  } else if (strcmp(params[0], "goto") == 0) {
    if (!params[1] || !params[2]) {
      Serial.println("error: usage: goto X Y");
      return;
    }
  
    float x = atof(params[1]);
    float y = atof(params[2]);
    if (x < 0 || x > 9) {
      Serial.println("error: X must be from 0 to 9");
      return;
    }
    if (y < 0 || y > 9) {
      Serial.println("error: Y must be from 0 to 9");
      return;
    }

    targetSteppers(x * squareSize, y * squareSize, magnetState);
    
  } else if (strcmp(params[0], "wait") == 0) {
    if (!finishedSteppers()) {
      runSteppers();
      lastMovement = millis();
    }
    Serial.println("waited");
    
  } else if (strcmp(params[0], "grab") == 0) {
    grabMagnet();
    
  } else if (strcmp(params[0], "release") == 0) {
    releaseMagnet();
    
  } else if (strcmp(params[0], "scan") == 0) {
    Serial.print("occupied:");
    for (int i = 0; i < 64; i++) {
      if (realSquareOccupied[i]) {
        Serial.print(" ");
        Serial.print(square2Name(i));
      }
    }
    Serial.println("");
    
  } else if (strcmp(params[0], "home") == 0) {
    homeSteppers();
    
  }
}

// replace each space in buf with a \0, and return a (static!) nul-terminated array of pointers to the string parts
char **split(char *buf) {
  static char *parts[16];
  int n = 0;
  
  char *p = buf;
  while (*p && n < 15) {
    parts[n++] = p;
    while (*p && *p != ' ')
      p++;
    if (*p == ' ')
      *(p++) = 0;
  }
  parts[n++] = 0;
  
  return parts;
}
