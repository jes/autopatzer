import React from "react";
import { Button, ButtonGroup, Grid, Typography } from "@material-ui/core";

const options = [true, false];

const RatedControl = ({ rated, setRated }) => {
  const ratedButtons = options.map((r) => (
    <Button
      color={rated === r ? "primary" : "default"}
      onClick={() => setRated(r)}
      key={`rated-${r}`}
    >
      {r ? "Yes" : "No"}
    </Button>
  ));

  return (
    <Grid container>
      <Grid item xs={2}>
        <Typography variant="h6" align="center">
          Rated
        </Typography>
      </Grid>
      <Grid item xs={10}>
        <ButtonGroup variant="contained" fullWidth={true}>
          {ratedButtons}
        </ButtonGroup>
      </Grid>
    </Grid>
  );
};

export default RatedControl;
