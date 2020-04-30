import React, { useState, useEffect } from "react";
import Chess from "chess.js";
import moment from "moment";

import { Container, Grid } from "@material-ui/core";

import Player from "./components/Player";
import Moves from "./components/Moves";
import GameControls from "./components/GameControls";
import Timer from "./components/Timer";

import { getBoardStream } from "../lichess";

const playerOrder = ["me", "opponent"];

const transformPlayerDetails = (myUserId, white, black) => {
  white.colour = "white";
  black.colour = "black";

  let players = [white, black];

  players.forEach((player) => {
    player.id === myUserId
      ? (player.opponent = false)
      : (player.opponent = true);
  });

  return {
    me: players.find((p) => !p.opponent),
    opponent: players.find((p) => p.opponent),
  };
};

const getEndTimes = (white, black) => {
  const timestamp = moment().endOf("second");

  return {
    white: moment(timestamp).add(white, "ms"),
    black: moment(timestamp).add(black, "ms"),
  };
};

const whoseTurn = (moves) => {
  return moves.length % 2 == 0 ? "white" : "black";
};

const isTicking = (moves, colour) => {
  if (moves.length < 2) {
    return false;
  }

  if (whoseTurn(moves) === colour) {
    return true;
  }

  return false;
};

const convertToPgn = (moves) => {
  let chess = new Chess();
  chess.load_pgn(moves, { sloppy: true });
  return chess.history();
};

const Game = ({ userId, gameId }) => {
  const [state, setState] = useState({
    players: null,
    moves: null,
    timers: null,
  });
  const { players, moves, timers } = state;

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
              setState({
                players: transformPlayerDetails(
                  userId,
                  value.white,
                  value.black
                ),
                moves: convertToPgn(value.state.moves),
                timers: getEndTimes(value.state.wtime, value.state.btime),
              });
              break;
            case "gameState":
              setState((state) => ({
                ...state,
                moves: convertToPgn(value.moves),
                timers: getEndTimes(value.wtime, value.btime),
              }));

              break;
            default:
              break;
          }

          return reader.read().then(read);
        })
      );
    });
  }, [gameId]);

  return (
    <Container>
      <Grid container spacing={2}>
        {playerOrder.map((player) => (
          <Grid item xs={6} key={player}>
            {players && <Player details={players[player]} />}
          </Grid>
        ))}
        {playerOrder.map((player) => (
          <Grid item xs={6} key={player}>
            {timers && (
              <Timer
                ticking={isTicking(moves, players[player].colour)}
                endTime={timers[players[player].colour]}
              />
            )}
          </Grid>
        ))}
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
