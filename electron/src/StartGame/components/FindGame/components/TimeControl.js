import React from "react";
import { Button, ButtonGroup, Grid, Typography } from "@material-ui/core";

const timeRanges = [
  { time: 15, increment: 10 },
  { time: 30, increment: 0 },
  { time: 30, increment: 20 },
];

const TimeControl = ({ time, setTime }) => {
  const timeButtons = timeRanges.map((t) => (
    <Button
      onClick={() => setTime(t)}
      color={
        time.time === t.time && time.increment === t.increment
          ? "primary"
          : "default"
      }
      key={`${t.time}+${t.increment}`}
    >
      {`${t.time}+${t.increment}`}
    </Button>
  ));

  return (
    <Grid container>
      <Grid item xs={2}>
        <Typography variant="h6" align="center">
          Time
        </Typography>
      </Grid>
      <Grid item xs={10}>
        <ButtonGroup variant="contained" fullWidth={true}>
          {timeButtons}
        </ButtonGroup>
      </Grid>
    </Grid>
  );
};

export default TimeControl;
