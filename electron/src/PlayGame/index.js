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

import { logger } from "../log";
import { makeBoardMove } from "../lichess";
import { useBoardEventStream } from "./hooks/useBoardEventStream";
import {
  playerOrder,
  loadPGN,
  moveToUCI,
  transformPlayerDetails,
  getEndTimes,
} from "./utils.js";

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

  const { boardEvent, boardEventError } = useBoardEventStream(gameId);

  const { sendJsonMessage, lastJsonMessage } = useWebSocket(autopatzerdHost, {
    retryOnError: true,
    shouldReconnect: () => true,
  });

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

  useEffect(() => {
    if (boardEvent !== null) {
      logger.info({ event: "lichess-board-event-stream", data: boardEvent });
      switch (boardEvent.type) {
        // We get one gameFull when the event stream opens
        case "gameFull":
          let moves = loadPGN(boardEvent.state.moves).history();
          let msg = {
            op: "reset",
            moves: moves,
          };
          logger.info({ event: `autopatzerd-${msg.op}`, data: msg });
          sendJsonMessage(msg);
          let players = transformPlayerDetails(
            myProfile.id,
            boardEvent.white,
            boardEvent.black
          );
          setState({
            players: players,
            board: loadPGN(boardEvent.state.moves),
            timers: getEndTimes(boardEvent.state.wtime, boardEvent.state.btime),
            sentMoves: moves,
          });
          let iAmWhite = players.white.opponent === false;
          let whiteToMove = moves.length % 2 === 0;
          if (iAmWhite === whiteToMove) {
            // if the player is to move, send a wiggle to wake up the user as it is his turn to move
            const msg = { op: "wiggle" };
            logger.info({ event: `autopatzerd-${msg.op}`, data: msg });
            sendJsonMessage(msg);
          }
          break;
        // Subsequent events are gameState
        case "gameState":
          setState((state) => ({
            ...state,
            board: loadPGN(boardEvent.moves),
            timers: getEndTimes(boardEvent.wtime, boardEvent.btime),
            // Set on the first (and subsequent) gameState events, implies we've seen the gameFull message and sent a reset to autopatzerd with the game's full move history
            resetSent: true,
          }));
          break;
        default:
          break;
      }
    }
  }, [boardEvent, sendJsonMessage, myProfile]);

  useEffect(() => {
    logger.error({
      event: "lichess-board-event-stream",
      data: boardEventError,
    });
  }, [boardEventError]);

  useEffect(() => {
    if (lastJsonMessage && lastJsonMessage.op) {
      switch (lastJsonMessage.op) {
        case "board":
          logger.info({ event: "autopatzerd-board", data: lastJsonMessage });
          if (!lastJsonMessage.move.length) {
            setAutopatzerdMove({
              move: "",
              confirmed: false,
            });
          } else {
            setAutopatzerdMove((autopatzerdMove) => ({
              ...autopatzerdMove,
              move: lastJsonMessage.move,
            }));
          }
          setBoardChanges({
            gained: lastJsonMessage.gained,
            lost: lastJsonMessage.lost,
          });
          break;
        case "button":
          logger.info({ event: "autopatzerd-button", data: lastJsonMessage });
          setAutopatzerdMove((autopatzerdMove) => ({
            ...autopatzerdMove,
            confirmed: true,
          }));
          setBoardChanges({
            gained: [],
            lost: [],
          });
          break;
        case "error":
          logger.error({ event: "autopatzerd-error", data: lastJsonMessage });
          break;
        case "ping":
          logger.debug({ event: "autopatzerd-ping", data: lastJsonMessage });
          break;
        default:
          break;
      }
    }
  }, [lastJsonMessage, sendJsonMessage]);

  useEffect(() => {
    const moves = state.board.history();
    if (state.resetSent && moves.length > state.sentMoves.length) {
      for (let i = state.sentMoves.length; i < moves.length; i++) {
        const msg = {
          op: "play",
          move: moves[i],
        };
        logger.info({ event: `autopatzerd-${msg.op}`, data: msg });
        sendJsonMessage(msg);
      }
      setState((state) => ({
        ...state,
        sentMoves: moves,
      }));
    }
  }, [state.board, state.resetSent, state.sentMoves, sendJsonMessage]);

  useEffect(() => {
    let showModal = false;
    if (autopatzerdMove.move) {
      const [uci, pawnPromotion] = moveToUCI(state.board, autopatzerdMove.move);

      if (uci) {
        if (autopatzerdMove.confirmed) {
          logger.info({ event: "lichess-make-move", data: uci });
          makeBoardMove(gameId, uci);
          setAutopatzerdMove({
            move: "",
            confirmed: false,
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
  }, [state.board, autopatzerdMove, gameId]);

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
                    <Box
                      component="span"
                      m={2}
                      align="center"
                      text-align="center"
                      color="red"
                    >
                      - {boardChanges.lost.join(", ")}
                    </Box>
                  )}
                  {boardChanges.gained.length !== 0 && (
                    <Box
                      component="span"
                      m={2}
                      align="center"
                      text-align="center"
                      color="green"
                    >
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
                    setBoardChanges={setBoardChanges}
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
