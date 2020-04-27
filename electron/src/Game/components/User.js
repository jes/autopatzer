import React from "react";
import { Container, Grid } from "@material-ui/core";

import PlayerColour from "./PlayerColour";

const User = ({ user, colour }) => {
  return (
    <Container>
      <Grid container spacing={2}>
        <Grid item xs={6}>
          {user.aiLevel ? "A.I." : user.id}
        </Grid>
        <Grid item xs={4}>
          {user.aiLevel ? user.aiLevel : user.rating}
        </Grid>
        <Grid item xs={2}>
          <PlayerColour colour={colour} />
        </Grid>
      </Grid>
    </Container>
  );
};

export default User;
