import React, { useState, useEffect } from "react";
import Container from "@material-ui/core/Container";
import Modal from "@material-ui/core/Modal";
import Button from "@material-ui/core/Button";
import Grid from "@material-ui/core/Grid";
import { makeStyles } from "@material-ui/core/styles";

import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import Box from "@material-ui/core/Box";

import "./App.css";
import StartGame from "./StartGame";
import Game from "./Game";
import PlayerColour from "./Game/components/PlayerColour";

import { getProfile, getNowPlaying } from "./lichess";

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

  icon: {
    color: "#000",
  },
}));

const App = () => {
  const classes = useStyles();

  const [gameId, setGameId] = useState(null);
  const [myProfile, setMyProfile] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [gamesInProgress, setGamesInProgress] = useState([]);
  const [resetAutopatzerd, setResetAutopatzerd] = useState(false);

  const handleModalOpen = () => setModalOpen(true);
  const handleModalClose = () => setModalOpen(false);

  useEffect(() => {
    getProfile().then((profile) => {
      setMyProfile(profile);
    });
  }, []);

  useEffect(() => {
    getNowPlaying().then(({ nowPlaying }) => {
      setGamesInProgress(nowPlaying);
    });
  }, []);

  const startNewGame = (gameId, resetAutopatzerd) => {
    setGameId(gameId);
    setResetAutopatzerd(resetAutopatzerd);
    if (modalOpen) {
      handleModalClose();
    }
  };

  const inProgressGamesList = gamesInProgress.map((g) => {
    const matchString = `${g.isMyTurn ? "Your" : "Their"} move in ${
      g.variant.name
    } (${g.speed}) against ${g.opponent.username} (${g.gameId})`;
    return (
      <ListItem
        button
        onClick={() => {
          startNewGame(g.gameId, false);
        }}
        key={g.gameId}
      >
        <ListItemIcon className={classes.icon}>
          <PlayerColour colour={g.color} />
        </ListItemIcon>
        <ListItemText primary={matchString}></ListItemText>
      </ListItem>
    );
  });

  return (
    <div className="App">
      <Container>
        {!gameId && (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Box textAlign="center" fontWeight="fontWeightBold">
                Games In-Progress
              </Box>
              <List>{gamesInProgress && inProgressGamesList}</List>
            </Grid>
            <Grid item xs={12}>
              <Box textAlign="center" fontWeight="fontWeightBold">
                OR
              </Box>
            </Grid>
            <Grid item xs={12}>
              <Button
                variant="contained"
                color="primary"
                fullWidth={true}
                onClick={handleModalOpen}
              >
                Find a New Game
              </Button>
            </Grid>
          </Grid>
        )}
        <Modal open={modalOpen} onClose={handleModalClose}>
          <div className={classes.paper}>
            <StartGame
              gamesInProgress={gamesInProgress}
              startNewGame={startNewGame}
            />
          </div>
        </Modal>
        {myProfile && gameId && <Game myProfile={myProfile} gameId={gameId} />}
        {/* {myProfile && <Game myProfile={myProfile} gameId={"YL9PiEYN"} />} */}
      </Container>
    </div>
  );
};

export default App;
