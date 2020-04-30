import React from "react";
import { Box, Container, Grid } from "@material-ui/core";

import PlayerColour from "./PlayerColour";

const Player = ({ details: { opponent, colour, aiLevel, rating, id } }) => {
  return (
    <Container>
      <Box m={2} border={1}>
        <Grid
          container
          spacing={2}
          direction={opponent ? "row-reverse" : "row"}
        >
          <Grid item xs={2}>
            <PlayerColour colour={colour} />
          </Grid>
          <Grid item xs={4}>
            {aiLevel ? aiLevel : rating}
          </Grid>
          <Grid item xs={6}>
            {aiLevel ? "A.I." : id}
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default Player;
