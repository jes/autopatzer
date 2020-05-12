import React, { useState, useEffect } from "react";

import { exec } from "child_process";
import useInterval from "use-interval";
import swal from "sweetalert";

import { Box, Grid, Button, Divider, Modal } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";

import { getNowPlaying } from "../lichess";

import GamesInProgress from "./components/GamesInProgress";
import FindGame from "./components/FindGame";

import { logger } from "../log";

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

  const [modalOpen, setModalOpen] = useState(false);
  const [gamesInProgress, setGamesInProgress] = useState([]);
  const [ip, setIP] = useState(null);

  const handleModalOpen = () => setModalOpen(true);
  const handleModalClose = () => setModalOpen(false);

  const [checkedGamesInProgress, setCheckedGamesInProgress] = useState(false);

  const getGamesInProgress = () => {
    getNowPlaying().then(({ nowPlaying }) => {
      logger.info({ event: "lichess-now-playing", data: nowPlaying });
      setGamesInProgress(nowPlaying);
      setCheckedGamesInProgress(true);
    });
  };

  const startGame = (gameId) => {
    if (modalOpen) {
      handleModalClose();
    }
    setGameId(gameId);
  };

  const shutdown = () => {
    swal({
      title: 'Power off?',
      title: 'Are you sure you want to power the system off?',
      icon: 'warning',
      buttons: true,
      dangerMode: true,
    }).then((reallyPowerOff) => {
      if (reallyPowerOff) {
        exec("./poweroff");
        require("electron").remote.getCurrentWindow().close();
      }
    });
  };

  useEffect(() => {
    exec(
      "ip route get 1 | head -n1 | sed 's/.* src //' | sed 's/ .*//'",
      (error, stdout, stderr) => {
        setIP(stdout);
      }
    );
  }, []);

  useEffect(() => {
    getGamesInProgress();
  }, []);

  useInterval(() => {
    getGamesInProgress();
  }, 5000);

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
          <Box height="310px">
            <GamesInProgress
              gamesInProgress={gamesInProgress}
              checkedGames={checkedGamesInProgress}
              startGame={startGame}
            />
          </Box>
        </Grid>
        <Grid item xs={12}>
          <Divider variant="middle" />
        </Grid>
        <Grid
          item
          xs={6}
          style={{
            display: "flex",
            alignItems: "center",
          }}
        >
          <Box
            textAlign="left"
            fontFamily="monospace"
            fontSize="h6.fontSize"
            pl={2}
          >
            {ip}
          </Box>
        </Grid>
        <Grid item xs={6}>
          <Box align="right" pr={2}>
            <Button variant="contained" color="secondary" onClick={shutdown}>
              Power off
            </Button>
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
