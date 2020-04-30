import React, { useState, useEffect } from "react";
import Container from "@material-ui/core/Container";
import Modal from "@material-ui/core/Modal";
import Button from "@material-ui/core/Button";
import Grid from "@material-ui/core/Grid";
import { makeStyles } from "@material-ui/core/styles";

import "./App.css";
import StartGame from "./StartGame";
import Game from "./Game";

import { getProfile } from "./lichess";

const useStyles = makeStyles((theme) => ({
  paper: {
    position: "absolute",
    width: "95%",
    height: "95%",
    top: "50%",
    left: "50%",
    transform: `translate(-50%, -50%)`,
    backgroundColor: theme.palette.background.paper,
    boxSizing: "border-box",
    border: "2px solid #000",
    boxShadow: theme.shadows[5],
    padding: theme.spacing(2, 4, 3),
  },
}));

const App = () => {
  const classes = useStyles();

  const [open, setOpen] = useState(false);
  const [userId, setUserId] = useState(null);
  const [gameId, setGameId] = useState(null);

  const handleOpen = () => setOpen(true);

  const handleClose = () => setOpen(false);

  const startNewGame = (gameId) => {
    setGameId(gameId);
    handleClose();
  };

  useEffect(() => {
    getProfile().then((profile) => {
      setUserId(profile.id);
    });
  }, []);

  return (
    <div className="App">
      <Container>
        {/* <Grid container spacing={3}>
          <Grid item xs={12}>
            <Button
              variant="contained"
              color="primary"
              fullWidth={true}
              onClick={handleOpen}
            >
              Find a Game
            </Button>
          </Grid>
          <Grid item xs={12}>
            {gameId}
          </Grid>
        </Grid>
        <Modal open={open} onClose={handleClose}>
          <div className={classes.paper}>
            <StartGame startNewGame={startNewGame} />
          </div>
        </Modal> */}
        {userId && <Game userId={userId} gameId={"wqAnxR7V"} />}
      </Container>
    </div>
  );
};

export default App;
