import React from "react";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChessKing } from "@fortawesome/free-solid-svg-icons";
import { grey } from "@material-ui/core/colors";

import {
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Box,
  Grid,
  Typography,
} from "@material-ui/core";

const GamesInProgress = ({ gamesInProgress, startGame }) => {
  const gamesInProgressListItems = gamesInProgress.map((g, index) => {
    const turn = g.isMyTurn ? "Your move" : "Their move";
    const gameType = `${g.variant.name} (${g.speed})`;
    const opponent = g.opponent.ai
      ? `Stockfish level ${g.opponent.ai}`
      : g.opponent.username;

    return (
      <ListItem
        button
        onClick={() => {
          startGame(g.gameId);
        }}
        key={g.gameId}
      >
        <ListItemIcon>
          <FontAwesomeIcon
            icon={faChessKing}
            style={{ color: g.color === "black" ? grey[900] : grey.A100 }}
          />
        </ListItemIcon>
        <ListItemText
          primary={`${index + 1}. ${turn} in ${gameType} against ${opponent}`}
          secondary={`Game ID: ${g.gameId}`}
          secondaryTypographyProps={{ style: { fontFamily: "monospace" } }}
        ></ListItemText>
      </ListItem>
    );
  });

  return (
    <Grid item container xs={12} spacing={2}>
      <Grid item xs={12}>
        <Typography variant="h6" align="center">
          {gamesInProgressListItems.length === 0
            ? "No Existing Games"
            : "Resume an Existing Game"}
        </Typography>
      </Grid>
      {gamesInProgressListItems.length !== 0 && (
        <Grid item xs={12}>
          <Box height="280px" overflow="auto">
            <List disablePadding={true}>{gamesInProgressListItems}</List>
          </Box>
        </Grid>
      )}
    </Grid>
  );
};

export default GamesInProgress;
