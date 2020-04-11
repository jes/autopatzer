/* Stepper motor control code for autopatzer
 *  
 *  James Stanley 2020
 */

#include <AccelStepper.h>

AccelStepper stepper[2];

extern bool realSquareOccupied[64];

const int squareSize = 480; // steps per square

// configure max. velocity and acceleration while grabbed and not grabbed
const int maxvel[2] = {4000 /*released*/, 3000 /*grabbed*/}; // steps per sec
const int maxacc[2] = {20000 /*released*/, 6000 /*grabbed*/}; // steps per sec^2

const int home1 = 4330;
const int home2 = 4360;
const int extrahome = 200;

const bool invert1 = true;
const bool invert2 = false;

void initSteppers(int en1, int step1, int dir1, int en2, int step2, int dir2) {
  AccelStepper s0(AccelStepper::DRIVER, step1, dir1);
  pinMode(en1, OUTPUT);
  digitalWrite(en1, LOW);
  AccelStepper s1(AccelStepper::DRIVER, step2, dir2);
  pinMode(en2, OUTPUT);
  digitalWrite(en2, LOW);
  
  stepper[0] = s0;
  stepper[1] = s1;
}

void targetSteppers(int x, int y, int magnetState) {
  if (invert1)
    x = -x;
  if (invert2)
    y = -y;

  stepper[0].moveTo(x);
  stepper[0].setMaxSpeed(maxvel[magnetState]);
  stepper[0].setAcceleration(maxacc[magnetState]);
  
  stepper[1].moveTo(y);
  stepper[1].setMaxSpeed(maxvel[magnetState]);
  stepper[1].setAcceleration(maxacc[magnetState]);
}

void updateSteppers() {
  stepper[0].run();
  stepper[1].run();
}

void runSteppers() {
  while (!finishedSteppers())
    updateSteppers();
}

bool finishedSteppers() {
  return stepper[0].distanceToGo() == 0 && stepper[1].distanceToGo() == 0;
}

bool magnetHomeSteppers() {
  bool squareWasOccupied[64];

  delay(250);

  releaseMagnet();
  waitHallSensors(100);
  for (int i = 0; i < 64; i++)
    squareWasOccupied[i] = realSquareOccupied[i];
  grabMagnet();
  waitHallSensors(100);

  int homingSquare = -1;

  for (int i = 0; i < 64; i++) {
    if (realSquareOccupied[i] && !squareWasOccupied[i]) {
        homingSquare = i;
        break;
    }
  }

  if (homingSquare == -1) {
    releaseMagnet();
    return false;
  }

  // now move around to detect the centre point of where we're detected
  binarySearchOnSquare(0, homingSquare);
  binarySearchOnSquare(1, homingSquare);

  releaseMagnet();
  waitHallSensors(100);

  stepper[0].setCurrentPosition(squareSize * (homingSquare%8 + 1) * (invert1 ? -1 : 1));
  stepper[1].setCurrentPosition(squareSize * (homingSquare/8 + 1) * (invert2 ? -1 : 1));

  // TODO: validate by moving to an unoccupied square and switching the magnet on and off?

  return true;
}

void binarySearchOnSquare(int motor, int sqr) {
  const int threshold = 20;
  int minLimit = 0;
  int maxLimit = 0;
  int minpos, maxpos;

  stepper[motor].setCurrentPosition(0);
  stepper[0].setMaxSpeed(maxvel[0]);
  stepper[0].setAcceleration(maxacc[0]);
  
  minpos = -squareSize/2;
  maxpos = 0;
  // find the smallest position from minpos to maxpos that is occupied
  while (minpos+threshold < maxpos) {
    int midpos = (minpos+maxpos)/2;
    stepper[motor].moveTo(midpos);
    runSteppers();
    waitHallSensors(100);
    if (realSquareOccupied[sqr]) {
      maxpos = midpos;
    } else {
      minpos = midpos+1;
    }
  }
  minLimit = minpos;
  
  minpos = 0;
  maxpos = squareSize/2;
  // find the largest position from minpos to maxpos that is occupied
  while (minpos+threshold < maxpos) {
    int midpos = (minpos+maxpos)/2;
    stepper[motor].moveTo(midpos);
    runSteppers();
    waitHallSensors(100);
    if (!realSquareOccupied[sqr]) {
      maxpos = midpos-1;
    } else {
      minpos = midpos;
    }
  }
  maxLimit = minpos;

  // finally, move to the centre point of the min and max limit
  stepper[motor].moveTo((minLimit + maxLimit) / 2);
  runSteppers();
}

void homeSteppers() {
  // first try to home it using the electromagnet
  //if (magnetHomeSteppers())
  //  return;
    
  stepper[0].setCurrentPosition(0);
  stepper[1].setCurrentPosition(0);

  // "crash homing": just drive the maximum distance until we know we've crashed into the end
  targetSteppers(home1+extrahome, home2+extrahome, 0);
  runSteppers();

  // now drive back to 0,0 to home
  stepper[0].setCurrentPosition(home1 * (invert1 ? -1 : 1));
  stepper[1].setCurrentPosition(home2 * (invert2 ? -1 : 1));
  targetSteppers(0, 0, 0);
  runSteppers();
}
