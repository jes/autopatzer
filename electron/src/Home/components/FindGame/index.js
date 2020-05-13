import React, { useState, useEffect } from "react";

import {
  Box,
  Grid,
  Button,
  CircularProgress,
  Divider,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { green, grey } from "@material-ui/core/colors";

import TimeControl from "./components/TimeControl";
import ColourControl from "./components/ColourControl";
import AILevelControl from "./components/AILevelControl";
import RatedControl from "./components/RatedControl";
import { logger } from "../../../log";

import { createSeek, challengeAI } from "../../../lichess";
import { useLichessEventStream } from "./hooks/useLichessEventStream";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    alignItems: "center",
  },
  wrapper: {
    margin: theme.spacing(1),
    position: "relative",
  },
  buttonProgress: {
    color: green[500],
    position: "absolute",
    top: "50%",
    left: "50%",
    marginTop: -12,
    marginLeft: -12,
  },
}));

const StartGame = ({ gamesInProgress, startGame }) => {
  const classes = useStyles();

  const { lichessEvent, lichessEventError } = useLichessEventStream();

  const [time, setTime] = useState({ time: 15, increment: 10 });
  const [colour, setColour] = useState("random");
  const [rated, setRated] = useState(false);
  const [aiLevel, setAILevel] = useState(1);
  const [findingGame, setFindingGame] = useState(false);
  const [findingAIGame, setFindingAIGame] = useState(false);

  useEffect(() => {
    if (lichessEvent !== null) {
      logger.info({ event: "lichess-event-stream", data: lichessEvent });

      if (lichessEvent.type === "gameStart") {
        if (
          !gamesInProgress.some((g) => g["gameId"] === lichessEvent.game.id)
        ) {
          setFindingGame(false);
          startGame(lichessEvent.game.id);
        }
      }
    }
  }, [lichessEvent, gamesInProgress, startGame]);

  useEffect(() => {
    logger.error({ event: "lichess-event-stream", data: lichessEventError });
  }, [lichessEventError]);

  return (
    <Box p={2} bgcolor={grey[50]}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <TimeControl time={time} setTime={setTime} />
        </Grid>
        <Grid item xs={12}>
          <ColourControl colour={colour} setColour={setColour} />
        </Grid>
        <Grid item xs={12}>
          <RatedControl rated={rated} setRated={setRated} />
        </Grid>
        <Grid item xs={12}>
          <Divider />
        </Grid>
        <Grid item xs={12}>
          <AILevelControl aiLevel={aiLevel} setAILevel={setAILevel} />
        </Grid>
        <Grid item xs={12}>
          <Divider />
        </Grid>
        <Grid item xs={6}>
          <div className={classes.wrapper}>
            <Button
              variant="contained"
              fullWidth={true}
              disabled={findingGame}
              onClick={() => {
                setFindingGame(true);
                createSeek(time, colour, rated);
              }}
            >
              {findingGame ? "Seeking Opponent" : "Seek Opponent"}
            </Button>
            {findingGame && (
              <CircularProgress size={24} className={classes.buttonProgress} />
            )}
          </div>
        </Grid>
        <Grid item xs={6}>
          <div className={classes.wrapper}>
            <Button
              variant="contained"
              fullWidth={true}
              disabled={findingAIGame}
              onClick={() => {
                setFindingAIGame(true);
                challengeAI(aiLevel, time, colour);
              }}
            >
              {findingAIGame ? "Starting AI Game" : "Challenge AI"}
            </Button>
            {findingAIGame && (
              <CircularProgress size={24} className={classes.buttonProgress} />
            )}
          </div>
        </Grid>
      </Grid>
    </Box>
  );
};

export default StartGame;
