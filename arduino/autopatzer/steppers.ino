/* Stepper motor control code for autopatzer
 *  
 *  James Stanley 2020
 */

#include <AccelStepper.h>

AccelStepper stepper[2];

// configure max. velocity and acceleration while grabbed and not grabbed
const int maxvel[2] = {3000 /*released*/, 1000 /*grabbed*/}; // steps per sec
const int maxacc[2] = {20000 /*released*/, 10000 /*grabbed*/}; // steps per sec^2

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

void homeSteppers() {
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
