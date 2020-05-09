import React, { useState, useEffect } from "react";
import {
  Container,
  Modal,
  Button,
  Grid,
  Box,
  Divider,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";

import "./App.css";
import Game from "./Game";
import StartGame from "./StartGame";
import GamesInProgress from "./components/GamesInProgress";
import { getProfile, getNowPlaying } from "./lichess";

const useStyles = makeStyles(() => ({
  modal: {
    position: "absolute",
    width: "90%",
    top: "50%",
    left: "50%",
    transform: `translate(-50%, -50%)`,
    backgroundColor: "#fff",
    border: "1px solid #000",
    outline: 0,
  },
}));

const App = () => {
  const classes = useStyles();

  const [gameId, setGameId] = useState(null);
  const [myProfile, setMyProfile] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [gamesInProgress, setGamesInProgress] = useState([]);
  const [ip, setIP] = useState(null);

  const handleModalOpen = () => setModalOpen(true);
  const handleModalClose = () => setModalOpen(false);

  let nowPlayingGamesInterval;

  const { exec } = require('child_process');
  exec('ip route get 1 | head -n1 | sed \'s/.* src //\' | sed \'s/ .*//\'', (error, stdout, stderr) => {
    setIP(stdout);
  });

  useEffect(() => {
    getProfile().then((profile) => {
      setMyProfile(profile);
    });
  }, []);

  useEffect(() => {
    nowPlayingGamesInterval = setInterval(() => {
      getNowPlaying().then(({ nowPlaying }) => {
        setGamesInProgress(nowPlaying);
      });
    }, 1000);
  }, []);

  const startNewGame = (gameId) => {
    if (modalOpen) {
      handleModalClose();
    }
    setGameId(gameId);
    if (nowPlayingGamesInterval) {
      clearInterval(nowPlayingGamesInterval);
      nowPlayingGamesInterval = false;
    }
  };

  return (
    <div className="App">
      <Container>
        {!gameId && (
          <Box p={2}>
            <Grid container spacing={2}>
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
              <Grid item xs={12}>
                <Divider variant="middle" />
              </Grid>
              {gamesInProgress.length > 0 && (
                <>
                <Grid item xs={12}>
                  <GamesInProgress
                    gamesInProgress={gamesInProgress}
                    startNewGame={startNewGame}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Divider variant="middle" />
                </Grid>
                </>
              )}
              <Grid item>{ip}</Grid>
            </Grid>
          </Box>
        )}
        <Modal open={modalOpen} onClose={handleModalClose}>
          <Box className={classes.modal} p={2}>
            <StartGame
              gamesInProgress={gamesInProgress}
              startNewGame={startNewGame}
            />
          </Box>
        </Modal>
        {myProfile && gameId && <Game myProfile={myProfile} gameId={gameId} />}
      </Container>
    </div>
  );
};

export default App;
