import React, { useEffect, useCallback, useRef } from "react";

import Countdown from "react-countdown";

import { Box, Container } from "@material-ui/core";

const Timer = ({ board, colour, endTime }) => {
  const counter = useRef();

  const isTicking = useCallback(() => {
    if (board.history().length <= 2) {
      return false;
    }

    if (board.game_over()) {
      return false;
    }

    if (board.turn() === colour.charAt(0)) {
      return true;
    }

    return false;
  }, [board, colour]);

  useEffect(() => {
    if (isTicking()) {
      counter.current.api.start();
    } else {
      counter.current.api.pause();
    }
  }, [counter, board, colour, isTicking]);

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
