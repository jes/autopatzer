import React, { useState, useEffect } from "react";
import TimeControl from "./components/TimeControl";
import RatingControl from "./components/RatingControl";
import ColourControl from "./components/ColourControl";
import Grid from "@material-ui/core/Grid";
import Button from "@material-ui/core/Button";
import Divider from "@material-ui/core/Divider";
import { makeStyles } from "@material-ui/core/styles";
import { green } from "@material-ui/core/colors";
import CircularProgress from "@material-ui/core/CircularProgress";

import { challengeAI, getEventStream } from "../lichess";

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

const StartGame = ({ gamesInProgress, startNewGame }) => {
  const classes = useStyles();
  const [time, setTime] = useState("10+0");
  const [rating, setRating] = useState("800-1000");
  const [colour, setColour] = useState("R");
  const [findingGame, setFindingGame] = useState(false);

  const getNewGameId = (gamesInProgress, startNewGame) => {
    getEventStream().then((stream) => {
      let read;
      const reader = stream.getReader();
      reader.read().then(
        (read = ({ done, value }) => {
          if (done && done === true) {
            return;
          }

          if (value.type && value.type === "gameStart") {
            if (!gamesInProgress.includes(value.game.id)) {
              reader.cancel(`Got gameId ${value.game.id}`);
              setFindingGame(false);
              startNewGame(value.game.id);
            }
          }

          return reader.read().then(read);
        })
      );
    });
  };

  useEffect(() => {
    getNewGameId(
      gamesInProgress.map((g) => g.gameId),
      startNewGame
    );
  }, [startNewGame]);

  return (
    <Grid container spacing={2}>
      <Grid item xs={6}>
        <TimeControl time={time} setTime={setTime} />
      </Grid>
      <Grid item xs={6}>
        <RatingControl rating={rating} setRating={setRating} />
      </Grid>
      <Grid item xs={6}>
        <ColourControl colour={colour} setColour={setColour} />
      </Grid>
      <Grid item xs={12}>
        <Divider variant="middle" />
      </Grid>
      <Grid item xs={12}>
        <div className={classes.wrapper}>
          <Button
            variant="contained"
            fullWidth={true}
            disabled={findingGame}
            onClick={() => {
              setFindingGame(true);
              challengeAI(1);
            }}
          >
            {findingGame ? "Seeking Opponent..." : "Seek"}
          </Button>
          {findingGame && (
            <CircularProgress size={24} className={classes.buttonProgress} />
          )}
        </div>
      </Grid>
    </Grid>
  );
};

export default StartGame;
