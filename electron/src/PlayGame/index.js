import React, { useState, useEffect } from "react";
import useWebSocket from "react-use-websocket";
import Chess from "chess.js";
import swal from "sweetalert";

import { Button, Grid, Box, Modal } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { grey } from "@material-ui/core/colors";

import PlayerDetails from "./components/PlayerDetails";
import Moves from "./components/Moves";
import ConfirmMove from "./components/ConfirmMove";
import Timer from "./components/Timer";
import PawnPromotion from "./components/PawnPromotion";
import Loading from "../Loading";
import BoardChanges from "./components/BoardChanges";
import Result from "./components/Result";

import { logger } from "../log";
import { makeBoardMove, resignGame, requestDraw } from "../lichess";
import { useBoardEventStream } from "./hooks/useBoardEventStream";
import {
  playerOrder,
  loadPGN,
  moveToUCI,
  transformPlayerDetails,
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

const PlayGame = ({ myProfile, gameId, setGameId }) => {
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
    lastUpdateTime: null,
    resetSent: false,
    sentMoves: [],
    gameStatus: "",
    gameWinner: "",
    gameOver: false,
  });

  const handlePawnPromotionModalOpen = () => setPawnPromotionModalOpen(true);
  const handlePawnPromotionModalClose = () => setPawnPromotionModalOpen(false);

  const leaveGame = () => {
    setGameId(undefined);
  };

  const resign = () => {
    swal({
      title: "Resign?",
      text: "Are you sure you want to resign?",
      icon: "warning",
      buttons: true,
      dangerMode: true,
    }).then((reallyResign) => {
      if (reallyResign) resignGame(gameId);
    });
  };

  const offerDraw = () => {
    swal({
      title: "Offer draw?",
      text: "Are you sure you want to offer a draw?",
      icon: "warning",
      buttons: true,
      dangerMode: true,
    }).then((reallyDraw) => {
      if (reallyDraw) requestDraw(gameId);
    });
  };

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
            timers: {
              white: boardEvent.state.wtime,
              black: boardEvent.state.btime,
            },
            lastUpdateTime: Date.now(),
            sentMoves: moves,
            gameStatus: boardEvent.state.status,
            gameWinner: boardEvent.state.winner,
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
            timers: { white: boardEvent.wtime, black: boardEvent.btime },
            lastUpdateTime: Date.now(),
            gameStatus: boardEvent.status,
            gameWinner: boardEvent.winner,
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
    if (
      state.gameStatus !== "" &&
      state.gameStatus !== "created" &&
      state.gameStatus !== "started"
    ) {
      setState((state) => ({
        ...state,
        gameOver: true,
      }));
    }
  }, [state.gameStatus]);

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
          setAutopatzerdMove((autopatzerdMove) => {
            if (autopatzerdMove !== "") {
              setBoardChanges({
                gained: [],
                lost: [],
              });
            }
            return {
              ...autopatzerdMove,
              confirmed: true,
            };
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
      <Box p={2} bgcolor={grey[50]}>
        <Grid container spacing={2}>
          {playerOrder.map((p) => {
            return (
              <Grid item xs={6} key={`details-${p}`}>
                <PlayerDetails details={state.players[p]} />
              </Grid>
            );
          })}
          {playerOrder.map((p) => {
            return (
              <Grid item xs={6} key={`timer-${p}`}>
                <Timer
                  ticking={
                    state.board.history().length >= 2 &&
                    !state.gameOver &&
                    state.board.turn() === p.charAt(0)
                  }
                  millisecs={state.timers[p]}
                  startTime={state.lastUpdateTime}
                />
              </Grid>
            );
          })}
          <Grid item xs={6}>
            <Moves board={state.board} />
          </Grid>
          <Grid container item xs={6}>
            <Grid
              container
              spacing={1}
              item
              style={{ flexDirection: "column" }}
            >
              <Grid
                item
                xs={12}
                style={{
                  flex: "1",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                }}
              >
                {state.gameOver && (
                  <Result
                    gameWinner={state.gameWinner}
                    gameStatus={state.gameStatus}
                  />
                )}
                {!state.gameOver && (
                  <>
                    <Box mb={1}>
                      <BoardChanges boardChanges={boardChanges} />
                    </Box>
                    <ConfirmMove
                      autopatzerdMove={autopatzerdMove}
                      setAutopatzerdMove={setAutopatzerdMove}
                      setBoardChanges={setBoardChanges}
                    />
                  </>
                )}
              </Grid>
              <Grid container item spacing={1} style={{ flex: 0 }}>
                <Grid item xs={4}>
                  <Button
                    variant="contained"
                    fullWidth={true}
                    onClick={leaveGame}
                    style={{ whiteSpace: "nowrap" }}
                  >
                    Leave game
                  </Button>
                </Grid>
                <Grid item xs={4}>
                  <Button
                    variant="contained"
                    fullWidth={true}
                    onClick={resign}
                    style={{ whiteSpace: "nowrap" }}
                  >
                    Resign
                  </Button>
                </Grid>
                <Grid item xs={4}>
                  <Button
                    variant="contained"
                    fullWidth={true}
                    onClick={offerDraw}
                    style={{ whiteSpace: "nowrap" }}
                  >
                    Offer draw
                  </Button>
                </Grid>
              </Grid>
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
