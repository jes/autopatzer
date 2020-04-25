import React from 'react';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';

const colourRanges = [
  "W",
  "B",
  "R",
]

const ColourControl = ({colour, setColour}) => {

  const colourButtons = colourRanges.map((c) =>
    <Grid item xs={6} key={c} spacing={3}>
      <Button variant="contained" fullWidth={true} onClick={() => setColour(c)} color={colour === c ? "primary" : ""}>{c}</Button>
    </Grid>
  );

  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <Typography variant="h6" align="center">
          Colour
        </Typography>
      </Grid>
      {colourButtons}
    </Grid>
  );
}

export default ColourControl;
