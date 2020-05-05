import React, { useState, useEffect } from "react";
import useWebSocket, { ReadyState } from "react-use-websocket";
import Chess from "chess.js";

import { Container, Grid, Box } from "@material-ui/core";

import PlayerDetails from "./components/PlayerDetails";
import Moves from "./components/Moves";
import ConfirmMove from "./components/ConfirmMove";
import Timer from "./components/Timer";

import { getBoardEventStream, makeBoardMove } from "../lichess";
import {
  playerOrder,
  loadPGN,
  moveToUCI,
  transformPlayerDetails,
  getEndTimes,
} from "./utils.js";
import { logger } from "../log";

const autopatzerdHost = process.env.REACT_APP_AUTOPATZERD_WS;

const Game = ({ myProfile, gameId, resetAutopatzerd }) => {
  const autopatzerdSocketOptions = {
    retryOnError: true,
    shouldReconnect: () => true,
  };

  const { sendJsonMessage, lastJsonMessage, readyState } = useWebSocket(
    autopatzerdHost,
    autopatzerdSocketOptions
  );

  const [autopatzerdMove, setAutopatzerdMove] = useState({
    move: "",
    confirmed: false,
  });

  const [boardChanges, setBoardChanges] = useState({
    gained: [],
    lost: [],
  });

  const [state, setState] = useState({
    players: null,
    board: new Chess(),
    timers: null,
  });

  const handleBoardStreamEvent = (value) => {
    logger.info({ event: "lichess-board-stream", data: value });
    switch (value.type) {
      case "gameFull":
        setState({
          players: transformPlayerDetails(
            myProfile.id,
            value.white,
            value.black
          ),
          board: loadPGN(value.state.moves),
          timers: getEndTimes(value.state.wtime, value.state.btime),
        });
        break;
      case "gameState":
        setState((state) => ({
          ...state,
          board: loadPGN(value.moves),
          timers: getEndTimes(value.wtime, value.btime),
        }));
        break;
      default:
        break;
    }
  };

  const handleAutopatzerdMessage = (message) => {
    switch (message.op) {
      case "board":
        logger.info({ event: "autopatzerd-board", data: message });
        if (!message.move.length) {
          setAutopatzerdMove({
            move: "",
            confirmed: false,
          });
        } else {
          setAutopatzerdMove({
            ...autopatzerdMove,
            move: message.move,
          });
        }
        setBoardChanges({
          gained: message.gained,
          lost: message.lost,
        });
        break;
      case "button":
        logger.info({ event: "autopatzerd-button", data: message });
        setAutopatzerdMove({
          ...autopatzerdMove,
          confirmed: true,
        });
        setBoardChanges({
          gained: [],
          lost: [],
        });
        break;
      case "error":
        logger.error({ event: "autopatzerd-error", data: message });
        break;
      case "ping":
        logger.debug({ event: "autopatzerd-ping", data: message });
        break;
      default:
        break;
    }
  };

  const sendAutopatzerdMessage = (message) => {
    logger.info({ event: "autopatzerd-play", data: message });
    sendJsonMessage(message);
  };

  useEffect(() => {
    if (readyState === ReadyState.OPEN && resetAutopatzerd) {
      const message = { op: "reset" };
      logger.info({ event: "autopatzerd-reset", data: message });
      sendJsonMessage.send(message);
    }
  }, [readyState, resetAutopatzerd, sendJsonMessage]);

  useEffect(() => {
    if (lastJsonMessage && lastJsonMessage.op) {
      handleAutopatzerdMessage(lastJsonMessage);
    }
  }, [lastJsonMessage]);

  useEffect(() => {
    const moves = state.board.history();
    if (moves.length) {
      sendAutopatzerdMessage({
        op: "play",
        move: moves.slice(-1)[0],
      });
    }
  }, [state.board]);

  useEffect(() => {
    if (autopatzerdMove.move && autopatzerdMove.confirmed) {
      makeBoardMove(gameId, moveToUCI(state.board, autopatzerdMove.move)).then(
        () => {
          setAutopatzerdMove({
            move: "",
            confirmed: false,
          });
        }
      );
    }
  }, [autopatzerdMove, gameId]);

  useEffect(() => {
    getBoardEventStream(gameId).then((stream) => {
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

          handleBoardStreamEvent(value);

          return reader.read().then(read);
        })
      );
    });
  }, [gameId]);

  return (
    <Container>
      <Grid container spacing={2}>
        <Grid item xs={6}>
          <Grid item xs={12} key={playerOrder[0]}>
            {state.players && (
              <PlayerDetails details={state.players[playerOrder[0]]} />
            )}
          </Grid>
          <Grid item xs={12} key={playerOrder[0]}>
            {state.timers && (
              <Timer
                board={state.board}
                colour={playerOrder[0]}
                endTime={state.timers[playerOrder[0]]}
              />
            )}
          </Grid>
          <Grid item xs={12}>
            {state.board && <Moves board={state.board} />}
          </Grid>
          {autopatzerdMove.move && !autopatzerdMove.confirmed && (
            <Grid item xs={12}>
              <ConfirmMove
                autopatzerdMove={autopatzerdMove}
                setAutopatzerdMove={setAutopatzerdMove}
              />
            </Grid>
          )}
        </Grid>
        <Grid item xs={6}>
          <Grid item xs={12} key={playerOrder[1]}>
            {state.players && (
              <PlayerDetails details={state.players[playerOrder[1]]} />
            )}
          </Grid>
          <Grid item xs={12} key={playerOrder[1]}>
            {state.timers && (
              <Timer
                board={state.board}
                colour={playerOrder[1]}
                endTime={state.timers[playerOrder[1]]}
              />
            )}
          </Grid>
          <Grid item xs={12}>
            {boardChanges.gained.length !== 0 && (
              <Container>
                <Box m={2} align="center" text-align="center" color="green">
                  Gained:
                  {boardChanges.gained.join(", ")}
                </Box>
              </Container>
            )}
          </Grid>
          <Grid item xs={12}>
            {boardChanges.lost.length !== 0 && (
              <Container>
                <Box m={2} align="center" text-align="center" color="red">
                  Lost:
                  {boardChanges.lost.join(", ")}
                </Box>
              </Container>
            )}
          </Grid>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Game;
