import React, { useState } from "react";
import useInterval from "use-interval";

import "typeface-anonymous-pro";

import { Box, Typography } from "@material-ui/core";

// https://stackoverflow.com/a/10073788
function pad(n, width, z) {
  z = z || '0';
  n = n + '';
  return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
}

const currentMillis = (millisecs) => {
  if (ticking) {
    millisecs -= Date.now() - startTime
  }
  return millisecs;
};

const evenTick = (millisecs) => {
  let secs = Math.floor(currentMillis(millisecs) / 1000);
  return secs%2 === 0;
};

const stringTime = (milisecs) => {
  let ms = currentMillis(millisecs);

  let hours = Math.floor(ms / (60*60*1000));
  ms -= hours * 60*60*1000;
  let mins = Math.floor(ms / (60*1000));
  ms -= mins * 60*1000;
  let secs = Math.floor(ms / 1000);
  ms -= secs * 1000;

  if (hours >= 1) { // >= 1 hour
    return pad(hours, 2) + "h" + pad(mins, 2) + "m";
  } else if (millisecs > 5*1000) { // >= 5 secs
    return pad(mins, 2) + ":" + pad(secs, 2);
  } else {
    return pad(mins, 2) + ":" + pad(secs, 2) + "." + pad(ms, 3);
  }
};

const Timer = ({ ticking, startTime, millisecs }) => {
  const [state, setState] = useState({
    millisecs: millisecs,
    startTime: startTime,
    txt: '',
  });

  // reset state when parameters to the component change
  if (startTime !== state.startTime) {
    setState({
      millisecs: millisecs,
      startTime: startTime,
      txt: stringTime(state.millisecs),
    });
  }

  // tick every 250ms instead of every 1000ms so that we catch the start of each
  // second more quickly -- we don't want to say you have 3 seconds left if you're
  // really down to 2.1 seconds (not that the physical board is fast enough to
  // reasonable use at that kind of time pressure anyway...)
  useInterval(() => {
    setState((state) => ({
      ...state,
      txt: stringTime(state.millisecs),
    }));
  }, 250);

  return (
    <Box align="center" text-align="center" boxShadow={1} style={{ backgroundColor:(ticking && evenTick(state.millisecs) ? '#edf3e8' : 'white') }}>
      <Typography variant="h2" style={{ fontFamily: "Anonymous Pro" }}>
        {state.txt}
      </Typography>
    </Box>
  );
};

export default Timer;
