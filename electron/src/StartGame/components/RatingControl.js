import React from 'react';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';

const ratingRanges = [
  "800-1000",
  "1000-1400",
  "1400-1800",
]

const RatingControl = ({rating, setRating}) => {

  const ratingButtons = ratingRanges.map((r) =>
    <Grid item xs={6} key={r} spacing={3}>
      <Button variant="contained" fullWidth={true} onClick={() => setRating(r)} color={rating === r ? "primary" : ""}>{r}</Button>
    </Grid>
  );

  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <Typography variant="h6" align="center">
          Rating Range
        </Typography>
      </Grid>
      {ratingButtons}
    </Grid>
  );
}

export default RatingControl;
