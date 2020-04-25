import React, { useState } from 'react';
import TimeControl from './components/TimeControl'
import RatingControl from './components/RatingControl'
import ColourControl from './components/ColourControl'
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';


const StartGame = () => {

  const [time, setTime] = useState("10+0")
  const [rating, setRating] = useState("800-1000")
  const [colour, setColour] = useState("R")

  return (
    <Grid container spacing={2}>
      <Grid item xs={6}>
        <TimeControl time={time} setTime={setTime}/>
      </Grid>
      <Grid item xs={6}>
        <RatingControl rating={rating} setRating={setRating} />
      </Grid>
      <Grid item xs={6}>
        <ColourControl colour={colour} setColour={setColour} />
      </Grid>
      <Grid item xs={6}>
        <Button variant="contained" fullWidth={true} >Go</Button>
      </Grid>
    </Grid>
  );
}

export default StartGame;
