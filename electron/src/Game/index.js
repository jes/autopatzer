import React, { useState, useEffect } from "react";
import useWebSocket, { ReadyState } from "react-use-websocket";
import Chess from "chess.js";

import { Container, Grid } from "@material-ui/core";

import Player from "./components/Player";
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

  const [state, setState] = useState({
    players: null,
    board: new Chess(),
    timers: null,
  });

  const handleBoardStreamEvent = (value) => {
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
        console.log("Board update from autopatzerd: ", message);
        if (message.move) {
          setAutopatzerdMove({
            ...autopatzerdMove,
            move: message.move,
          });
        }
        break;
      case "button":
        console.log("Button press from autopatzerd: ", message);
        setAutopatzerdMove({
          ...autopatzerdMove,
          confirmed: true,
        });
        break;
      case "error":
        console.log("Error from autopatzerd: ", message);
        break;
      case "ping":
        break;
      default:
        break;
    }
  };

  const sendAutopatzerdMessage = (message) => {
    console.log("Sending move to autopatzerd: ", message);
    sendJsonMessage(message);
  };

  useEffect(() => {
    if (readyState === ReadyState.OPEN && resetAutopatzerd) {
      console.log("Sending reset to autopatzerd");
      sendJsonMessage.send({ op: "reset" });
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
  }, [autopatzerdMove]);

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
  }, []);

  return (
    <Container>
      <Grid container spacing={2}>
        <Grid item xs={6}>
          <Grid item xs={12} key={playerOrder[0]}>
            {state.players && (
              <Player details={state.players[playerOrder[0]]} />
            )}
          </Grid>
          <Grid item xs={12} key={playerOrder[0]}>
            {state.timers && (
              <Timer
                board={state.board}
                colour={state.players[playerOrder[0]].colour}
                endTime={state.timers[state.players[playerOrder[0]].colour]}
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
              <Player details={state.players[playerOrder[1]]} />
            )}
          </Grid>
          <Grid item xs={12} key={playerOrder[1]}>
            {state.timers && (
              <Timer
                board={state.board}
                colour={state.players[playerOrder[1]].colour}
                endTime={state.timers[state.players[playerOrder[1]].colour]}
              />
            )}
          </Grid>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Game;
