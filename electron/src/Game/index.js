import React, { useState, useEffect } from "react";

import { Container, Grid } from "@material-ui/core";

import User from "./components/User";
import Moves from "./components/Moves";
import GameControls from "./components/GameControls";

import { getBoardStream } from "../lichess";

const Game = ({ gameId }) => {
  const [game, setGame] = useState(null);
  const [moves, setMoves] = useState([]);

  useEffect(() => {
    getBoardStream(gameId).then((stream) => {
      let read;
      const reader = stream.getReader();
      reader.read().then(
        (read = ({ done, value }) => {
          if (done && done === true) {
            return;
          }

          if (!value.type) {
            return;
          }

          switch (value.type) {
            case "gameFull":
              setGame(value);
              setMoves(value.state.moves.split(" "));
              break;
            case "gameState":
              setMoves(value.moves.split(" "));
          }

          return reader.read().then(read);
        })
      );
    });
  }, [gameId]);

  return (
    <Container>
      <Grid container spacing={2}>
        <Grid item xs={6}>
          {game && <User user={game.white} colour="white" />}
        </Grid>
        <Grid item xs={6}>
          {game && <User user={game.black} colour="black" />}
        </Grid>
        <Grid item xs={6}>
          <Moves moves={moves} />
        </Grid>
        <Grid item xs={6}>
          <GameControls />
        </Grid>
      </Grid>
    </Container>
  );
};

export default Game;
