import React, { useState, useEffect } from "react";
import { Box, Container, Grid } from "@material-ui/core";

import PlayerOnline from "./PlayerOnline";
import { getPlayerStatus } from "../../lichess";
import { logger } from "../../log";

const Player = ({ details: { id, name, colour, aiLevel, rating } }) => {
  const [online, setOnline] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      if (!aiLevel) {
        getPlayerStatus(id).then(([player]) => {
          logger.info({ event: "lichess-user-status", data: player });
          setOnline(player.online);
        });
      }
    }, 5000);
    return () => {
      clearInterval(interval);
    };
  }, [id, aiLevel]);

  return (
    <Container>
      <Box m={2} border={1} textAlign={colour === "white" ? "right" : "left"}>
        <Grid
          container
          spacing={2}
          direction={colour === "white" ? "row" : "row-reverse"}
        >
          <Grid item xs={2}>
            <PlayerOnline online={aiLevel ? true : online} />
          </Grid>
          <Grid item xs={4}>
            {aiLevel ? aiLevel : rating}
          </Grid>
          <Grid item xs={6}>
            {aiLevel ? "Stockfish level " + aiLevel : name}
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default Player;
