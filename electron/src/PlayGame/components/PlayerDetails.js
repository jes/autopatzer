import React, { useState, useEffect, useCallback } from "react";
import { Box, Grid, Typography } from "@material-ui/core";

import useInterval from "use-interval";

import PlayerOnline from "./PlayerOnline";
import { getPlayerStatus } from "../../lichess";
import { logger } from "../../log";

const Player = ({ details: { id, name, colour, aiLevel, rating } }) => {
  const [online, setOnline] = useState(false);

  const updatePlayerOnlineStatus = useCallback(() => {
    if (!aiLevel) {
      getPlayerStatus(id).then(([player]) => {
        logger.info({ event: "lichess-user-status", data: player });
        setOnline(player.online);
      });
    }
  }, [id, aiLevel]);

  useInterval(() => {
    updatePlayerOnlineStatus();
  }, 5000);

  useEffect(() => {
    updatePlayerOnlineStatus();
  }, [updatePlayerOnlineStatus]);

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
          <Typography color="textSecondary" variant="h6">
            {aiLevel ? "" : rating}
          </Typography>
        </Grid>
        <Grid item xs={8}>
          <Typography variant="h6">
            {aiLevel ? "Stockfish level " + aiLevel : name}
          </Typography>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Player;
