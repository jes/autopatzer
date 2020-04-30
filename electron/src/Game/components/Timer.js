import React, { useEffect, useRef } from "react";

import Countdown from "react-countdown";

import { Box, Container } from "@material-ui/core";

const Timer = ({ ticking, endTime }) => {
  const counter = useRef();

  useEffect(() => {
    if (ticking) {
      counter.current.api.start();
    } else {
      counter.current.api.pause();
    }
  }, [counter, ticking, endTime]);

  return (
    <Container>
      <Box m={2} align="center" text-align="center" border={1}>
        <Countdown
          key={endTime}
          date={endTime.toDate()}
          intervalDelay={0}
          precision={3}
          autoStart={false}
          daysInHours={true}
          ref={counter}
        />
      </Box>
    </Container>
  );
};

export default Timer;
