import React, { useState, useEffect } from "react";

import { exec } from "child_process";

import { Box, Grid, Button, Divider, Modal } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";

import { getNowPlaying } from "../lichess";

import GamesInProgress from "./components/GamesInProgress";
import FindGame from "./components/FindGame";

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

const Home = ({ setGameId }) => {
  const classes = useStyles();

  let nowPlayingGamesInterval;

  const [modalOpen, setModalOpen] = useState(false);
  const [gamesInProgress, setGamesInProgress] = useState([]);
  const [ip, setIP] = useState(null);

  const handleModalOpen = () => setModalOpen(true);
  const handleModalClose = () => setModalOpen(false);

  useEffect(() => {
    exec(
      "ip route get 1 | head -n1 | sed 's/.* src //' | sed 's/ .*//'",
      (error, stdout, stderr) => {
        setIP(stdout);
      }
    );
  }, []);

  useEffect(() => {
    getNowPlaying().then(({ nowPlaying }) => {
      setGamesInProgress(nowPlaying);
    });

    nowPlayingGamesInterval = setInterval(() => {
      getNowPlaying().then(({ nowPlaying }) => {
        setGamesInProgress(nowPlaying);
      });
    }, 2000);
  }, []);

  const startGame = (gameId) => {
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
        <Grid item xs={12}>
          <Box height="320px">
            {gamesInProgress.length > 0 && (
              <GamesInProgress
                gamesInProgress={gamesInProgress}
                startGame={startGame}
              />
            )}
          </Box>
        </Grid>
        <Grid item xs={12}>
          <Divider variant="middle" />
        </Grid>
        <Grid item xs={12}>
          <Box textAlign="center" fontFamily="monospace" fontSize="h6.fontSize">
            {ip}
          </Box>
        </Grid>
      </Grid>
      <Modal open={modalOpen} onClose={handleModalClose}>
        <Box className={classes.modal} p={2}>
          <FindGame gamesInProgress={gamesInProgress} startGame={startGame} />
        </Box>
      </Modal>
    </Box>
  );
};

export default Home;