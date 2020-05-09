import React, { useState, useEffect } from "react";

import { getProfile } from "./lichess";

import "./App.css";

import Home from "./Home";
import PlayGame from "./PlayGame";
import Loading from "./Loading";

const App = () => {
  const [myProfile, setMyProfile] = useState(null);
  const [gameId, setGameId] = useState(null);

  useEffect(() => {
    getProfile().then((profile) => {
      setMyProfile(profile);
    });
  }, []);

  if (myProfile) {
    if (!gameId) {
      return <Home setGameId={setGameId} />;
    } else {
      return <PlayGame myProfile={myProfile} gameId={gameId} />;
    }
  } else {
    return <Loading />;
  }
};

export default App;
