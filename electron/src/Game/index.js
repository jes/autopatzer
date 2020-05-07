import React, { useState, useEffect } from "react";
import useWebSocket, { ReadyState } from "react-use-websocket";
import Chess from "chess.js";

import { Container, Grid, Box, Modal } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";

import PlayerDetails from "./components/PlayerDetails";
import Moves from "./components/Moves";
import ConfirmMove from "./components/ConfirmMove";
import Timer from "./components/Timer";
import PawnPromotion from "./components/PawnPromotion";

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

const useStyles = makeStyles((theme) => ({
  paper: {
    position: "absolute",
    width: "60%",
    top: "50%",
    left: "50%",
    transform: `translate(-50%, -50%)`,
    backgroundColor: theme.palette.background.paper,
    border: "1px solid #000",
  },
}));

const Game = ({ myProfile, gameId }) => {
  const classes = useStyles();

  const autopatzerdSocketOptions = {
    retryOnError: true,
    shouldReconnect: () => true,
  };

  const { sendJsonMessage, lastJsonMessage } = useWebSocket(
    autopatzerdHost,
    autopatzerdSocketOptions
  );

  const [autopatzerdMove, setAutopatzerdMove] = useState({
    move: "",
    confirmed: false,
  });

  const [pawnPromotionModalOpen, setPawnPromotionModalOpen] = useState(false);

  const [boardChanges, setBoardChanges] = useState({
    gained: [],
    lost: [],
  });

  const [state, setState] = useState({
    players: null,
    board: new Chess(),
    timers: null,
    resetSent: false,
  });

  const handlePawnPromotionModalOpen = () => setPawnPromotionModalOpen(true);
  const handlePawnPromotionModalClose = () => setPawnPromotionModalOpen(false);

  const sendAutopatzerdMessage = (message) => {
    logger.info({ event: `autopatzerd-${message.op}`, data: message });
    sendJsonMessage(message);
  };

  const handleBoardStreamEvent = (value) => {
    logger.info({ event: "lichess-board-stream", data: value });
    switch (value.type) {
      // We get one gameFull when the event stream opens
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
        sendAutopatzerdMessage({
          op: "reset",
          moves: loadPGN(value.state.moves).history(),
        });
        break;
      // Subsequent events are gameState
      case "gameState":
        setState((state) => ({
          ...state,
          board: loadPGN(value.moves),
          timers: getEndTimes(value.wtime, value.btime),
          // Set on the first (and subsequent) gameState events, implies we've seen the gameFull message and sent a reset to autopatzerd with the game's full move history
          resetSent: true,
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

  useEffect(() => {
    if (lastJsonMessage && lastJsonMessage.op) {
      handleAutopatzerdMessage(lastJsonMessage);
    }
  }, [lastJsonMessage]);

  useEffect(() => {
    const moves = state.board.history();
    if (state.resetSent && moves.length) {
      sendAutopatzerdMessage({
        op: "play",
        move: moves.slice(-1)[0],
      });
    }
  }, [state.board, state.resetSent]);

  useEffect(() => {
    let showModal = false;
    if (autopatzerdMove.move) {
      const [uci, pawnPromotion] = moveToUCI(state.board, autopatzerdMove.move);

      if (uci) {
        if (autopatzerdMove.confirmed) {
          makeBoardMove(gameId, uci).then(() => {
            setAutopatzerdMove({
              move: "",
              confirmed: false,
            });
          });
        } else if (!autopatzerdMove.pawnPromotionChosen && pawnPromotion) {
          showModal = true;
        }
      }
    }
    if (showModal) {
      handlePawnPromotionModalOpen();
    } else {
      handlePawnPromotionModalClose();
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
          <Grid item xs={12} key={`details-${playerOrder[0]}`}>
            {state.players && (
              <PlayerDetails details={state.players[playerOrder[0]]} />
            )}
          </Grid>
          <Grid item xs={12} key={`timer-${playerOrder[0]}`}>
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
          <Grid item xs={12} key={`details-${playerOrder[1]}`}>
            {state.players && (
              <PlayerDetails details={state.players[playerOrder[1]]} />
            )}
          </Grid>
          <Grid item xs={12} key={`timer-${playerOrder[1]}`}>
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
      <Modal
        open={pawnPromotionModalOpen}
        onClose={handlePawnPromotionModalClose}
      >
        <div className={classes.paper}>
          <PawnPromotion
            move={autopatzerdMove.move}
            setMove={setAutopatzerdMove}
            handleModalClose={handlePawnPromotionModalClose}
          />
        </div>
      </Modal>
    </Container>
  );
};

export default Game;
