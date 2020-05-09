import React from "react";
import { Button, ButtonGroup, Grid, Typography } from "@material-ui/core";

const colourRanges = ["white", "random", "black"];

const ColourControl = ({ colour, setColour }) => {
  const colourButtons = colourRanges.map((c) => (
    <Button
      variant="contained"
      fullWidth={true}
      onClick={() => setColour(c)}
      color={colour === c ? "primary" : "default"}
      key={c}
    >
      {c}
    </Button>
  ));

  return (
    <Grid container>
      <Grid item xs={2}>
        <Typography variant="h6" align="center">
          Colour
        </Typography>
      </Grid>
      <Grid item xs={10}>
        <ButtonGroup variant="contained" fullWidth={true}>
          {colourButtons}
        </ButtonGroup>
      </Grid>
    </Grid>
  );
};

export default ColourControl;
