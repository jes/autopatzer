import React, { useState, useEffect } from "react";
import useWebSocket from "react-use-websocket";
import Chess from "chess.js";

import { Container, Grid, Box, Modal } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";

import PlayerDetails from "./components/PlayerDetails";
import Moves from "./components/Moves";
import ConfirmMove from "./components/ConfirmMove";
import Timer from "./components/Timer";
import PawnPromotion from "./components/PawnPromotion";
import Loading from "../Loading";

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

const PlayGame = ({ myProfile, gameId }) => {
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
    sentMoves: [],
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
        let moves = loadPGN(value.state.moves).history();
        sendAutopatzerdMessage({
          op: "reset",
          moves: moves,
        });
        setState({
          players: transformPlayerDetails(
            myProfile.id,
            value.white,
            value.black
          ),
          board: loadPGN(value.state.moves),
          timers: getEndTimes(value.state.wtime, value.state.btime),
          sentMoves: moves,
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
    if (state.resetSent && moves.length > state.sentMoves.length) {
      for (let i = state.sentMoves.length; i < moves.length; i++) {
        sendAutopatzerdMessage({
          op: "play",
          move: moves[i],
        });
      }
      setState((state) => ({
        ...state,
        sentMoves: moves,
      }));
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

  if (!state.players) {
    return <Loading />;
  } else {
    return (
      <Box p={2}>
        <Grid container spacing={2}>
          <Grid container item xs={12} spacing={2}>
            {playerOrder.map((p) => {
              return (
                <Grid item xs={6} key={`details-${p}`}>
                  <PlayerDetails details={state.players[p]} />
                </Grid>
              );
            })}
          </Grid>
          <Grid container item xs={12} spacing={2}>
            {playerOrder.map((p) => {
              return (
                <Grid item xs={6} key={`timer-${p}`}>
                  <Timer
                    board={state.board}
                    endTime={state.timers[p]}
                    colour={p}
                  />
                </Grid>
              );
            })}
          </Grid>
          <Grid container item xs={12} spacing={2}>
            <Grid item xs={6}>
              <Moves board={state.board} />
            </Grid>
            <Grid item xs={6}>
              <Grid item xs={12}>
                <Container>
                  {boardChanges.lost.length !== 0 && (
                    <Box component="span" m={2} align="center" text-align="center" color="red">
                      - {boardChanges.lost.join(", ")}
                    </Box>
                  )}
                  {boardChanges.gained.length !== 0 && (
                    <Box component="span" m={2} align="center" text-align="center" color="green">
                      + {boardChanges.gained.join(", ")}
                    </Box>
                  )}
                </Container>
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
      </Box>
    );
  }
};

export default PlayGame;
