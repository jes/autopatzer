import React, { useEffect, useRef } from "react";

import Countdown from "react-countdown";

import { Box, Container } from "@material-ui/core";

const Timer = ({ board, colour, endTime }) => {
  const counter = useRef();

  const isTicking = () => {
    if (board.history().length <= 2) {
      return false;
    }

    if (board.turn() === colour.charAt(0)) {
      return true;
    }

    return false;
  };

  useEffect(() => {
    if (isTicking()) {
      counter.current.api.start();
    } else {
      counter.current.api.pause();
    }
  }, [counter, board, colour, endTime]);

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
