import React from "react";
import Grid from "@material-ui/core/Grid";
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";

const timeRanges = ["10+0", "10+5", "30+0", "30+20"];

const TimeControl = ({ time, setTime }) => {
  const timeButtons = timeRanges.map((t) => (
    <Grid item xs={6} key={t}>
      <Button
        variant="contained"
        fullWidth={true}
        onClick={() => setTime(t)}
        color={time === t ? "primary" : "default"}
      >
        {t}
      </Button>
    </Grid>
  ));

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant="h6" align="center">
          Time Control
        </Typography>
      </Grid>
      {timeButtons}
    </Grid>
  );
};

export default TimeControl;