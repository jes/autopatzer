import React, { useState, useEffect } from "react";
import { Box, Grid, Typography } from "@material-ui/core";

import PlayerOnline from "./PlayerOnline";
import { getPlayerStatus } from "../../lichess";
import { logger } from "../../log";

const Player = ({ details: { id, name, colour, aiLevel, rating } }) => {
  const [online, setOnline] = useState(false);

  const updatePlayerOnlineStatus = () => {
    if (!aiLevel) {
      getPlayerStatus(id).then(([player]) => {
        logger.info({ event: "lichess-user-status", data: player });
        setOnline(player.online);
      });
    }
  };

  useEffect(() => {
    updatePlayerOnlineStatus();

    const interval = setInterval(() => {
      updatePlayerOnlineStatus();
    }, 5000);
    return () => clearInterval(interval);
  }, [id, aiLevel]);

  return (
    <Box p={2} textAlign={colour === "white" ? "right" : "left"} boxShadow={1}>
      <Grid
        container
        spacing={2}
        direction={colour === "white" ? "row" : "row-reverse"}
      >
        <Grid item xs={2}>
          <Typography variant="h6">
            <PlayerOnline online={aiLevel ? true : online} />
          </Typography>
        </Grid>
        <Grid item xs={2}>
          <Typography variant="h6">{aiLevel ? aiLevel : rating}</Typography>
        </Grid>
        <Grid item xs={8}>
          <Typography variant="h6">{aiLevel ? "stockfish" : name}</Typography>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Player;
